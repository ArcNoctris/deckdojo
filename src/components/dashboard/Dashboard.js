import React from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { logoutUser } from '../../services/firebase/firebase';

const deckdojoBg = require('../../assets/images/deckdojo-bg.png'); // We'll add this image

const DeckDojo = () => {
  const { currentUser } = useAuth();

  const handleLogout = async () => {
    try {
      await logoutUser();
    } catch (error) {
      console.error('Failed to log out', error);
    }
  };

  return (
    <div 
      className="deckdojo-landing"
      style={{
        background: `url(${deckdojoBg}) center center/cover no-repeat fixed`,
        minHeight: '100vh',
        width: '100%',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        position: 'relative',
      }}
    >
      <header className="deckdojo-header">
        <h1>Welcome to DeckDojo</h1>
        <div className="user-info">
          <span>Welcome, {currentUser?.email}</span>
          <button onClick={handleLogout}>Logout</button>
        </div>
      </header>

      <div className="deckdojo-content">
        <div className="feature-cards">
          <div className="feature-card">
            <h3>Life Point Tracker</h3>
            <p>Track life points during your duels</p>
            <Link to="/life-points">Open Tracker</Link>
          </div>
          
          <div className="feature-card">
            <h3>Arsenal</h3>
            <p>Manage your YuGiOh decks in your arsenal</p>
            <Link to="/decks">Go to Arsenal</Link>
          </div>
          
          <div className="feature-card">
            <h3>Game History</h3>
            <p>View your past duels and statistics</p>
            <Link to="/history">View History</Link>
          </div>
          
          <div className="feature-card">
            <h3>Card Scanner</h3>
            <p>Scan cards to check prices (Coming Soon)</p>
            <Link to="/scanner" className="disabled">Scanner</Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DeckDojo;
