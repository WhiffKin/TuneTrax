import { useEffect, useRef, useState } from "react";
import { useDispatch } from "react-redux";
import { useModal } from "../../context/Modal";
import { thunkSignup } from "../../redux/session";
import "./SignupFormModal.css";
import OpenModalMenuItem from "../Navigation/OpenModalMenuItem";
import LoginFormModal from "../LoginFormModal";

function SignupFormModal() {
  const dispatch = useDispatch();
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [username, setUsername] = useState("");
  const [profilePic, setProfilePic] = useState("");
  const [headerPic, setHeaderPic] = useState("");
  const [description, setDescription] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [errors, setErrors] = useState({});
  const { closeModal } = useModal();
  const [showMenu, setShowMenu] = useState(false);
  const ulRef = useRef();

  const toggleMenu = (e) => {
    e.stopPropagation(); // Keep from bubbling up to document and triggering closeMenu
    setShowMenu(!showMenu);
  };

  useEffect(() => {
    if (!showMenu) return;

    const closeMenu = (e) => {
      if (ulRef.current && !ulRef.current.contains(e.target)) {
        setShowMenu(false);
      }
    };

    document.addEventListener("click", closeMenu);

    return () => document.removeEventListener("click", closeMenu);
  }, [showMenu]);

  const closeMenu = () => setShowMenu(false);

  const handleSubmit = async (e) => {
    e.preventDefault();

    const tempErrors = {};
    if (password !== confirmPassword) 
      tempErrors.confirmPassword = "Confirm Password field must be the same as the Password field";
    if (Object.values(tempErrors)?.length)
      return setErrors(tempErrors);

    const serverResponse = await dispatch(
      thunkSignup({
        first_name: firstName,
        last_name: lastName,
        email,
        username,
        profile_pic: profilePic,
        header_pic: headerPic,
        description,
        password,
      })
    );

    if (serverResponse) {
      setErrors(serverResponse);
    } else {
      closeModal();
    }
  };

  return (
    <>
      <h1>Sign Up</h1>
      {errors.server && <p>{errors.server}</p>}
      <form onSubmit={handleSubmit} className="signup-form">
        <label>
         
          <input
            type="text"
            placeHolder="First Name*"
            value={firstName}
            onChange={(e) => setFirstName(e.target.value)}
            required
          />
        </label>
        <label>
          
          <input
            type="text"
            placeHolder="Last Name*"
            value={lastName}
            onChange={(e) => setLastName(e.target.value)}
            required
          />
        </label>
        <label>
          
          <input
            type="text"
            placeHolder="Email*"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
        </label>
        {errors.email && <p>{errors.email}</p>}
        <label>
         
          <input
            type="text"
            placeHolder="Username*"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            required
          />
        </label>
        {errors.username && <p>{errors.username}</p>}
        <label>
          <input
            type="text"
            placeHolder="Profile Pic"
            value={profilePic}
            onChange={(e) => setProfilePic(e.target.value)}
          />
        </label>
        {errors.profile_pic && <p>{errors.profile_pic}</p>}
        <label>
          <input
            type="text"
            placeholder="Header Pic"
            value={headerPic}
            onChange={(e) => setHeaderPic(e.target.value)}
          />
        </label>
        {errors.header_pic && <p>{errors.header_pic}</p>}
        <label>
      
          <textarea
            placeHolder="Description"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
          />
        </label>
        <label>
          
          <input
            type="password"
            placeHolder="Password*"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
        </label>
        {errors.password && <p>{errors.password}</p>}
        <label>
         
          <input
          placeHolder="Confirm Password*"
            type="password"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            required
          />
        </label>
        {errors.confirmPassword && <p>{errors.confirmPassword}</p>}
        <button type="submit">Sign Up</button>
        <p>* Indicates a required response.</p>
        <div className="log-in-wrapper">
        <OpenModalMenuItem
                className="log-in-button"
                itemText="Already a user? Log In here."
                onItemClick={closeMenu}
                modalComponent={<LoginFormModal />}
              />
          </div>
      </form>
    </>
  );
}

export default SignupFormModal;
