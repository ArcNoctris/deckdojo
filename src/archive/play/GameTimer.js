import React, { useState, useEffect, useRef } from 'react';
import { useTheme } from '../../contexts/ThemeContext';
import './GameTimer.css';

const GameTimer = () => {
  const { theme } = useTheme();
  const [isRunning, setIsRunning] = useState(false);
  const [time, setTime] = useState(0);
  const [turnTime, setTurnTime] = useState(0);
  const [currentPlayer, setCurrentPlayer] = useState(1);
  const timerRef = useRef(null);
  const turnTimerRef = useRef(null);

  // Format time in MM:SS format
  const formatTime = (timeInSeconds) => {
    const minutes = Math.floor(timeInSeconds / 60);
    const seconds = timeInSeconds % 60;
    return `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
  };

  // Start/stop the timer
  const toggleTimer = () => {
    if (isRunning) {
      clearInterval(timerRef.current);
      clearInterval(turnTimerRef.current);
    } else {
      timerRef.current = setInterval(() => {
        setTime(prevTime => prevTime + 1);
      }, 1000);
      
      turnTimerRef.current = setInterval(() => {
        setTurnTime(prevTime => prevTime + 1);
      }, 1000);
    }
    setIsRunning(!isRunning);
  };

  // Reset the timer
  const resetTimer = () => {
    clearInterval(timerRef.current);
    clearInterval(turnTimerRef.current);
    setIsRunning(false);
    setTime(0);
    setTurnTime(0);
    setCurrentPlayer(1);
  };

  // Switch turns
  const switchTurn = () => {
    setCurrentPlayer(currentPlayer === 1 ? 2 : 1);
    setTurnTime(0);
  };

  // Clean up intervals on component unmount
  useEffect(() => {
    return () => {
      clearInterval(timerRef.current);
      clearInterval(turnTimerRef.current);
    };
  }, []);

  return (
    <div 
      className="game-timer"
      style={{ 
        backgroundColor: theme.colors.surface,
        borderColor: theme.colors.border,
        boxShadow: theme.shadows.medium
      }}
    >
      <div className="timer-hexagon">
        <div className="timer-display">
          <div className="timer-section game-time">
            <h3 style={{ color: theme.colors.text }}>Game</h3>
            <div 
              className="time-value"
              style={{ 
                backgroundColor: theme.colors.cardBackground,
                color: theme.colors.text,
                borderColor: theme.colors.border
              }}
            >
              {formatTime(time)}
            </div>
          </div>
          
          <div className="timer-section turn-time">
            <h3 style={{ color: theme.colors.text }}>Turn</h3>
            <div 
              className="time-value"
              style={{ 
                backgroundColor: theme.colors.cardBackground,
                color: theme.colors.text,
                borderColor: theme.colors.border
              }}
            >
              {formatTime(turnTime)}
            </div>
          </div>
        </div>
        
        <div className="player-indicator-container">
          <div 
            className={`player-indicator ${currentPlayer === 1 ? 'active' : ''}`}
            style={{ 
              backgroundColor: currentPlayer === 1 ? theme.colors.accent : 'transparent',
              color: currentPlayer === 1 ? theme.colors.white : theme.colors.textSecondary,
              borderColor: theme.colors.border
            }}
          >
            P1
          </div>
          <div 
            className={`player-indicator ${currentPlayer === 2 ? 'active' : ''}`}
            style={{ 
              backgroundColor: currentPlayer === 2 ? theme.colors.accent : 'transparent',
              color: currentPlayer === 2 ? theme.colors.white : theme.colors.textSecondary,
              borderColor: theme.colors.border
            }}
          >
            P2
          </div>
        </div>
      </div>
      
      <div className="timer-controls">
        <button 
          className={`timer-button ${isRunning ? 'stop' : 'start'}`}
          onClick={toggleTimer}
          style={{ 
            backgroundColor: isRunning ? theme.colors.error : theme.colors.success,
            color: theme.colors.buttonText
          }}
        >
          {isRunning ? 'Pause' : 'Start'}
        </button>
        
        <button 
          className="timer-button reset"
          onClick={resetTimer}
          style={{ 
            backgroundColor: theme.colors.warning,
            color: theme.colors.buttonText
          }}
        >
          Reset
        </button>
        
        <button 
          className="timer-button switch"
          onClick={switchTurn}
          disabled={!isRunning}
          style={{ 
            backgroundColor: isRunning ? theme.colors.info : theme.colors.mediumGray,
            color: theme.colors.buttonText,
            opacity: isRunning ? 1 : 0.7
          }}
        >
          Switch
        </button>
      </div>
    </div>
  );
};

export default GameTimer;
