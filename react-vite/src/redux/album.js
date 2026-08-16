import { createSelector } from "reselect";
import { normalizeObj } from "./helpers";
import { thunkClearAlbumSongs, thunkGetSongs } from "./song";

const GET_ALBUM= 'album/GET_ALBUM';
const GET_ALBUMS= 'album/GET_ALBUMS';
const ADD_ALBUM= 'album/ADD_ALBUM';
const DELETE_ALBUM= 'album/DELETE_ALBUM';
const ADD_LIKE = 'album/ADD_LIKE'
const DELETE_LIKE = 'delete/ADD_LIKE'

// Custom Selectors
export const selectSingleAlbum = (id) => createSelector(
    state => state.albums,
    albums => albums[id]
)

export const selectAlbums = () => createSelector(
    state => state.albums,
    albums => Object.values(albums)
)

// Action Creators
export const getAlbum = (album) => ({
    type: GET_ALBUM,
    payload: album
})

export const getAlbums = (albums) => ({
    type: GET_ALBUMS,
    payload: albums
})

export const addAlbum = (album) => ({
    type: ADD_ALBUM,
    payload: album
})

export const deleteAlbum = (albumId) => ({
    type: DELETE_ALBUM,
    payload: albumId
})

const addLike = (albumId, current_user, album) => ({
    type: ADD_LIKE,
    payload: {albumId, current_user, album}
})

const deleteLike = (albumId, current_user) => ({
    type: DELETE_LIKE,
    payload: {albumId, current_user}
})

// Thunks
export const thunkGetAlbum = (albumId) => async (dispatch)=> {
    if (!albumId) return; 
    const res = await fetch(`/api/albums/${albumId}`);

    if (res.ok) {
        const { album } = await res.json();
        dispatch(getAlbum(album));
        return album;
    }
    const data = await res.json();
    if(data.errors) return data;
}

export const thunkGetAlbums = (genres) => async (dispatch)=> {
    const res = await fetch(`/api/albums/?genres=${genres.join("-")}`);

    if (res.ok) {
        const { albums } = await res.json();
        dispatch(getAlbums(albums));
        return albums;
    }
    const data = await res.json();
    if(data.errors) return data;
}

export const thunkAddAlbum = (album) => async (dispatch)=> {
    const formData = new FormData();
    for (let key of Object.keys(album)) 
        formData.append(key, album[key]);

    const res = await fetch("/api/albums/", {
        method: "POST",
        body: formData
    });

    if (res.ok) {
        const { album } = await res.json();
        dispatch(thunkClearAlbumSongs());
        dispatch(addAlbum(album));
        return album;
    }
    const data = await res.json();
    if(data.errors) return data;
}

export const thunkUpdateAlbum = (album) => async (dispatch)=> {
    const res = await fetch(`/api/albums/${album.id}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(album)
    });

    if (res.ok) {
        const { album } = await res.json();
        dispatch(addAlbum(album));
        return album;
    }
    const data = await res.json();
    if(data.errors) return data;
}

export const thunkDeleteAlbum = (albumId) => async (dispatch)=> {
    const res = await fetch(`/api/albums/${albumId}`, {
        method: "DELETE"
    });

    if (res.ok) {
        const { album } = await res.json();
        dispatch(deleteAlbum(albumId));
        dispatch(thunkGetSongs());
        return album;
    }
    const data = await res.json();
    if(data.errors) return data;
}

export const thunkAddAlbumLike = (albumId, current_user) => async(dispatch) => {
    const response = await fetch(`/api/albums/${albumId}/like`, {
        method: "POST",
    })

    const album = await response.json()
    if(album.message === "added like"){

        dispatch(addLike(albumId, current_user, album))
        return 1
    } else if (album.message === "deleted like"){
        dispatch(deleteLike(albumId, current_user))
        return -1
    }
    return 0
}

// Reducer
const initialState = {};
const albumReducer = (state = initialState, action)=> {
    let newState;
    switch (action.type){
        case GET_ALBUM:
            newState = {...state};
            newState[action.payload.id] = action.payload
            return newState;
        case GET_ALBUMS:
            newState = {...normalizeObj(action.payload)};
            return newState;
        case ADD_ALBUM:
            newState = {...state}
            newState[action.payload.id] = action.payload
            return newState;
        case DELETE_ALBUM:
            newState = {...state};
            delete newState[action.payload];
            return newState;
        case ADD_LIKE:
            newState = {...state}
            newState[action.payload.id] = action.payload
            return newState;
        default:
            return state;
    }
}
 
export default albumReducer;