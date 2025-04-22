import React from 'react';
import { Link } from 'react-router-dom';
import { useTheme } from '../../contexts/ThemeContext';
import './Footer.css';

const Footer = () => {
  const { theme } = useTheme();
  
  const year = new Date().getFullYear();
  
  return (
    <footer 
      className="footer"
      style={{ 
        backgroundColor: theme.colors.surface,
        borderTopColor: theme.colors.border,
        color: theme.colors.text
      }}
    >
      <div className="footer-container">
        <div className="footer-section footer-brand">
          <h3 className="footer-title">DeckDojo</h3>
          <p className="footer-description">
            The ultimate platform for card game enthusiasts. Build decks, duel players, and join our growing community.
          </p>
          <div className="social-links">
            <a href="https://twitter.com" target="_blank" rel="noopener noreferrer" aria-label="Twitter">
              <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M22 4s-.7 2.1-2 3.4c1.6 10-9.4 17.3-18 11.6 2.2.1 4.4-.6 6-2C3 15.5.5 9.6 3 5c2.2 2.6 5.6 4.1 9 4-.9-4.2 4-6.6 7-3.8 1.1 0 3-1.2 3-1.2z"></path>
              </svg>
            </a>
            <a href="https://discord.com" target="_blank" rel="noopener noreferrer" aria-label="Discord">
              <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M18 9a5 5 0 0 0-5-5H5a5 5 0 0 0-5 5v6a5 5 0 0 0 5 5h8a5 5 0 0 0 5-5V9zM4 4h8v8H4z"></path>
                <path d="M16 15h4v5h-4z"></path>
              </svg>
            </a>
            <a href="https://facebook.com" target="_blank" rel="noopener noreferrer" aria-label="Facebook">
              <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z"></path>
              </svg>
            </a>
            <a href="https://github.com" target="_blank" rel="noopener noreferrer" aria-label="GitHub">
              <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M9 19c-5 1.5-5-2.5-7-3m14 6v-3.87a3.37 3.37 0 0 0-.94-2.61c3.14-.35 6.44-1.54 6.44-7A5.44 5.44 0 0 0 20 4.77 5.07 5.07 0 0 0 19.91 1S18.73.65 16 2.48a13.38 13.38 0 0 0-7 0C6.27.65 5.09 1 5.09 1A5.07 5.07 0 0 0 5 4.77a5.44 5.44 0 0 0-1.5 3.78c0 5.42 3.3 6.61 6.44 7A3.37 3.37 0 0 0 9 18.13V22"></path>
              </svg>
            </a>
          </div>
        </div>
        
        <div className="footer-nav-container">
          <div className="footer-section">
            <h4 className="footer-section-title">Game</h4>
            <ul className="footer-links">
              <li><Link to="/play">Play Now</Link></li>
              <li><Link to="/duel">Duels</Link></li>
              <li><Link to="/explore">Explore</Link></li>
              <li><Link to="/community">Community</Link></li>
            </ul>
          </div>
          
          <div className="footer-section">
            <h4 className="footer-section-title">Account</h4>
            <ul className="footer-links">
              <li><Link to="/dashboard">Dashboard</Link></li>
              <li><Link to="/decks">My Decks</Link></li>
              <li><Link to="/profile">Profile</Link></li>
              <li><Link to="/settings">Settings</Link></li>
            </ul>
          </div>
          
          <div className="footer-section">
            <h4 className="footer-section-title">Company</h4>
            <ul className="footer-links">
              <li><Link to="/about">About Us</Link></li>
              <li><Link to="/contact">Contact</Link></li>
              <li><Link to="/careers">Careers</Link></li>
              <li><Link to="/blog">Blog</Link></li>
            </ul>
          </div>
          
          <div className="footer-section">
            <h4 className="footer-section-title">Legal</h4>
            <ul className="footer-links">
              <li><Link to="/terms">Terms of Service</Link></li>
              <li><Link to="/privacy">Privacy Policy</Link></li>
              <li><Link to="/cookies">Cookie Policy</Link></li>
              <li><Link to="/licenses">Licenses</Link></li>
            </ul>
          </div>
        </div>
      </div>
      <div 
        className="footer-bottom"
        style={{ borderTopColor: theme.colors.border }}
      >
        <div className="footer-container">
          <p className="copyright">© {year} DeckDojo. All rights reserved.</p>
          <div className="language-switch">
            <select name="language" style={{ color: theme.colors.text, backgroundColor: theme.colors.background }}>
              <option value="en">English</option>
              <option value="es">Español</option>
              <option value="fr">Français</option>
              <option value="de">Deutsch</option>
            </select>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer; 