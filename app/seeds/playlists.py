from app.models import Playlist, db, environment, SCHEMA
from sqlalchemy.sql import text
from random import sample, randint
from datetime import datetime

def playlist_seed_data(all_users, all_songs):
    playlist1 = Playlist(title="Rock Playlist", playlist_pic="No Image", user_id=1, songs=all_songs[0:10], release_date=datetime.strptime("2021-05-15", "%Y-%m-%d"))
    playlist2 = Playlist(title="Pop Playlist", playlist_pic="No Image", user_id=2, songs=all_songs[10:20], release_date=datetime.strptime("2023-07-27", "%Y-%m-%d"))
    playlist3 = Playlist(title="Electronic Playlist", playlist_pic="No Image", user_id=3, songs=all_songs[20:30], release_date=datetime.strptime("2021-03-08", "%Y-%m-%d"))
    playlist4 = Playlist(title="Alternative Playlist", playlist_pic="No Image", user_id=4,  songs=all_songs[30:40], release_date=datetime.strptime("2018-04-07", "%Y-%m-%d"))
    playlist5 = Playlist(title="Hauntology Playlist", playlist_pic="No Image", user_id=5, songs=all_songs[40:50], release_date=datetime.strptime("2017-05-05", "%Y-%m-%d"))
    playlist6 = Playlist(title="Classical Playlist", playlist_pic="No Image", user_id=6, songs=all_songs[50:60], release_date=datetime.strptime("2024-01-01", "%Y-%m-%d"))
    playlist7 = Playlist(title="Rap Playlist", playlist_pic="No Image", user_id=7,  songs=all_songs[60:70], release_date=datetime.strptime("2020-03-19", "%Y-%m-%d"))
    playlist8 = Playlist(title="Indie Playlist", playlist_pic="No Image", user_id=8,  songs=all_songs[70:80], release_date=datetime.strptime("2021-05-09", "%Y-%m-%d"))
    playlist9 = Playlist(title="Country Playlist", playlist_pic="No Image", user_id=9,  songs=all_songs[80:90], release_date=datetime.strptime("2022-08-09", "%Y-%m-%d"))
    playlist10 = Playlist(title="Metal Playlist", playlist_pic="No Image", user_id=10,  songs=all_songs[90:100], release_date=datetime.strptime("2014-09-09", "%Y-%m-%d"))

    all_playlists=[playlist1, playlist2, playlist3, playlist4, playlist5, playlist6, playlist7, playlist8, playlist9, playlist10]

    for playlist in all_playlists:
        playlist.user = all_users[playlist.user_id]
        playlist.likes = sample(all_users, randint(0, len(all_users)))

    db.session.add_all(all_playlists)
    db.session.commit()
    return all_playlists

def undo_playlists():
    if environment == "production":
        db.session.execute(f"TRUNCATE table {SCHEMA}.playlists RESTART IDENTITY CASCADE;")
        db.session.execute(f"TRUNCATE table {SCHEMA}.playlist_likes RESTART IDENTITY CASCADE;")
        db.session.execute(f"TRUNCATE table {SCHEMA}.playlist_songs RESTART IDENTITY CASCADE;")
    else:
        db.session.execute(text("DELETE FROM playlists"))
        db.session.execute(text("DELETE FROM playlist_likes"))    
        db.session.execute(text("DELETE FROM playlist_songs"))    
    db.session.commit()