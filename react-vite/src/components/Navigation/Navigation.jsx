import { NavLink, useNavigate } from "react-router-dom";
import { useSelector } from "react-redux";
import ProfileButton from "./ProfileButton";
import "./Navigation.css";
import FeatureComingSoonModal from "../FeatureComingSoonModal/FeatureComingSoonModal";
import OpenModalMenuItem from "./OpenModalMenuItem";
import LoginFormModal from "../LoginFormModal";
import { useEffect, useRef, useState } from "react";

function Navigation() {
  const sessionUser = useSelector((state)=>state.session.user)
  const [showMenu, setShowMenu] = useState(false);
  
  const ulRef = useRef();

  

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
  return (
    <nav>
      <ul>
        <li>
          <NavLink to="/">Home</NavLink>
        </li>
        <li>
        <button className="upcoming"> <OpenModalMenuItem
                                itemText="Feed"
                                modalComponent={<FeatureComingSoonModal />}

                            /></button>
        </li>
        {sessionUser && <li>
          <NavLink to="/upload">Upload</NavLink>
        </li>}
        {!sessionUser && <li>
          <OpenModalMenuItem
                itemText="Upload"
                onItemClick={closeMenu}
                modalComponent={<LoginFormModal />}
              />
        </li>}
        
      </ul>
      
      <div className="nav-link-title">Tune Trax<img className="nav-link-logo" src="https://tunetrax-pictures.s3.us-west-2.amazonaws.com/favicon.webp"/></div>
      <ul>
        <li>
          <ProfileButton />
        </li>
      </ul>
    </nav>
  );
}

export default Navigation;
