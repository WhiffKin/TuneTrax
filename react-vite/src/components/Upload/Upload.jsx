import { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import CreateSong from "../Songs/CreateSong";
import CreateSet from "../CreateSet";
import "./Upload.css"
import LoginFormModal from "../LoginFormModal";
import OpenModalMenuItem from "../Navigation/OpenModalMenuItem";


const Upload = () => {
    const [songFiles, setSongFiles] = useState()
    const navigate = useNavigate();
    const user = useSelector(state => state.session.user)


    function onSongChange(e) {
        console.log("e target files", e.target.files)
        if (e.target.files) {
            const songList = [];
            for (let i = 0; i < e.target.files?.length; i++) {
                e.target.files[i].tempId = i;
                songList.push(e.target.files[i]);
            }
            setSongFiles(Object.values(e.target.files));
        }
    }

    return (
        <>

            <div className="upload-form_container">
                {!songFiles &&
                    <><h2>Upload one song individually, or multiple songs for an album.</h2>
                        <label for="file-upload" className="upload-form_container-upload-custom-button">Upload Song(s)</label>
                        <input
                            id="file-upload"
                            type="file"
                            accept="audio/*"
                            onChange={onSongChange}
                            disabled={user === null}
                            multiple
                            className="upload-form_container-upload-button"
                        />


                    </>}
                {songFiles && songFiles?.length === 1 &&
                    <>
                        <CreateSong songFile={songFiles[0]} />
                    </>}
                {songFiles && songFiles?.length > 1 &&
                    <>
                        <CreateSet songFiles={songFiles} />
                    </>}
            </div>

        </>
    )
}

export default Upload;