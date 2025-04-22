import React, { useState, useEffect } from 'react';
import { useTheme } from '../../contexts/ThemeContext';
import './LifePointCalculator.css';

const LifePointCalculator = ({ playerName = "Player", position = "top", onClick, lifePoints = 8000 }) => {
  const { theme } = useTheme();
  const [history, setHistory] = useState([]);
  const [showHistory, setShowHistory] = useState(false);

  // Reset life points to 8000
  const resetLifePoints = () => {
    setHistory([{ value: lifePoints, change: 0, operation: 'reset' }]);
  };

  // Initialize history on component mount
  useEffect(() => {
    resetLifePoints();
  }, []);

  // Update life points
  const updateLifePoints = (value, operation) => {
    let newLifePoints;
    
    if (operation === 'add') {
      newLifePoints = lifePoints + value;
    } else {
      newLifePoints = lifePoints - value;
    }
    
    // Ensure life points don't go below 0
    newLifePoints = Math.max(0, newLifePoints);
    
    // Update history
    setHistory(prev => [
      { 
        value: newLifePoints, 
        change: value, 
        operation 
      },
      ...prev
    ]);
  };

  // Toggle history display
  const toggleHistory = () => {
    setShowHistory(!showHistory);
  };

  // Get background color based on life points
  const getLifePointsColor = () => {
    const percentage = Math.min(lifePoints / 8000, 1);
    
    if (percentage > 0.5) {
      return theme.colors.success; // Healthy
    } else if (percentage > 0.25) {
      return theme.colors.warning; // Warning
    } else {
      return theme.colors.error; // Danger
    }
  };

  // Calculate life bar width for normal and overflow
  const calculateLifeBarWidth = () => {
    if (lifePoints <= 8000) {
      return `${(lifePoints / 8000) * 100}%`;
    } else {
      return '100%';
    }
  };

  // Calculate overflow life bar width
  const calculateOverflowLifeBarWidth = () => {
    if (lifePoints <= 8000) {
      return '0%';
    } else {
      // Calculate percentage of the overflow (above 8000)
      const overflow = lifePoints - 8000;
      // Cap at 8000 additional LP (16000 total)
      const maxOverflow = 8000;
      return `${Math.min(overflow / maxOverflow, 1) * 100}%`;
    }
  };

  return (
    <div 
      className={`life-point-calculator ${position}`}
      style={{ 
        backgroundColor: theme.colors.surface,
        borderColor: theme.colors.border,
        boxShadow: theme.shadows.medium
      }}
      onClick={onClick}
    >
      <div className="player-info">
        <h2 style={{ color: theme.colors.text }}>{playerName}</h2>
        <span 
          className="lp-indicator"
          style={{ color: theme.colors.textSecondary }}
        >
          LP
        </span>
      </div>
      
      <div 
        className="life-points-display"
        style={{ 
          backgroundColor: theme.colors.cardBackground,
          borderColor: getLifePointsColor(),
          color: theme.colors.text
        }}
      >
        <div className="life-points-value">{lifePoints}</div>
        <div className="life-bars-container">
          {/* Overflow life bar (for LP > 8000) */}
          {lifePoints > 8000 && (
            <div 
              className="life-points-bar overflow"
              style={{ 
                width: calculateOverflowLifeBarWidth(),
                backgroundColor: theme.colors.accent
              }}
            ></div>
          )}
          {/* Regular life bar (for LP <= 8000) */}
          <div 
            className="life-points-bar"
            style={{ 
              width: calculateLifeBarWidth(),
              backgroundColor: getLifePointsColor()
            }}
          ></div>
        </div>
      </div>
      
      {showHistory && (
        <div 
          className="history-container"
          style={{ 
            backgroundColor: theme.colors.cardBackground,
            borderColor: theme.colors.border
          }}
        >
          <h3 style={{ color: theme.colors.text }}>History</h3>
          <ul className="history-list">
            {history.map((entry, index) => (
              <li 
                key={index}
                style={{ color: theme.colors.textSecondary }}
              >
                {entry.operation === 'reset' 
                  ? 'Reset to 8000' 
                  : `${entry.operation === 'add' ? '+' : '-'}${entry.change} → ${entry.value}`}
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
};

export default LifePointCalculator;
