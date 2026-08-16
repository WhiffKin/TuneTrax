import { createContext, useContext, useEffect, useState } from "react";


export const SongContext = createContext()

export const useSongContext = () => useContext(SongContext)

export default function SongPlayerContext({children}) {
  const [songs, setSongs] = useState([])
  const [prevSongs, setPrevSongs] = useState([])
  const [songTime, setSongTime] = useState(0)

  useEffect(()=> {
    if(songs.length){
      sessionStorage.setItem("songs", JSON.stringify(songs))
    }
  }, [songs])

  useEffect(()=>{
    if(prevSongs.length){
      sessionStorage.setItem("prev songs", JSON.stringify(prevSongs))
    }
  }, [songTime])

  useEffect(()=>{
    if(songTime){
      sessionStorage.setItem("song time", songTime)
    }
  }, [songTime])

  useEffect(()=>{
    const songs_ss = sessionStorage.getItem("songs")
    const prevSongs_ss = sessionStorage.getItem("prev songs")
    const songTime_ss = sessionStorage.getItem("song time")
    
    if(songs_ss) setSongs(JSON.parse(songs_ss)) 
    else setSongs([{
      songLink: "https://tunetrax-songs.s3.us-west-2.amazonaws.com/password-infinity-123276.mp3",
      songPic: "https://tunetrax-pictures.s3.us-west-2.amazonaws.com/18-48-26-846_200x200.jpg",
      songName: "Password Infinity",
      songId: 21
  }])

    if(prevSongs_ss) setPrevSongs(JSON.parse(prevSongs_ss)) 
    else setPrevSongs([])

    if(songTime_ss) setSongTime(JSON.parse(songTime_ss))

    const element = document.querySelector("audio")
    if(element){
      element.currentTime = songTime_ss
    }
  }, [])

  return(
    <SongContext.Provider value={{songs, setSongs, prevSongs, setPrevSongs, songTime, setSongTime}}>
      {children}
    </SongContext.Provider>
  )
}