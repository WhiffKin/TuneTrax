import { useState } from "react";
import { useDispatch } from "react-redux";
import { useNavigate } from "react-router-dom";
import { thunkEditSong, thunkPostAlbumSong, thunkPostSong } from "../../../redux/song";
import "./CreateSong.css"
import Upload from "../../Upload";

function CreateSong({ editedSong, songFile, addFunc, dontNavigate=false }) {
    const dispatch = useDispatch();
    const navigate = useNavigate()
    const [errors, setErrors] = useState({});
    const [validation, setValidation] = useState({});
    const [disabled, setDisabled] = useState(false);
    const [hasSubmitted, setHasSubmitted] = useState(false);
    
    const [songImg, setSongImg] = useState(editedSong ? editedSong.image : {URL: "No Image"});
    const [title, setTitle] = useState(editedSong ? editedSong.title : songFile.name.split(".")[0]);
    const [description, setDescription] = useState(editedSong ? editedSong.body : "");
    const [genre, setGenre] = useState(editedSong ? editedSong.genre : "");
    const [privacy, setPrivacy] = useState(false);
    
    function onImageChange(e) {
        if (e.target.files && e.target.files[0]);
            setSongImg({
                URL: URL.createObjectURL(e.target.files[0]),
                file: e.target.files[0]
            });
    }

    function validate() {
        const tempValidation = {};
        if ("" == title) tempValidation.title = "Enter a title.";
        if ("" == description) tempValidation.description = "Enter a description.";
        if ("" == genre) tempValidation.genre = "Pick a genre.";
        setValidation(tempValidation)

        // Unsuccessful Validation
        if (Object.values(tempValidation)?.length != 0) 
            return false;
        return true;
    }

    async function onSubmit(e) {
        e.preventDefault();
        setDisabled(false);

        if (!validate()) return setDisabled(false);

        const payload = {
            title,
            song_file: songFile,
            song_pic: songImg.file,
            body: description,
            genre,
            visibility: privacy,
        }

        if (editedSong) payload.id = editedSong.id;
        else payload.song = songFile;
        let response;
        if (!dontNavigate) response = await dispatch(editedSong ? thunkEditSong(payload) : thunkPostSong(payload));
        else response = await dispatch(thunkPostAlbumSong(payload))
            
        // Unsuccessful Submission
        if (response.errors) { 
            setErrors({errors: Object.values(response.errors)});
            setDisabled(false);
            return;
        }

        // Successful Submission
        if (!dontNavigate) navigate(`/songs/${response.id}`);
        else {
            addFunc(response.id);
            setHasSubmitted(true);
        }
    }

    function clearForm (e) {
        e.preventDefault();
        setSongImg({URL: "No Image"});
        setTitle("");
        setDescription("");
        setGenre("");
        setPrivacy(false);
    }
    

    return !hasSubmitted || !dontNavigate ? (
        <form onSubmit={onSubmit} className="upload-form_song">
            <div>
                <h1>Upload a Song</h1>
            </div>
            <div>
                <div className="upload-form_song_pic">
                    {songImg.URL !== "No Image" && <img src={songImg.URL} alt="Song image."/>}
                    {songImg.URL == "No Image" && <>
                    <label for="image-upload" class="upload-song_container-upload-custom-button">Upload Song Image</label>
                    <input 
                        id="image-upload"
                        type="file"
                        accept="image/*"
                        onChange={onImageChange}
                        className="upload-song_container-upload-button"
                        />
                    </>}
                </div>
                <div className="upload-form_song_data">  
                    {errors.errors && errors.errors.map((error, i) => (<div key={i}>{error}</div>))}
                    <label>
                        Title {/* TODO: make asterisk red */}*
                        <input
                            type="text"
                            value={title}
                            placeHolder={""}
                            onChange={(e) => setTitle(e.target.value)}
                            />
                        {validation.title && <p>{validation.title}</p>}
                    </label>
                    <label>
                        Set Genre {/* TODO: make asterisk red */}*
                        <select
                            type="select"
                            value={genre}
                            onChange={(e) => setGenre(e.target.value)}
                            >
                            <option value="" defaultValue hidden>None</option>
                            <option value="Electronic">Electronic</option>
                            <option value="Rock">Rock</option>
                            <option value="Pop">Pop</option>
                            <option value="Alternative">Alternative</option>
                            <option value="Hauntology">Hauntology</option>
                            <option value="Classical">Classical</option>
                            <option value="Indie">Indie</option>
                            <option value="Rap">Rap</option>
                            <option value="Country">Country</option>
                            <option value="Metal">Metal</option>
                        </select>
                        {validation.genre && <p>{validation.genre}</p>}
                    </label>
                    <label>
                        Description
                        <textarea
                            className="create-song-description"
                            value={description}
                            onChange={(e) => setDescription(e.target.value)}
                            />
                        {validation.description && <p>{validation.description}</p>}
                    </label>
                    <label>
                        <span>Privacy:</span>
                        <div>
                            <label>
                                Public
                                <input
                                    type="radio"
                                    onChange={() => setPrivacy(true)}
                                    checked={privacy}
                                    />
                            </label>
                            <label>
                                Private
                                <input
                                    type="radio"
                                    onChange={() => setPrivacy(false)}
                                    checked={!privacy}
                                    />
                            </label>
                        </div>
                    </label>
                    <span>{/* TODO: make asterisk red */}* Required fields</span>
                    <div className="upload-form_song_button-container">
                        <button type="cancel" onClick={clearForm}>Cancel</button>
                        <button type="submit" disabled={disabled}>Submit</button>
                    </div>
                </div>
            </div>
        </form>
    ) : (
        <div className="submitted-song">
            <img src={songImg.URL} alt={`${title} picture.`}/>
            <span>{title}</span>
            <span>{privacy ? "Public" : "Private"}</span>
        </div>
    )
}

export default CreateSong;