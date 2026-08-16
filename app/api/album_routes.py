from flask import Blueprint, jsonify, request, json
from flask_login import login_required, current_user
from app.models import Album, Song, User, db
from app.forms import AlbumForm, SongForm
from datetime import datetime as dt
from app.api.song_routes import post_song
import app.s3_helpers as s3

album_routes = Blueprint('albums', __name__)

@album_routes.route("/<int:id>")
def album_by_id(id):
    album = Album.query.get(id)
    
    return {
        "album":album.toDict()
    }

@album_routes.route("/<int:id>", methods=["DELETE"])
@login_required
def delete_album_by_id(id):
    user = User.query.get(current_user.id)
    album = Album.query.get(id)
    
    if user.id != album.user.id:
        return { "message": "Forbidden."}, 403

    if album.album_pic:
        s3.remove_file_from_s3(album.album_pic)
    
    for song in album.songs:
        if song.song_pic:
            s3.remove_file_from_s3(song.song_pic)
        s3.remove_file_from_s3(song.song_link)
        
    db.session.delete(album)
    db.session.commit()
    
    return {
        "message": "Successfully deleted."
    }


@album_routes.route("/<int:id>", methods=["POST"])
@login_required
def update_album(id):
    user = User.query.get(current_user.id)
    album = Album.query.get(id)

    if user.id != album.user.id:
        return { "message": "Forbidden."}, 403

    form = AlbumForm()
    form['csrf_token'].data = request.cookies['csrf_token']
    if form.validate_on_submit():
        album.title = form.data["title"] or album.title
        album.album_pic = form.data["album_pic"] or album.album_pic
        album.body = form.data["body"] or album.body
        album.user = user
        album.release_date = dt.strptime(form.data["release_date"] or album.release_date, "%Y-%m-%d")
        album.songs = album.songs
        
        db.session.add(album)
        db.session.commit()
        return { "album": album.toDict() }, 200
    return { "errors": form.errors }, 401    

@album_routes.route("/")
def all_albums():
    pagination = request.args.get("genres").rsplit('-')
    if pagination:
        albums = Album.query.filter(Album.genre.in_(pagination)).all()
    else:
        albums = Album.query.all()   
    
    return {
        "albums":[album.toDictLimited() for album in albums]
    }

@album_routes.route("/", methods=["POST"])
@login_required
def create_album():
    user = User.query.get(current_user.id)

    print("Im not there quite yet")
    form = AlbumForm()
    form['csrf_token'].data = request.cookies['csrf_token']
    if form.validate_on_submit():
        #post songs
        songStr = form.data["songs"]
        songs = []
        song_genres = {}
        genre = ""
        
        for songId in songStr.split(","):
            song = Song.query.get(songId)
            if song_genres[song.genre.name]:
                song_genres[song.genre.name] += 1
            else:
                song_genres[song.genre.name] = 1
            if not genre or song_genres[genre] < song_genres[song.genre.name]:
                genre = song.genre.name
            songs.append(song)

        payload = Album(
            title=form.data["title"],
            album_pic=form.data["album_pic"],
            body=form.data["body"],
            user=user,
            release_date=dt.strptime(form.data["release_date"], "%Y-%m-%d"),
            songs=songs,
            genre=genre
        )
        
        db.session.add(payload)
        db.session.commit()
        return { "album": payload.toDict() }, 200
    return { "errors": form.errors }, 401    


# Add a Like
@album_routes.route('/<int:id>/like', methods=['POST', 'DELETE'])
@login_required
def add_like(id):
    """
    Add a like to the album by appending the user to the likes.
    """
    found = False
    album = Album.query.get(id)
    for user in album.likes:
        if user.id == current_user.id:
            album.likes.remove(user)
            found = True
            break
    if not found:
        album.likes.append(current_user)
    db.session.add(album)
    db.session.commit()
    return {"message": "deleted like" if found else "added like"}, 202 if found else 200