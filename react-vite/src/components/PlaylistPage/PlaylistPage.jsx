import { useDispatch, useSelector } from "react-redux"
import { selectSinglePlaylist, thunkAddLike, thunkGetPlaylist } from "../../redux/playlist";
import { NavLink, useNavigate, useParams } from "react-router-dom";
import { useEffect } from "react";
import OpenModalMenuItem from "../Navigation/OpenModalMenuItem";
import DeletePlaylistModal from "../DeletePlaylistModal";
import { useState } from "react";
import "./PlaylistPage.css"
import { useSongContext } from "../../context/SongPlayerContext";
import FeatureComingSoonModal from "../FeatureComingSoonModal/FeatureComingSoonModal";

function PlaylistPage() {
    const { playlistId } = useParams();
    const dispatch = useDispatch();
    const navigate = useNavigate()
    const playlist = useSelector(selectSinglePlaylist(playlistId));
    const sessionUser = useSelector(state => state.session.user);
    const {songs, setSongs} = useSongContext();
    const [currentLikes, setCurrentLikes] = useState(0)
    const [canLike, setCanLike] = useState(false)

    
    useEffect(() => {
        dispatch(thunkGetPlaylist(playlistId));
    }, [dispatch, playlistId])


    useEffect(()=> {
        if(playlist) setCurrentLikes(playlist.likes.length)
    }, [playlist])

    const likeClick = () => {
        // const song_likes = song.likes;
        setCanLike(true)
        dispatch(thunkAddLike(playlistId, sessionUser))
            .then(result =>{ 
                
                setCurrentLikes(currentLikes + result)
                setCanLike(false)
            })
    }


    function calcDateSince(release_date){
        const timeSince = new Date() - new Date(release_date);
        const oneDay = 60 * 60 * 24 * 1000;
        const oneMonth = oneDay * 31;
        const oneYear = oneDay * 365;

        if (timeSince < oneDay) return "today"
        if (timeSince < oneMonth) return `${Math.floor(timeSince / oneDay)} day${timeSince/oneDay >= 2 ? "s":""} ago`;
        if (timeSince < oneYear) return `${Math.floor(timeSince / oneMonth)} month${timeSince/oneMonth >= 2 ? "s":""} ago`;
        return `${Math.floor(timeSince / oneYear)} year${timeSince/oneYear >= 2 ? "s":""} ago`;
    }
    
    function calcSongGenres(songs) {
        const set = new Set();
        const res = [];

        for (let song of songs)
            if (!set.has(song.genre)) {
                set.add(song.genre);
                res.push(song.genre);
            }

        return res;
    }

    function firstEightLikedPFP(likes) {
        let res = [];
        for (let i = 0; i < Math.min(likes?.length, 8); i++)
            res.push(likes[i]);
        return res;
    }

    function playSongs() {
        if (playlist) {
            const songArr = [];
            for (let song of playlist.songs) songArr.push({
                songLink: song.song_link,
                songPic: song.song_pic,
                songName: song.title,
                userId: song.user_id,
                songId: song.id
            });
            setSongs([...songArr, ...songs])
            const element = document.querySelector("audio")
            if (element) {
                element.currentTime = 0
                element.play()
            }
        }
    }

    if (!playlist) return(
        <>
            <h1>This playlist doesn&apos;t exist...</h1>
            <h5>sad noot noot</h5>
        </>
    );
    return (
        <>
            <div className="playlist-header">{/* head container */}
                <div className="playlist-header_data"> {/* Left side */}
                    <div className="playlist-header_data-top"> {/* top */}
                        <div id="playlist-header_data-top-left">
                            <div className="play-button" onClick={playSongs}><i className="fa-solid fa-play"></i></div>
                            <div>
                          
                                <h3>{playlist.title}</h3>
                                <h5>{playlist.user.username}</h5>
                            </div>
                        </div>
                        <div id="playlist-header_data-top-right">
                            <span>released: {calcDateSince(playlist.release_date)}</span>
                            <div>
                                {calcSongGenres(playlist.songs).map(genre => <span key={genre}>#{genre}</span>)}
                            </div>
                        </div>
                    </div>
                    <div> {/* bottom */}
                        {/* if not played */}
                        <div id="playlist-header_data-track-count">
                            <h2>{playlist.songs?.length}</h2>
                            <h5>TRACKS</h5>
                            {/* TODO song length */}
                        </div>
                        {/* if played */}
                        {/* TODO show waveform */}
                    </div>
                </div>
                <img src={playlist.playlist_pic} alt={`${playlist.title} cover image`}/>
            </div>
            <div className="playlist-body"> {/* body container */}
                <div className="playlist-body_left"> {/* left side - playlist/user data */}
                    <div className="playlist-body_left-top"> {/* top */}
                        <div>
                            <button onClick={()=>likeClick()} disabled={canLike}>Like</button>
                            <button className="upcoming"> <OpenModalMenuItem
                                itemText="Share"
                                modalComponent={<FeatureComingSoonModal />}

                            /></button>
                            {playlist.user.id == sessionUser?.id && <button onClick={() => navigate(`/playlists/${playlist.id}/edit`)}>Edit</button>}
                            <button onClick={() => navigator.clipboard.writeText(`https://tunetrax.onrender.com/playlists/${playlist.id}`)}>Copy Link</button>
                            {playlist.user.id == sessionUser?.id && 
                                <button>
                                    <OpenModalMenuItem
                                        itemText="Delete"
                                        modalComponent={<DeletePlaylistModal playlistId={playlistId} navigate={navigate} />}
                                    />
                                </button>
                            }
                            {/* TODO: add queue <button>add to next up</button> */}
                        </div>
                        <div>
                            <i className="fa-solid fa-heart"></i> <a>{currentLikes}</a>
                        </div>
                    </div>
                    <div className="playlist-body_left-bottom"> {/* bottom */}
                        <div className="playlist-body_left-bottom_profile"> {/* left side - user stuff */}
                            {playlist.user.profile_pic && <img className="profile-pic" src={playlist.user.profile_pic} alt={`${playlist.user?.username} profile image`}/>}
                            {!playlist.user.profile_pic && <div className="profile-pic default-pic" />}
                            {/* TODO: route to user page */} <NavLink>{playlist.user?.username}</NavLink>
                            <div>
                                <NavLink><i className="fa-solid fa-people-group"></i>{playlist.user.follows}</NavLink>
                                <NavLink><i className="fa-solid fa-record-vinyl"></i>{playlist.user.songs?.length}</NavLink>
                            </div>
                            <button className="upcoming follow-button"> <i className="fa-solid fa-user-plus" /><div className="follow-button-text"><OpenModalMenuItem
                                itemText={"Follow"}
                                modalComponent={<FeatureComingSoonModal />}

                            /></div></button>
                        </div>
                        <div className="playlist-body_left-bottom_playlist-details"> {/* right side */}
                            <span className="playlist-body_left-bottom_playlist-details_body">{playlist.body}</span>
                            {playlist.songs.map((song, index) => (
                                <NavLink to={`/songs/${song.id}`} className="playlist-body_left-bottom_song-details" key={song.id}>
                                    <img src={song.song_pic} alt={`${song.title} song image`}/>
                                    <span>{index + 1}</span>
                                    <span>{song.username} - {song.title}</span>
                                    <span><i className="fa-solid fa-heart"></i> {song.likes}</span>
                                </NavLink>
                            ))}
                        </div>
                    </div>
                </div>
                <div className="playlist-body_right"> {/* right side - user albums, user playlists, likes, reposts */}
                    <div className="playlist-body_right_container">
                        <div className="playlist-body_right_container_header">
                            <span>Playlists from this user</span>
                            {/* TODO: route to user page/playlists */}<NavLink>View All</NavLink>
                        </div>
                        {playlist.user.albums?.map(album => (
                            <div className="album-body_right_container_set" key={album.id}>
                                <NavLink to={`/albums/${album.id}`}>
                                    <img src={album.album_pic} alt={`${album.title} album image`}/>
                                </NavLink>
                                <div>
                                    <NavLink>{playlist.user.username}</NavLink>
                                    <NavLink to={`/albums/${album.id}`}>{album.title}</NavLink>
                                    <span>Album &bull; {new Date(album.release_date).getFullYear()}</span>
                                </div>
                            </div>
                        ))}
                    </div>
                    <div className="playlist-body_right_container">
                        <div className="playlist-body_right_container_header">
                            <span>Playlists from this user</span>
                            {/* TODO: route to user page/plsylists */}<NavLink>View All</NavLink>
                        </div>
                        {playlist.user.playlists.map(new_playlist => new_playlist.id != playlist.id ? (
                            <div className="playlist-body_right_container_set" key={playlist.id}>
                                <NavLink to={`/playlists/${new_playlist.id}`}>
                                    <img src={new_playlist.playlist_pic} alt={`${new_playlist.title} playlist image`}/>
                                </NavLink>
                                <div>
                                    <NavLink>{playlist.user?.username}</NavLink>
                                    <NavLink to={`/playlists/${new_playlist.id}`}>{new_playlist.title}</NavLink>
                                    <span>Playlist &bull; {new Date(new_playlist.created_at).getFullYear()}</span>
                                </div>
                            </div>
                        ) : (null))}
                    </div>
                    <div className="playlist-body_right_container">
                        <div className="playlist-body_right_container_header">
                            <span>{playlist.likes?.length} likes</span>
                            {/* TODO: route to user page/plsylists */}<NavLink>View All</NavLink>
                        </div>
                        <div className="playlist-body_right_container_likes">
                            {firstEightLikedPFP(playlist.likes).map(like_user => (
                                <div key={like_user.id}>
                                    {like_user.profile_pic && <img className="profile-pic_likes" src={like_user.profile_pic} alt={`${like_user?.username} profile image`}/>}
                                    {!like_user.profile_pic && <div className="profile-pic_likes default-pic"/>}
                                </div>)
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </>
    );
}

export default PlaylistPage