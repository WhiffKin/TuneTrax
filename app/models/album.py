from .db import db, environment, SCHEMA, add_prefix_for_prod
from datetime import datetime
from .song import Genre

class Album(db.Model):
    __tablename__ = 'albums'

    if environment == "production":
        __table_args__ = {'schema': SCHEMA}

    id = db.Column(db.Integer, primary_key=True)
    title = db.Column(db.String(255), nullable=False)
    album_pic = db.Column(db.String(255), default="No Image")
    body = db.Column(db.Text)
    user_id = db.Column(db.Integer, db.ForeignKey(add_prefix_for_prod("users.id")), nullable=False)
    release_date = db.Column(db.Date, nullable=False)
    genre = db.Column(db.Enum(Genre))
    created_at = db.Column(db.DateTime, nullable=False, default=datetime.utcnow())
    updated_at = db.Column(db.DateTime, nullable=False, default=datetime.utcnow())

    def toDict(self):
        return {
            "id":self.id,
            "title":self.title,
            "album_pic":self.album_pic,
            "body":self.body,
            "user":self.user.toDictLimited(),
            "songs":[song.toDictLimited() for song in self.songs],
            "likes":[user.toDictLimited() for user in self.likes],
            "release_date":self.release_date.strftime("%Y-%m-%d"),
            "created_at":self.created_at,
            "updated_at":self.updated_at,
        }
    
    def toDictLimited(self):
        return {
            "id":self.id,
            "title":self.title,
            "album_pic":self.album_pic,
            "release_date":self.release_date.strftime("%Y-%m-%d"),
            "user":self.user.toDictAlbum(),
            "songs":[song.toDictHomePage() for song in self.songs],
            "likes":len(self.likes),
            "genre": self.genre.name
        }

    # RELATIONSHIPS: 
    # Many to Many
    songs = db.relationship(
        "Song",
        secondary="album_songs",
        back_populates="albums",
        cascade="all, delete"
    )
    likes = db.relationship(
        "User",
        secondary="album_likes",
        back_populates="user_liked_albums"
    )

    # One to Many
    user = db.relationship(
        "User",
        back_populates="albums"
    )

    def album_dict(self):
        return {
            "id": self.id,
            "title": self.title,
            "album_pic": self.album_pic,
            "body": self.body,
            "user_id": self.user_id,
            "release_date": self.release_date,
            "created_at": self.created_at,
            "updated_at": self.updated_at,
        }
