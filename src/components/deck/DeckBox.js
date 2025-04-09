import React from 'react';
import { useTheme } from '../../contexts/ThemeContext';
import './DeckBox.css';

const DeckBox = ({ name, main, extra, side, mainColor }) => {
  const { theme } = useTheme();
  
  const totalCards = (main?.length || 0) + (extra?.length || 0) + (side?.length || 0);
  
  return (
    <div className="deck-box-container">
      <div 
        className="deck-box"
        style={{ 
          backgroundColor: theme.colors.surface,
          borderColor: theme.colors.border,
          boxShadow: theme.shadows.medium
        }}
      >
        {/* Pixel Deckbox Art */}
        <div className="pixel-deckbox">
          <div 
            className="deckbox-lid"
            style={{ backgroundColor: mainColor || theme.colors.accent }}
          >
            <div className="deckbox-lid-shadow"></div>
            <div className="deckbox-emblem" style={{ backgroundColor: theme.colors.secondary }}></div>
          </div>
          <div 
            className="deckbox-body"
            style={{ backgroundColor: mainColor || theme.colors.accent }}
          >
            <div className="deckbox-body-shadow"></div>
            <div className="deckbox-cards">
              {[...Array(3)].map((_, i) => (
                <div 
                  key={i} 
                  className="deckbox-card"
                  style={{ 
                    backgroundColor: theme.colors.cardBackground,
                    borderColor: theme.colors.border,
                    transform: `translateY(${i * -2}px) rotate(${(i - 1) * 2}deg)`
                  }}
                ></div>
              ))}
            </div>
          </div>
        </div>
        
        {/* Deck Info */}
        <div className="deck-info">
          <h3 style={{ color: theme.colors.text }}>{name}</h3>
          <div className="deck-stats">
            <span style={{ color: theme.colors.textSecondary }}>
              Main: {main?.length || 0}
            </span>
            <span style={{ color: theme.colors.textSecondary }}>
              Extra: {extra?.length || 0}
            </span>
            <span style={{ color: theme.colors.textSecondary }}>
              Side: {side?.length || 0}
            </span>
          </div>
          <p style={{ color: theme.colors.textSecondary }}>
            Total: {totalCards} cards
          </p>
        </div>
      </div>
    </div>
  );
};

export default DeckBox;
