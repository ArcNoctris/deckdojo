import React from 'react';
import PixelGrid from './PixelGrid';
import logoSvg from '../../assets/images/deckdojo.svg';
import './LoadingAnimation.css';

const LoadingAnimation = ({ fullScreen = false, theme = null }) => {
  // Default theme colors if no theme is provided
  const defaultColors = {
    primary: '#11465d',    // Main blue
    secondary: '#fcdd5a',  // Bright gold
    background: '#0a2c3d', // Dark blue
    text: '#fcdd5a'        // Bright gold for text
  };

  // Use provided theme or default colors
  const colors = theme ? theme.colors : defaultColors;

  return (
    <div className={`loading-container ${fullScreen ? 'fullscreen' : ''}`} 
         style={{ 
           backgroundColor: fullScreen ? colors.background : 'transparent',
           color: colors.text
         }}>
      {/* Pixel Grid Background */}
      <PixelGrid colors={colors} />
      
      <div className="loading-content">
        <div className="logo-container">
          {/* Use the SVG logo directly from assets */}
          <img 
            src={logoSvg} 
            alt="DeckDojo Logo" 
            className="logo-animation"
          />
        </div>
        
        <div className="loading-text">
          <span className="pixel-text">Loading DeckDojo...</span>
        </div>
        
        <div className="loading-progress">
          <div className="pixel-progress-bar">
            <div className="pixel-progress-fill" style={{ backgroundColor: colors.secondary }}></div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LoadingAnimation;
