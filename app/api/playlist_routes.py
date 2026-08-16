from flask import Blueprint, jsonify, request, json
from flask_login import login_required, current_user
from app.models import Playlist, Song, User, db
from app.forms import PlaylistForm, SongForm
from datetime import datetime as dt
import app.s3_helpers as s3

playlist_routes = Blueprint('playlists', __name__)

@playlist_routes.route("/<int:id>")
def playlist_by_id(id):
    playlist = Playlist.query.get(id)
    
    return {
        "playlist":playlist.toDict()
    }

@playlist_routes.route("/<int:id>", methods=["DELETE"])
@login_required
def delete_playlist_by_id(id):
    user = User.query.get(current_user.id)
    playlist = Playlist.query.get(id)
    
    if user.id != playlist.user.id:
        return { "message": "Forbidden."}, 403

    if playlist.playlist_pic:
        s3.remove_file_from_s3(playlist.playlist_pic)
        
    db.session.delete(playlist)
    db.session.commit()
    
    return {
        "message": "Successfully deleted."
    }


@playlist_routes.route("/<int:id>", methods=["POST"])
@login_required
def update_playlist(id):
    user = User.query.get(current_user.id)
    playlist = Playlist.query.get(id)

    if user.id != playlist.user.id:
        return { "message": "Forbidden."}, 403

    form = PlaylistForm()
    form['csrf_token'].data = request.cookies['csrf_token']
    if form.validate_on_submit():
        playlist.title = form.data["title"] or playlist.title
        playlist.playlist_pic = form.data["playlist_pic"] or playlist.playlist_pic
        playlist.body = form.data["body"] or playlist.body
        playlist.user = user
        playlist.release_date = dt.strptime(form.data["release_date"] or playlist.release_date, "%Y-%m-%d")
        playlist.songs = playlist.songs
        
        db.session.add(playlist)
        db.session.commit()
        return { "playlist": playlist.toDict() }, 200
    return { "errors": form.errors }, 401    

@playlist_routes.route("/")
def all_playlists():
    playlists = Playlist.query.all()
    return {
        "playlists":[playlist.toDictLimited() for playlist in playlists]
    }

@playlist_routes.route("/new", methods=["POST"])
@login_required
def create_playlist():
    song_pass_valid = []
    song_fail_valid = []

    form_data = json.loads(request.data)
    user = User.query.get(current_user.id)

    #post songs
    for song in form_data["songs"]:
        #validate song
        if not s3.song_file(song.files["song"].filename):
            song_fail_valid.append(song.title)

        song_form = SongForm(
            title=song.title or None,
            body=song.body or None,
            genre=form_data["genre"] or None,
            visibility=form_data["privacy"] or False
        )

        if song_form.validate_on_submit():
            #post each song    
            song.filename = s3.get_unique_filename(song.filename)
            upload_song = s3.upload_file_to_s3(song)
            
            upload_pic = {"url": "No Image"}
            if "song_pic" in song.files:
                song_pic = request.files['song_pic']
                song_pic.filename = s3.get_unique_filename(song_pic.filename)
                upload_pic = s3.upload_file_to_s3(song_pic)  

            new_song = Song(
                user = user,
                title = song_form.data["title"],
                body = song_form.data["body"],
                genre = song_form.data["genre"],
                visibility = song_form.data["visibility"],
                plays = 0,
                user_id = current_user.id,
                song_link = upload_song['url'],
                song_pic = upload_pic['url']
            )

            db.session.add(new_song)
            db.session.commit()
            #add each song to list
            song_pass_valid.append(new_song)

        #if song validation fails, add that to a validations error list
    
    # should any songs fail validation, send the list back and dont create an playlist
    if len(song_fail_valid):
        return json.dumps(song_fail_valid), 400

    form = PlaylistForm()
    form['csrf_token'].data = request.cookies['csrf_token']
    if form.validate_on_submit():
        payload = Playlist(
            title=form.data["title"],
            playlist_pic=form.data["playlist_pic"],
            body=form.data["body"],
            user=user,
            release_date=dt.strptime(form.data["release_date"], "%Y-%m-%d"),
            songs=song_pass_valid
        )
        
        db.session.add(payload)
        db.session.commit()
        return { "playlist": payload.toDict() }, 200
    return { "errors": form.errors }, 401

@playlist_routes.route('/<int:id>/like/', methods=['POST', 'DELETE'])
@login_required
def add_like(id):
    found = False
    playlist = Playlist.query.get(id)
    for user in playlist.likes:
        if user.id == current_user.id:
            playlist.likes.remove(user)
            found = True
            break
    if not found:
        playlist.likes.append(current_user)
    db.session.add(playlist)
    db.session.commit()
    return {"message": "deleted like" if found else "added like"}, 202 if found else 200
