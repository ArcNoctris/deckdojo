import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { useTheme } from '../../contexts/ThemeContext';
import { logoutUser } from '../../firebase/firebase';
import ThemeToggle from '../common/ThemeToggle';
import logoSvg from '../../assets/images/deckdojo.svg';
import './Navbar.css';

const Navbar = () => {
  const { isAuthenticated } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const [menuOpen, setMenuOpen] = useState(false);

  const handleLogout = async () => {
    try {
      await logoutUser();
    } catch (error) {
      console.error('Failed to log out', error);
    }
  };

  const toggleMenu = () => {
    setMenuOpen(!menuOpen);
  };

  return (
    <nav className="navbar" style={{ 
      backgroundColor: theme.colors.navBackground,
      color: theme.colors.navText,
      boxShadow: theme.shadows.medium
    }}>
      <div className="navbar-container">
        <div className="navbar-brand">
          <Link to="/" className="logo-link">
            <img src={logoSvg} alt="DeckDojo Logo" className="navbar-logo" />
            <span className="brand-text" style={{ color: theme.colors.navText }}>DeckDojo</span>
          </Link>
        </div>

        <div className="navbar-mobile-toggle" onClick={toggleMenu}>
          <div className={`hamburger ${menuOpen ? 'open' : ''}`}>
            <span style={{ backgroundColor: theme.colors.navText }}></span>
            <span style={{ backgroundColor: theme.colors.navText }}></span>
            <span style={{ backgroundColor: theme.colors.navText }}></span>
          </div>
        </div>

        <div className={`navbar-menu ${menuOpen ? 'open' : ''}`} style={{ 
          backgroundColor: menuOpen ? theme.colors.navBackground : 'transparent'
        }}>
          <Link to="/" className="nav-link" style={{ color: theme.colors.navText }}>Home</Link>
          <Link to="/play" className="nav-link" style={{ color: theme.colors.navText }}>Play</Link>
          <Link to="/decks" className="nav-link" style={{ color: theme.colors.navText }}>Decks</Link>
          
          {isAuthenticated ? (
            <>
              <Link to="/dashboard" className="nav-link" style={{ color: theme.colors.navText }}>Dashboard</Link>
              <button 
                onClick={handleLogout} 
                className="nav-button pixel-button logout-button"
                style={{
                  backgroundColor: theme.colors.error,
                  color: theme.colors.white,
                  borderColor: theme.colors.error
                }}
              >
                Logout
              </button>
            </>
          ) : (
            <>
              <Link to="/login" className="nav-link login-link" style={{ color: theme.colors.navText }}>Login</Link>
              <Link 
                to="/register" 
                className="nav-button pixel-button register-button"
                style={{
                  backgroundColor: theme.colors.primary,
                  color: theme.colors.textOnPrimary,
                  borderColor: theme.colors.primary
                }}
              >
                Register
              </Link>
            </>
          )}
          
          <div className="theme-toggle-container">
            <ThemeToggle />
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
