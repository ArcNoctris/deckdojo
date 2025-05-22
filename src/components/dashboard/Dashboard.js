import React from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { logoutUser } from '../../services/firebase/firebase';
import PageBackground from '../common/PageBackground';
import { pageBackgrounds } from '../../assets/images/page-backgrounds';

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
    <PageBackground backgroundImage={pageBackgrounds.home}>
      {/* Main content container */}
      <div className="deckdojo-content">
        {/* Header */}
        <header className="deckdojo-header">
          <h1>Welcome to DeckDojo</h1>
        </header>

        {/* Game-style menu */}
        <nav className="deckdojo-menu">
          <Link to="/duel" className="menu-item duel">
            <span className="menu-icon">⚔️</span>
            <span className="menu-text">Duel</span>
            <span className="menu-desc">Enter the arena</span>
          </Link>

          <Link to="/explore" className="menu-item explore">
            <span className="menu-icon">🔍</span>
            <span className="menu-text">Explore</span>
            <span className="menu-desc">Discover new cards</span>
          </Link>

          {currentUser && (
            <>
              <Link to="/decks" className="menu-item arsenal">
                <span className="menu-icon">🗡️</span>
                <span className="menu-text">Arsenal</span>
                <span className="menu-desc">Manage your decks</span>
              </Link>

              <Link to="/community" className="menu-item community">
                <span className="menu-icon">👥</span>
                <span className="menu-text">Community</span>
                <span className="menu-desc">Join the dojo</span>
              </Link>
            </>
          )}
        </nav>
      </div>
    </PageBackground>
  );
};

export default DeckDojo;
