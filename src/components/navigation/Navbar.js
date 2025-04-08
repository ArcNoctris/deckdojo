import React from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { logoutUser } from '../../firebase/firebase';

const Navbar = () => {
  const { isAuthenticated } = useAuth();

  const handleLogout = async () => {
    try {
      await logoutUser();
    } catch (error) {
      console.error('Failed to log out', error);
    }
  };

  return (
    <nav className="navbar">
      <div className="navbar-brand">
        <Link to="/">DeckDojo</Link>
      </div>
      <div className="navbar-menu">
        {isAuthenticated ? (
          <>
            <Link to="/dashboard">Dashboard</Link>
            <Link to="/decks">My Decks</Link>
            <Link to="/life-points">Life Points</Link>
            <button onClick={handleLogout}>Logout</button>
          </>
        ) : (
          <>
            <Link to="/login">Login</Link>
            <Link to="/register">Register</Link>
          </>
        )}
      </div>
    </nav>
  );
};

export default Navbar;
