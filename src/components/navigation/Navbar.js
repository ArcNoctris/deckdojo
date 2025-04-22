import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { useTheme } from '../../contexts/ThemeContext';
import { logoutUser } from '../../services/firebase/firebase';
import ThemeToggle from '../common/ThemeToggle';
import logoSvg from '../../assets/images/deckdojo.svg';
import './Navbar.css';

const Navbar = () => {
  const { isAuthenticated, currentUser } = useAuth();
  const { theme } = useTheme();
  const [menuOpen, setMenuOpen] = useState(false);
  const [profileMenuOpen, setProfileMenuOpen] = useState(false);
  const location = useLocation();

  const handleLogout = async () => {
    try {
      await logoutUser();
    } catch (error) {
      console.error('Failed to log out', error);
    }
  };

  const toggleMenu = () => {
    setMenuOpen(!menuOpen);
    if (profileMenuOpen) setProfileMenuOpen(false);
  };

  const toggleProfileMenu = (e) => {
    if (e) e.stopPropagation();
    setProfileMenuOpen(!profileMenuOpen);
    if (window.innerWidth <= 768 && menuOpen) setMenuOpen(false);
  };

  // Close menus when clicking outside or changing routes
  useEffect(() => {
    const handleClickOutside = (event) => {
      const navbar = document.querySelector('.navbar');
      const profileMenu = document.querySelector('.profile-dropdown');
      
      if (navbar && !navbar.contains(event.target)) {
        setMenuOpen(false);
      }
      
      if (profileMenu && !profileMenu.contains(event.target) && 
          !event.target.classList.contains('profile-toggle')) {
        setProfileMenuOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  useEffect(() => {
    setMenuOpen(false);
    setProfileMenuOpen(false);
  }, [location.pathname]);

  const isActive = (path) => {
    return location.pathname === path;
  };

  // Get user profile image or use placeholder
  const getUserImage = () => {
    if (currentUser?.photoURL) {
      return currentUser.photoURL;
    }
    // Default placeholder image with user's initial if available
    return currentUser?.displayName ? 
      `https://ui-avatars.com/api/?name=${encodeURIComponent(currentUser.displayName)}&background=random` :
      `https://ui-avatars.com/api/?name=U&background=random`;
  };

  return (
    <nav 
      className="navbar"
      style={{ 
        backgroundColor: theme.colors.surface,
        borderBottomColor: theme.colors.border
      }}
    >
      <div className="navbar-container">
        <div className="navbar-brand">
          <Link to="/" className="logo-link">
            <img src={logoSvg} alt="DeckDojo Logo" className="navbar-logo" />
            <span className="brand-text" style={{ color: theme.colors.text }}>DeckDojo</span>
          </Link>
        </div>

        <div className="navbar-sections">
          <div className={`navbar-menu ${menuOpen ? 'open' : ''}`} style={{ 
            backgroundColor: theme.colors.surface
          }}>
            <Link 
                  to="/duel" 
                  className={`nav-link ${isActive('/duel') ? 'active' : ''}`}
                  style={{ color: theme.colors.text }}
                >
                  Duel
                </Link>
           
            
            <Link 
              to="/explore" 
              className={`nav-link ${isActive('/explore') ? 'active' : ''}`}
              style={{ color: theme.colors.text }}
            >
              Explore
            </Link>
            
            {currentUser && (
              <>
                <Link 
                  to="/decks" 
                  className={`nav-link ${isActive('/decks') ? 'active' : ''}`}
                  style={{ color: theme.colors.text }}
                >
                  My Decks
                </Link>

                <Link 
                  to="/dashboard" 
                  className={`nav-link ${isActive('/dashboard') ? 'active' : ''}`}
                  style={{ color: theme.colors.text }}
                >
                  Dashboard
                </Link>
                <Link 
                  to="/community" 
                  className={`nav-link ${isActive('/community') ? 'active' : ''}`}
                  style={{ color: theme.colors.text }}
                >
                  Community
                </Link>
              </>
            )}
          </div>

          <div className="navbar-actions">
            <div className="theme-toggle-container">
              <ThemeToggle />
            </div>

            {currentUser ? (
              <div className="profile-container">
                <button 
                  className="profile-toggle" 
                  onClick={toggleProfileMenu}
                  style={{ color: theme.colors.text }}
                >
                  <img 
                    src={getUserImage()} 
                    alt={currentUser.displayName || "User"} 
                    className="profile-image"
                  />
                </button>
                <div 
                  className={`profile-dropdown ${profileMenuOpen ? 'open' : ''}`}
                  style={{ 
                    backgroundColor: theme.colors.surface,
                    boxShadow: `0 4px 12px ${theme.colors.shadow}`,
                    borderColor: theme.colors.border
                  }}
                >
                  <div className="profile-header" style={{ borderBottomColor: theme.colors.border }}>
                    <img 
                      src={getUserImage()} 
                      alt={currentUser.displayName || "User"} 
                      className="profile-image-large" 
                    />
                    <div className="profile-info">
                      <span className="profile-name" style={{ color: theme.colors.text }}>
                        {currentUser.displayName || "User"}
                      </span>
                      <span className="profile-email" style={{ color: theme.colors.textSecondary }}>
                        {currentUser.email}
                      </span>
                    </div>
                  </div>
                  <div className="profile-menu">
                    <Link 
                      to="/profile" 
                      className="profile-link"
                      style={{ color: theme.colors.text }}
                    >
                      Profile Settings
                    </Link>
                    <Link 
                      to="/login" 
                      onClick={handleLogout}
                      className="profile-link"
                      style={{ color: theme.colors.text }}
                    >
                      Logout
                    </Link>
                  </div>
                </div>
              </div>
            ) : (
              <div className={`navbar-auth ${menuOpen ? 'open' : ''}`} style={{ 
                backgroundColor: theme.colors.surface
              }}>
                <Link 
                  to="/login" 
                  className={`nav-link ${isActive('/login') ? 'active' : ''}`}
                  style={{ color: theme.colors.text }}
                >
                  Login
                </Link>
                <Link 
                  to="/register" 
                  className={`nav-link ${isActive('/register') ? 'active' : ''}`}
                  style={{ color: theme.colors.text }}
                >
                  Register
                </Link>
              </div>
            )}
          </div>
        </div>

        <div className="navbar-mobile-toggle" onClick={toggleMenu}>
          <div className={`hamburger ${menuOpen ? 'open' : ''}`}>
            <span style={{ backgroundColor: theme.colors.text }}></span>
            <span style={{ backgroundColor: theme.colors.text }}></span>
            <span style={{ backgroundColor: theme.colors.text }}></span>
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
