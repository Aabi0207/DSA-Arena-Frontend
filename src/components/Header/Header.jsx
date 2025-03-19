import React from 'react';
import './Header.css';

const getRingClass = (rank) => {
  if (rank === "Surya Bhai") return 'gold';
  if (rank === "Rocky Bhai") return 'silver';
  if (rank === "Bahubali") return 'bronze';
  return '';
};

const Header = ( { titleText = "DSA Arena" }) => {
  const user = JSON.parse(localStorage.getItem('user'));
  const profilePic = `https://surya23.pythonanywhere.com/${user?.profile_photo || '/profile-pics/trial.jpg'}`;
  const ringClass = getRingClass(user?.rank);

  return (
    <header className="header">
      <div className="header-title">{titleText}</div>
      <div className={`profile-wrapper ${ringClass}`}>
        <img src={profilePic} alt="Profile" className="profile-pic" />
      </div>
    </header>
  );
};

export default Header;
