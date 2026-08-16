import { useDispatch, useSelector } from "react-redux"
import { selectSingleAlbum, thunkAddAlbumLike, thunkGetAlbum } from "../../redux/album";
import { NavLink, useNavigate, useParams } from "react-router-dom";
import { useEffect } from "react";
import OpenModalMenuItem from "../Navigation/OpenModalMenuItem";
import DeleteAlbumModal from "../DeleteAlbumModal";
import "./AlbumPage.css"
import { useState } from "react";
import { useSongContext } from "../../context/SongPlayerContext";
import FeatureComingSoonModal from "../FeatureComingSoonModal/FeatureComingSoonModal";


function AlbumPage() {
    const { albumId } = useParams();
    const dispatch = useDispatch();
    const navigate = useNavigate()
    const album = useSelector(selectSingleAlbum(albumId));
    const sessionUser = useSelector(state => state.session.user);
    const { songs, setSongs } = useSongContext();
    const [albumLikes, setAlbumLikes] = useState(0)
    const [canLike, setCanLike] = useState(false)

    useEffect(() => {
        if (album?.likes) setAlbumLikes(album.likes?.length)
    }, [album])


    useEffect(() => {
        dispatch(thunkGetAlbum(albumId));
    }, [dispatch, albumId])

    function calcDateSince(release_date) {
        const timeSince = new Date() - new Date(release_date);
        const oneDay = 60 * 60 * 24 * 1000;
        const oneMonth = oneDay * 31;
        const oneYear = oneDay * 365;

        if (timeSince < oneDay) return "today"
        if (timeSince < oneMonth) return `${Math.floor(timeSince / oneDay)} day${timeSince / oneDay >= 2 ? "s" : ""} ago`;
        if (timeSince < oneYear) return `${Math.floor(timeSince / oneMonth)} month${timeSince / oneMonth >= 2 ? "s" : ""} ago`;
        return `${Math.floor(timeSince / oneYear)} year${timeSince / oneYear >= 2 ? "s" : ""} ago`;
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

    const likeClick = () => {
        setCanLike(true)
        dispatch(thunkAddAlbumLike(albumId, sessionUser))
            .then(result => {
                setAlbumLikes(albumLikes + result),
                    setCanLike(false)
            })

    }

    function firstEightLikedPFP(likes) {
        let res = [];
        for (let i = 0; i < Math.min(likes?.length, 8); i++)
            res.push(likes[i]);
        return res;
    }

    function playSongs() {
        if (album) {
            const songArr = [];
            for (let song of album.songs) songArr.push({
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

    if (!album) return (
        <>
            <h1>This album doesn&apos;t exist...</h1>
            <h5>sad noot noot</h5>
        </>
    );
    return (
        <>
            <div className="album-header">{/* head container */}
                <div className="album-header_data"> {/* Left side */}
                    <div className="album-header_data-top"> {/* top */}
                        <div id="album-header_data-top-left">
                            <div className="play-button" onClick={playSongs}><i className="fa-solid fa-play"></i></div>
                            <div>
                                <h3>{album.title}</h3>
                                <h5>{album.user.username}</h5>
                            </div>
                        </div>
                        <div id="album-header_data-top-right">
                            <span>released: {calcDateSince(album.release_date)}</span>
                            <div>
                                {calcSongGenres(album.songs).map(genre => <span key={genre}>#{genre}</span>)}
                            </div>
                        </div>
                    </div>
                    <div> {/* bottom */}
                        {/* if not played */}
                        <div id="album-header_data-track-count">
                            <h2>{album.songs?.length}</h2>
                            <h5>TRACKS</h5>
                            {/* TODO song length */}
                        </div>
                        {/* if played */}
                        {/* TODO show waveform */}
                    </div>
                </div>
                {album.album_pic !== "No Image" ? <img src={album.album_pic} alt={`${album.title} cover image`} /> : <div className="album-header-default-pic default-pic" />}
            </div>
            <div className="album-body"> {/* body container */}
                <div className="album-body_left"> {/* left side - album/user data */}
                    <div className="album-body_left-top"> {/* top */}
                        <div>
                            <button onClick={() => likeClick()} disabled={canLike}>Like</button>
                            <button className="upcoming"> <OpenModalMenuItem
                                itemText="Share"
                                modalComponent={<FeatureComingSoonModal />}

                            /></button>
                            {album.user.id == sessionUser?.id && <button onClick={() => navigate(`/albums/${album.id}/edit`)}>Edit</button>}
                            <button onClick={() => navigator.clipboard.writeText(`https://tunetrax.onrender.com/albums/${album.id}`)}>Copy Link</button>
                            {album.user.id == sessionUser?.id &&
                                <button>
                                    <OpenModalMenuItem
                                        itemText="Delete"
                                        modalComponent={<DeleteAlbumModal albumId={albumId} navigate={navigate} />}
                                    />
                                </button>
                            }
                            {/* TODO: add queue <button>add to next up</button> */}
                        </div>
                        <div onClick={() => likeClick()} disabled={canLike}>
                            <i className="fa-solid fa-heart"></i> {albumLikes}
                        </div>
                    </div>
                    <div className="album-body_left-bottom"> {/* bottom */}
                        <div className="album-body_left-bottom_profile"> {/* left side - user stuff */}
                            {album.user.profile_pic && <img className="profile-pic" src={album.user.profile_pic} alt={`${album.user.username} profile image`} />}
                            {!album.user.profile_pic && <div className="profile-pic default-pic" />}
                            {/* TODO: route to user page */} <NavLink>{album.user.username}</NavLink>
                            <div>
                                <NavLink><i className="fa-solid fa-people-group"></i>{album.user.follows}</NavLink>
                                <NavLink><i className="fa-solid fa-record-vinyl"></i>{album.user.songs?.length}</NavLink>
                            </div>
                            {/* <button onClick={()=>window.alert("Feature coming soon")}><i className="fa-solid fa-user-plus"></i> Follow</button> */}

                            <button className="upcoming follow-button"> <i className="fa-solid fa-user-plus" /><div className="follow-button-text"><OpenModalMenuItem
                                itemText={"Follow"}
                                modalComponent={<FeatureComingSoonModal />}

                            /></div></button>

                        </div>
                        <div className="album-body_left-bottom_album-details"> {/* right side */}
                            <span className="album-body_left-bottom_album-details_body">{album.body}</span>
                            {album.songs.map((song, index) => (
                                <NavLink to={`/songs/${song.id}`} className="album-body_left-bottom_song-details" key={song.id}>
                                    <img src={song.song_pic} alt={`${song.title} song image`} />
                                    <span>{index + 1}</span>
                                    <span>{song.username} - {song.title}</span>
                                    <span><i className="fa-solid fa-heart"></i> {song.likes}</span>
                                </NavLink>
                            ))}
                        </div>
                    </div>
                </div>
                <div className="album-body_right"> {/* right side - user albums, user playlists, likes, reposts */}
                    <div className="album-body_right_container">
                        <div className="album-body_right_container_header">
                            <span><i className="fa-solid fa-layer-group"></i> Albums from this user</span>
                            {/* TODO: route to user page/albums */}<NavLink>View All</NavLink>
                        </div>
                        {album.user.albums?.map(new_album => new_album.id != album.id ? (
                            <div className="album-body_right_container_set" key={new_album.id}>
                                <NavLink to={`/albums/${new_album.id}`}>
                                    {new_album.album_pic !== "No Image" ? <img src={new_album.album_pic} alt={`${new_album.title} album image`} /> : <div className="default-pic album-body_right_container_set-default" />}
                                </NavLink>
                                <div>
                                    <NavLink>{album.user.username}</NavLink>
                                    <NavLink to={`/albums/${new_album.id}`}>{new_album.title}</NavLink>
                                    <span>Album &bull; {new Date(new_album.release_date).getFullYear()}</span>
                                </div>
                            </div>
                        ) : (null))}
                    </div>
                    <div className="album-body_right_container">
                        <div className="album-body_right_container_header">
                            <span><i className="fa-solid fa-layer-group"></i> Playlists from this user</span>
                            {/* TODO: route to user page/plsylists */}<NavLink>View All</NavLink>
                        </div>
                        {album.user.playlists?.map(playlist => (
                            <div className="album-body_right_container_set" key={playlist.id}>
                                <NavLink to={`/playlists/${playlist.id}`}>
                                    {playlist.playlist_pic !== "No Image" ? <img src={playlist.playlist_pic} alt={`${playlist.title} playlist image`} /> : <div className="default-pic album-body_right_container_set-default" />}

                                </NavLink>
                                <div>
                                    <NavLink>{album.user.username}</NavLink>
                                    <NavLink to={`/playlists/${playlist.id}`}>{playlist.title}</NavLink>
                                    <span>Playlist &bull; {new Date(playlist.created_at).getFullYear()}</span>
                                </div>
                            </div>
                        ))}
                    </div>
                    <div className="album-body_right_container">
                        <div className="album-body_right_container_header">
                            <span><i className="fa-solid fa-heart"></i> {album.likes?.length} likes</span>
                            {/* TODO: route to user page/plsylists */}<NavLink>View All</NavLink>
                        </div>
                        <div className="album-body_right_container_likes">
                            {firstEightLikedPFP(album.likes).map(like_user => (
                                <div key={like_user.id}>
                                    {like_user.profile_pic && <img className="profile-pic_likes" src={like_user.profile_pic} alt={`${like_user.username} profile image`} />}
                                    {!like_user.profile_pic && <div className="profile-pic_likes default-pic" />}
                                </div>)
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </>
    );
}

export default AlbumPage