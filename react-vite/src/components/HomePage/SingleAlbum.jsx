import { Link } from "react-router-dom";
import './SingleAlbum.css'

function SingleAlbum({ album }) {
    
    function firstFiveSongs(songs) {
        const res = [];
        for (let i = 0; i < Math.min(songs?.length, 5); i++)
            res.push(songs[i]);
        return res;
    }
    if(!album && !album?.id){
        return;
    }
  
    console.log("album is: ", album)

    return (
        <div className="single-album-container">
            <Link to={`/albums/${album.id}`}>
                {album.album_pic !== "No Image" ? <img src={album.album_pic} alt={`${album.title} album picture`} className="single-album-album"/> : 
                                   <div className="default-pic album-pic"/>}
            </Link>
            <div >
                <h3>{album.title}</h3>
                <div className="first-five-songs-wrapper">
                {firstFiveSongs(album.songs).map(song => (
                    <div key={song.id} className="single-album-image-text">
                        <Link to={`/songs/${song.id}`}>
                            {song.song_pic && <img src={song.song_pic} alt={`${song.title} song picture`} className="single-album-song-picture"/>}
                        <span className="first-five-album-song-text">{song.username} -- {song.title}</span>
                        </Link>
                    </div>
                ))}
                </div>
                <h5><i className="fa-solid fa-heart"></i> {album.likes} | Trax: {(album.songs.length)} | {album.release_date} | {album.user.username} </h5>
            </div>
        </div>
    )
}

export default SingleAlbum;