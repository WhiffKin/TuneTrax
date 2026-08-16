import { NavLink, useNavigate, useParams } from "react-router-dom";
import { thunkGetSong, thunkEditComment, thunkAddLike } from "../../../redux/song";
import { useDispatch, useSelector } from "react-redux";
import { useEffect, useState } from "react";
import { useSongContext } from "../../../context/SongPlayerContext";
import CreateComment from "../../Comments/CreateComment/CreateComment";
// import WaveSurfer from 'wavesurfer.js'
import Waveform from "../../Waveform";
// import { selectComments } from "../../../redux/song";
import { thunkPostComment } from "../../../redux/song";
import OpenModalButton from "../../OpenModalButton/OpenModalButton";
import { useModal } from "../../../context/Modal";
import { thunkDeleteComment } from "../../../redux/song";
import "./SongPage.css"
import DeleteSongModal from "../../DeleteSongModal";
import OpenModalMenuItem from "../../Navigation/OpenModalMenuItem";
import FeatureComingSoonModal from "../../FeatureComingSoonModal/FeatureComingSoonModal";



const SongPage = () => {
    const { songId } = useParams()
    const dispatch = useDispatch()
    const navigate = useNavigate();
    const { songs, setSongs } = useSongContext()
    const [comment, setComment] = useState('')
    const [errors, setErrors] = useState([])
    const { songTime } = useSongContext()
    const { closeModal } = useModal();
    const user = useSelector(state => state.session.user)
    const [commentText, setCommentText] = useState('')
    const [editingComment, setEditingComment] = useState(-1)
    const [canLike, setCanLike] = useState(false)
    const [songComments, setSongComments] = useState([])
    const song = useSelector((state) => state.songs.songs[songId])
    const [currentLikes, setCurrentLikes] = useState(0)

    useEffect(() => {
        dispatch(thunkGetSong(songId))
    }, [dispatch, songId])


    useEffect(() => {
        if (song) {
            setCurrentLikes(song.likes)
            setSongComments(song.comments)
        }
    }, [song])


    const likeClick = () => {
        // const song_likes = song.likes;
        setCanLike(true)
        dispatch(thunkAddLike(song.id, user))
            .then(result => {
                song.likes += result
                setCurrentLikes(song.likes)
                setCanLike(false)
            })
    }

    if (!song) return (
        <>
            <h1>This song doesn&apos;t exist...</h1>
            <h5>sad noot noot</h5>
        </>
    );

    // console.log("user id is", userId)


    function PlaySong() {
        console.log("song is:", song)
        if (songs[0]?.songLink !== song.song_link) {
            setSongs([{
                songLink: song.song_link,
                songPic: song.song_pic,
                songName: song.title,
                userId: song.user_id,
                songId: song.id
            }, ...songs])
        }
        const element = document.querySelector("audio")
        if (element) {
            element.currentTime = 0
            element.play()
        }
    }

    // Delete comment handle
    const deleteComment = async (commentId) => {

        await dispatch(thunkDeleteComment(songId, commentId))


        const tempSongComments = songComments.filter((comment) => commentId !== comment.id)
        console.log("temp song comments is:", tempSongComments)
        console.log("song comments is: ", songComments)
        setSongComments(tempSongComments)
        return closeModal();
    }

    const handleSubmit = async (e) => {
        e.preventDefault();
        setErrors([]);
        const errors = []
        if (comment?.length > 255) errors.push("Comment needs to be less than 255 characters.")

        if (errors?.length > 0) {
            setErrors(errors);
            return;
        }

        const newComment = { comment, song_time: songTime }

        const postedComment = await dispatch(thunkPostComment(songId, newComment))
        setComment("")
        setSongComments([postedComment, ...songComments])
    }

    // Edit Comment functionality
    const submitEdit = async (e) => {
        e.preventDefault();
        const edits = {
            id: editingComment,
            comment: commentText
        }

        await dispatch(thunkEditComment(songId, edits))
        // await dispatch(thunkGetSong(songId))
        setEditingComment(-1)
        setSongComments(songComments.map((comment) => {
            if (comment.id === edits.id) {
                comment.comment = edits.comment
            }
            return comment;
        }))
        closeModal()
    }

    const editComment = (comment) => {
        setEditingComment(comment.id)
        setCommentText(comment.comment)
    }

    function firstEightLikedPFP(likes) {
        let res = [];
        for (let i = 0; i < Math.min(likes?.length, 8); i++)
            res.push(likes[i]);
        return res;
    }

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

    const minuteSecond = (song_time) => {
        const totalSeconds = parseFloat(song_time);
        const minutes = Math.floor(totalSeconds / 60)
        const seconds = Math.floor(totalSeconds % 60)
        const formattedTime = `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`
        return formattedTime
    }


    const postedAtDate = (created_at) => {
        const date = new Date(created_at + " UTC")
        const now = new Date()

        const timeDiff = now - date - date.getTimezoneOffset() * 60000
        const secondsDiff = Math.floor(timeDiff / 1000)
        const minutesDiff = Math.floor(secondsDiff / 60)
        const hoursDiff = Math.floor(minutesDiff / 60)
        const daysDiff = Math.floor(hoursDiff / 24)
        const monthsDiff = Math.floor(daysDiff / 30)
        const yearsDiff = Math.floor(monthsDiff / 12)

        if (yearsDiff >= 1) {
            return `${yearsDiff} year${yearsDiff !== 1 ? 's' : ''} ago`
        } else if (monthsDiff >= 1) {
            return `${monthsDiff} month${monthsDiff !== 1 ? 's' : ''} ago`
        } else if (daysDiff >= 1) {
            return `${daysDiff} day${daysDiff !== 1 ? 's' : ''} ago`
        } else {
            const happyTime = Math.max(0, hoursDiff)
            return `${happyTime} hour${happyTime !== 1 ? 's' : ''} ago`
        }
    }
    if (!song || !song.user || !song.user.username) return (
        <>
            <h1>This song doesn&apos;t exist...</h1>
            <h5>sad noot noot</h5>
        </>
    );

    console.log("song user is: ", song.user)

    return (
        <>
            <div className="song-header">{/* head container */}
                <div className="song-header_data"> {/* Left side */}
                    <div className="song-header_data-top"> {/* top */}
                        <div id="song-header_data-top-left">
                            <div className="play-button" onClick={PlaySong}><i className="fa-solid fa-play"></i></div>
                            <div>
                                <h3>{song.title}</h3>
                                <h5>{song.user?.username}</h5>
                            </div>
                        </div>
                        <div id="song-header_data-top-right">
                            <span>released: {calcDateSince(song.created_at)}</span>
                            <div>
                                <span>#{song.genre}</span>
                            </div>
                        </div>
                    </div>
                    <div> {/* bottom */}
                        {/* if not played */}
                        <div className="song-header-waveform">
                            <Waveform audio={song} />
                        </div>
                        {/* if played */}
                        {/* TODO show waveform */}
                    </div>
                </div>
                {song.song_pic !== "No Image" ? <img src={song.song_pic} alt={`${song.title} cover image`} /> : <div className="song-header-default-pic default-pic" />}

            </div>
            <div className="song-body"> {/* body container */}
                <div className="song-body_left"> {/* left side - album/user data */}
                    <div className="song-body_left-top"> {/* top */}
                        <div>
                            <button onClick={() => likeClick()} disabled={canLike} style={{ cursor: "pointer" }}>Like</button>
                            <button className="upcoming"> <OpenModalMenuItem
                                itemText="Share"
                                modalComponent={<FeatureComingSoonModal />}

                            /></button>
                            {song.user.id == user?.id && <button onClick={() => navigate(`/songs/${song.id}/edit`)}>Edit</button>}
                            <button onClick={() => navigator.clipboard.writeText(`https://tunetrax.onrender.com/songs/${song.id}`)} style={{ cursor: "pointer" }}>Copy Link</button>
                            {song.user.id == user?.id &&
                                <button>
                                    <OpenModalMenuItem
                                        itemText="Delete"
                                        modalComponent={<DeleteSongModal songId={songId} navigate={navigate} />}
                                    />
                                </button>
                            }
                            {/* TODO: add queue <button>add to next up</button> */}
                        </div>
                        <div onClick={() => likeClick()} disabled={canLike}>
                            <i className="fa-solid fa-heart"></i> {currentLikes}
                        </div>
                    </div>
                    <div className="song-body_left-bottom"> {/* bottom */}
                        <div className="song-body_left-bottom_profile"> {/* left side - user stuff */}
                            {song.user.profile_pic && <img className="profile-pic" src={song.user.profile_pic} alt={`${song.user.username} profile image`} />}
                            {!song.user.profile_pic && <div className="profile-pic default-pic" />}
                            {/* TODO: route to user page */} <NavLink>{song.user.username}</NavLink>
                            <div>
                                <NavLink><i className="fa-solid fa-people-group"></i>{song.user.follows}</NavLink>
                                <NavLink><i className="fa-solid fa-record-vinyl"></i>{song.user.songs?.length}</NavLink>
                            </div>
                            <button className="upcoming follow-button"> <i className="fa-solid fa-user-plus" /><div className="follow-button-text"><OpenModalMenuItem
                                itemText={"Follow"}
                                modalComponent={<FeatureComingSoonModal />}

                            /></div></button>
                        </div>
                        <div className="song-body_left-bottom_song-details"> {/* right side */}
                            <div className="song-comment">
                                {/* song body container */}
                                <div className="song-body-text">
                                    <h2 style={{ color: "rgba(0, 4, 51)" }}>Song Body:</h2>
                                    <h4 style={{ color: "rgba(0, 4, 51)" }}>{song.body}</h4>
                                </div>
                                <div className="song-comment-input">
                                    <form onSubmit={handleSubmit} type='submit'>
                                        <textarea
                                            placeholder="Write a comment for the song"
                                            value={comment}
                                            onChange={(e) => setComment(e.target.value)}
                                        />
                                        <input type="submit" disabled={!user} />
                                    </form>
                                </div>

                                <div className="song-comment-all">
                                    <span>
                                        {songComments
                                            ?.sort((a, b) => new Date(b.created_at) - new Date(a.created_at))
                                            .map((comment) => {
                                                return <>
                                                    <span key={comment.id} className="song-comment-eachone">
                                                        <p>
                                                            <h2 style={{ padding: "5px", color: "#FFFFAB", backgroundColor: "rgba(0, 4, 51)", borderRadius: "10px", width: "150px" }}>
                                                                <img src={comment.user.profile_pic} /> {comment.user.username}
                                                            </h2>at {minuteSecond(comment.song_time)} · {postedAtDate(comment.created_at)}
                                                        </p>
                                                        {comment.id === editingComment ? (<form onSubmit={submitEdit}>
                                                            <div style={{ padding: "20px 0px" }}>
                                                                <textarea
                                                                    value={commentText}
                                                                    placeholder={comment.comment}
                                                                    onChange={(e) => setCommentText(e.target.value)} />
                                                                <button onSubmit={submitEdit} type="submit" style={{ color: "#000433", border: "1.5px solid rgba(0, 4, 51, .3)", borderRadius: "5px", padding: "1px 5px", margin: "10px" }}>Submit Edit</button>
                                                            </div>
                                                        </form>) : <p>{comment.comment} </p>}
                                                        

                                                        {user && (comment.user.id === user.id) &&
                                                            <div className="song-page-manage-delete-buttons">
                                                                <button onClick={() => editComment(comment)} style={{ cursor: "pointer" }}>Manage Comment</button>
                                                                <OpenModalButton

                                                                    buttonText="Delete Comment"
                                                                    modalComponent={
                                                                        <div>
                                                                            <h2>Confirm Delete</h2>

                                                                            <button onClick={() => deleteComment(comment.id)} style={{ color: "#000433", border: "1.5px solid rgba(0, 4, 51, .3)", borderRadius: "5px", padding: "1px 15px", margin: "10px", backgroundColor: "#EF3E2B" }}>
                                                                                Yes
                                                                            </button>

                                                                            <button onClick={closeModal} style={{ color: "#000433", border: "1.5px solid rgba(0, 4, 51, .3)", borderRadius: "5px", padding: "1px 15px", margin: "10px", backgroundColor: "rgba(0, 4, 51, .3)" }}>
                                                                                No
                                                                            </button>
                                                                            {/* DeleteComment comment={comment} songComments={songComments} */}
                                                                        </div>}
                                                                />
                                                            </div>}
                                                    </span>
                                                </>
                                            })}</span>
                                </div>
                            </div>

                        </div>
                    </div>
                </div>
                <div className="song-body_right"> {/* right side - user songs, user playlists, likes, reposts */}
                    <div className="song-body_right_container">
                        <div className="song-body_right_container_header">
                            <span><i className="fa-solid fa-layer-group"></i> Albums from this user</span>
                            {/* TODO: route to user page/albums */}<NavLink>View All</NavLink>
                        </div>
                        {song.user.albums?.map(new_album => (
                            <div className="song-body_right_container_set" key={new_album.id}>
                                <NavLink to={`/albums/${new_album.id}`}>
                                    {new_album.album_pic !== "No Image" ? <img src={new_album.album_pic} alt={`${new_album.title} album image`} /> : <div className="default-pic song-body_right_container_set-default" />}
                                </NavLink>
                                <div>
                                    <NavLink>{song.user.username}</NavLink>
                                    <NavLink to={`/albums/${new_album.id}`}>{new_album.title}</NavLink>
                                    <span>Album &bull; {new Date(new_album.release_date).getFullYear()}</span>
                                </div>
                            </div>
                        ))}
                    </div>
                    <div className="song-body_right_container">
                        <div className="song-body_right_container_header">
                            <span><i className="fa-solid fa-layer-group"></i> Playlists from this user</span>
                            {/* TODO: route to user page/plsylists */}<NavLink>View All</NavLink>
                        </div>
                        {song.user.playlists?.map(playlist => (
                            <div className="song-body_right_container_set" key={playlist.id}>
                                <NavLink to={`/playlists/${playlist.id}`}>
                                    {playlist.playlist_pic !== "No Image" ? <img src={playlist.playlist_pic} alt={`${playlist.title} playlist image`} /> : <div className="default-pic song-body_right_container_set-default" />}

                                </NavLink>
                                <div>
                                    <NavLink>{song.user.username}</NavLink>
                                    <NavLink to={`/playlists/${playlist.id}`}>{playlist.title}</NavLink>
                                    <span>Playlist &bull; {new Date(playlist.created_at).getFullYear()}</span>
                                </div>
                            </div>
                        ))}
                    </div>
                    <div className="song-body_right_container">
                        <div className="song-body_right_container_header">
                            <span><i className="fa-solid fa-heart"></i> {song.likes?.length} likes</span>
                            {/* TODO: route to user page/plsylists */}<NavLink>View All</NavLink>
                        </div>
                        <div className="song-body_right_container_likes">
                            {firstEightLikedPFP(song.likes).map(like_user => (
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

export default SongPage;
