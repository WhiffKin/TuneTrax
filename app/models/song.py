from .db import db, environment, SCHEMA, add_prefix_for_prod
from enum import Enum
from datetime import datetime

class Genre(Enum):
    Electronic = "Electronic" # Trevor
    Rock = "Rock" # Trevor
    Pop = "Pop" # Trevor
    Alternative = "Alternative" # Garrett
    Hauntology = "Hauntology" # Garrett
    Classical = "Classical" # Garrett
    Indie = "Indie" # Kai
    Rap = "Rap" # Kai
    Country = "Country" # Chris
    Metal = "Metal" # Chris

class Song(db.Model):
    __tablename__ = 'songs'

    if environment == "production":
        __table_args__ = {'schema': SCHEMA}

    id = db.Column(db.Integer, primary_key=True)
    title = db.Column(db.String(255), nullable=False)
    song_link = db.Column(db.String(255), nullable=False)
    song_pic = db.Column(db.String(255), default="No Image")
    body = db.Column(db.Text)
    genre = db.Column(db.Enum(Genre), nullable=False)
    visibility = db.Column(db.Boolean, nullable=False, default=False)
    plays = db.Column(db.Integer, nullable=False, default=0)
    user_id = db.Column(db.Integer, db.ForeignKey(add_prefix_for_prod("users.id")), nullable=False)
    created_at = db.Column(db.DateTime, nullable=False, default=datetime.utcnow())
    updated_at = db.Column(db.DateTime, nullable=False, default=datetime.utcnow())

    def toDictHomePage(self):
        return {
            "id": self.id,
            "title": self.title,
            "genre": self.genre.name,
            "song_pic": self.cascade_song_picture(),
            "song_link":self.song_link
        }

    def toDictLimited(self):
        return {
            "id":self.id,
            "title":self.title,
            "genre":self.genre.name,
            "song_link":self.song_link,
            "song_pic": self.cascade_song_picture(),
            "username":self.user.username,
            "likes":len(self.likes)
        }

    def song_dict(self):
        return {
            "id": self.id,
            "title": self.title,
            "song_link": self.song_link,
            "song_pic": self.cascade_song_picture(),
            "body": self.body,
            "genre": self.genre.name,
            "visibility": self.visibility,
            "plays": self.plays,
            "user_id": self.user_id,
            "created_at": self.created_at,
            "updated_at": self.updated_at,
            "albums": [album.album_dict() for album in self.albums],
            "playlists": [playlist.playlist_dict() for playlist in self.playlists],
            "likes": len(self.likes),
            "comments": [comment.comment_dict() for comment in self.comments],
            "user": self.user.toDictLimited()
        }
    
    def cascade_song_picture(self):
        if self.song_pic:
            return self.song_pic
        if len(self.albums):
            return self.albums[0].album_pic
        return "No Image"

    # RELATIONSHIPS: 
    # Many to Many
    albums = db.relationship(
        "Album",
        secondary="album_songs",
        back_populates="songs"
    )
    playlists = db.relationship(
        "Playlist",
        secondary="playlist_songs",
        back_populates="songs"
    )
    likes = db.relationship(
        "User",
        secondary="song_likes",
        back_populates="user_liked_songs"
    )

    # One to Many
    comments = db.relationship(
        "Comment",
        back_populates="song",
        cascade="all, delete"
    )
    user = db.relationship(
        "User",
        back_populates="songs"
    )
