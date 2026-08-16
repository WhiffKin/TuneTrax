from flask import Blueprint, request
from app.models import Song, db, Comment, User
from flask_login import login_required, current_user
from datetime import datetime
import app.s3_helpers as s3
from app.forms import SongForm, CommentForm

song_routes = Blueprint('songs', __name__)

# Helper function for posting a song with a validated songForm 
def post_song(songForm):
    song = songForm.data["song_file"]

    song.filename = s3.get_unique_filename(song.filename)
    upload_song = s3.upload_file_to_s3(song)
    
    upload_pic = {"url": "No Image"}

    song_pic = songForm.data['song_pic']
    if song_pic:
        song_pic.filename = s3.get_unique_filename(song_pic.filename)
        upload_pic = s3.upload_file_to_s3(song_pic)   
    
    user = User.query.get(current_user.id)
    new_song = Song(
        user = user,
        title = songForm.data["title"],
        body = songForm.data["body"],
        genre = songForm.data["genre"],
        visibility = songForm.data["visibility"],
        plays = 0,
        user_id = current_user.id,
        song_link = upload_song['url'],
        song_pic = upload_pic['url']
    )

    db.session.add(new_song)
    db.session.commit()
    return new_song

#Get all song routes
@song_routes.route('/')
def songs():
    pagination = request.args.get("genres").rsplit('-')
    if pagination:
        songs = Song.query.filter(Song.genre.in_(pagination)).all()
    else:
        songs = Song.query.all()    
    return {song.id:song.toDictHomePage() for song in songs}

#Get single song and play it
@song_routes.route('/<int:id>/play')
def single_song_play(id):
    song = Song.query.get(id)

    return song.toDictLimited()

#Get a single song
@song_routes.route('/<int:id>')
def single_song(id):
    song = Song.query.get(id)

    return song.song_dict()


#Upload a song
@song_routes.route('/', methods=["POST"])
@login_required
def post_song_route():
    form = SongForm()
    form['csrf_token'].data = request.cookies['csrf_token']    
    if form.validate_on_submit():
        new_song = post_song(form)
        return new_song.song_dict()
    
    return {"errors": form.errors}, 401

#Edit a song by song id
#Need AWS framework implemented
@song_routes.route('/<int:id>/', methods=["POST"])
@login_required
def update_song(id):
    song = Song.query.get(id)

    if not song:
        return {"errors": "Song not found"}, 404
    
    updated_song = SongForm()
    updated_song['csrf_token'].data = request.cookies['csrf_token']
    print("updated song is: ", updated_song)
    
    if updated_song.validate_on_submit():
        song.title = updated_song.title.data
        song.body = updated_song.body.data
        song.genre = updated_song.genre.data
        
        if updated_song.visibility:
            song.visibility = updated_song.visibility.data

        db.session.add(song)
        db.session.commit()

        return song.song_dict()
    return {"errors":updated_song.errors}, 403

#Delete a song by id
#Need to remove file from aws s3
@song_routes.route('/<int:id>/', methods=["DELETE"])
@login_required
def delete_song(id):
    song = Song.query.get(id)

    if not song:
        return {"Error": "Song not found"}, 404

    if song.song_pic:
        s3.remove_file_from_s3(song.song_pic)
    
    s3.remove_file_from_s3(song.song_link)

    db.session.delete(song)
    db.session.commit()

    return {"Message": "Successfully Deleted"}

# Post a new comment on the song
@song_routes.route('/<int:id>/comments', methods=["POST"])
@login_required
def post_song_comment(id):
    form = CommentForm()
    form['csrf_token'].data = request.cookies['csrf_token']

    if form.validate_on_submit():
        comment = Comment(
            comment = form.data["comment"],
            user_id = current_user.id,
            song_id = id,
            song_time = form.data["song_time"],
            created_at = datetime.utcnow(),
            updated_at = datetime.utcnow()
        )
        db.session.add(comment)
        db.session.commit()
        return comment.comment_dict()
    return {"Error": "Unable to create comment"}

# Delete a comment from the song
@song_routes.route('/<int:_id>/comments/<int:c_id>', methods=["DELETE"])
@login_required
def delete_song_comment(_id, c_id):
    """
    Delete a song comment by accessing the song, and deleting the comment from it.
    """
    comment = Comment.query.get(c_id)
    if not comment:
        return {"Error": "Cannot find comment"}
    db.session.delete(comment)
    db.session.commit()
    return {"message": "Deleted successful"}

# Edit a comment
@song_routes.route('/<int:_id>/comments/<int:c_id>', methods=["POST"])
@login_required
def edit_song_comment(_id, c_id):
    """
    Edit a song comment by accessing it via comments id and adding form to it.
    """

    comment = Comment.query.get(c_id)
    form = CommentForm()
    form['csrf_token'].data = request.cookies['csrf_token']

    
    if form.validate_on_submit() and comment.user_id == current_user.id:
        print("form data is: ", form.data)
        comment.comment = form.data['comment']
        comment.updated_at = datetime.utcnow()
        db.session.add(comment)
        db.session.commit()
        return comment.comment_dict()
    else:
        return {"Error": form.errors}


# Add a Like
@song_routes.route('/<int:id>/like', methods=['POST', 'DELETE'])
@login_required
def add_like(id):
    """
    Add a like to the song by appending the user to the likes.
    """
    found = False
    song = Song.query.get(id)
    for user in song.likes:
        if user.id == current_user.id:
            song.likes.remove(user)
            found = True
            break
    if not found:
        song.likes.append(current_user)
    db.session.add(song)
    db.session.commit()
    return {"message": "deleted like" if found else "added like"}, 202 if found else 200
