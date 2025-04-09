import React, { useState, useEffect } from 'react';
import { useTheme } from '../../contexts/ThemeContext';
import LifePointCalculator from './LifePointCalculator';
import GameTimer from './GameTimer';
import './Play.css';

const Play = () => {
  const { theme } = useTheme();
  const [isLoading, setIsLoading] = useState(true);
  const [activeCalculator, setActiveCalculator] = useState(null);
  const [calculatorValue, setCalculatorValue] = useState('');
  const [player1LP, setPlayer1LP] = useState(8000);
  const [player2LP, setPlayer2LP] = useState(8000);
  const [player1History, setPlayer1History] = useState([{ value: 8000, change: 0, operation: 'reset' }]);
  const [player2History, setPlayer2History] = useState([{ value: 8000, change: 0, operation: 'reset' }]);

  // Simulate loading for demo purposes
  useEffect(() => {
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 1500);
    
    return () => clearTimeout(timer);
  }, []);

  // Handle player click to show calculator
  const handlePlayerClick = (player) => {
    if (activeCalculator === player) {
      setActiveCalculator(null);
    } else {
      setActiveCalculator(player);
      setCalculatorValue(''); // Reset calculator value when switching players
    }
  };

  // Handle calculator input
  const handleCalculatorInput = (value) => {
    if (calculatorValue.length < 5) {
      setCalculatorValue(prev => prev + value);
    }
  };

  // Clear calculator input
  const clearCalculatorInput = () => {
    setCalculatorValue('');
  };

  // Reset life points for a player
  const resetLifePoints = (player) => {
    if (player === 'player1') {
      setPlayer1LP(8000);
      setPlayer1History([{ value: 8000, change: 0, operation: 'reset' }]);
    } else {
      setPlayer2LP(8000);
      setPlayer2History([{ value: 8000, change: 0, operation: 'reset' }]);
    }
    setCalculatorValue('');
  };

  // Apply calculation (add or subtract)
  const applyCalculation = (operation) => {
    if (calculatorValue) {
      const changeValue = parseInt(calculatorValue, 10);
      let newLifePoints;
      
      if (activeCalculator === 'player1') {
        if (operation === 'add') {
          newLifePoints = player1LP + changeValue;
        } else {
          newLifePoints = player1LP - changeValue;
        }
        
        // Ensure life points don't go below 0
        newLifePoints = Math.max(0, newLifePoints);
        
        // Update history
        setPlayer1History(prev => [
          { 
            value: newLifePoints, 
            change: changeValue, 
            operation 
          },
          ...prev
        ]);
        
        // Update life points
        setPlayer1LP(newLifePoints);
      } else {
        if (operation === 'add') {
          newLifePoints = player2LP + changeValue;
        } else {
          newLifePoints = player2LP - changeValue;
        }
        
        // Ensure life points don't go below 0
        newLifePoints = Math.max(0, newLifePoints);
        
        // Update history
        setPlayer2History(prev => [
          { 
            value: newLifePoints, 
            change: changeValue, 
            operation 
          },
          ...prev
        ]);
        
        // Update life points
        setPlayer2LP(newLifePoints);
      }
      
      // Clear calculator input
      clearCalculatorInput();
    }
  };

  if (isLoading) {
    return (
      <div className="play-loading" style={{ backgroundColor: theme.colors.background }}>
        <div className="loading-animation">
          <svg className="loading-logo" viewBox="120.216 73.984 264.63 268.193" xmlns="http://www.w3.org/2000/svg">
            <path className="loading-path" fill={theme.colors.secondary} d="M 290.32 80.49 L 289.75 85.48 Q 287.86 89.51 285.18 92.96 Q 284.50 93.83 283.54 94.39 Q 283.11 94.64 282.85 95.07 C 280.61 98.77 276.47 100.41 272.93 102.57 Q 272.39 102.90 272.33 102.28 Q 272.29 101.92 272.51 101.46 Q 274.83 97.91 277.62 94.75 Q 280.68 91.29 282.28 88.84 Q 284.33 85.72 286.43 82.53 L 289.64 77.48 Q 289.94 77.02 290.09 77.55 Q 290.47 78.88 290.32 80.49 Z"/>
            <path className="loading-path" fill={theme.colors.primary} d="M 246.75 81.86 Q 247.88 86.34 247.38 91.15 Q 247.33 91.58 247.77 91.58 L 258.80 91.55 A 1.09 1.08 -1.7 0 0 259.89 90.40 Q 259.64 86.02 261.56 82.50 Q 267.87 79.22 274.75 81.45 C 276.57 82.04 277.40 83.21 278.76 84.37 Q 279.17 84.72 279.71 84.67 Q 282.98 84.39 286.43 82.53 Q 284.33 85.72 282.28 88.84 Q 280.68 91.29 277.62 94.75 Q 274.83 97.91 272.51 101.46 Q 272.37 101.41 272.22 101.39 Q 271.94 101.35 271.89 101.07 L 271.77 100.49 C 272.85 98.00 275.69 88.31 272.56 86.65 Q 271.82 86.26 271.71 86.52 L 268.10 86.61 Q 267.48 86.62 267.70 87.20 C 270.09 93.47 263.24 103.62 259.01 108.74 Q 256.34 111.99 250.33 115.88 Q 241.95 121.32 239.33 122.36 Q 236.85 123.34 234.55 124.24 C 229.19 124.35 228.02 126.95 225.28 130.43 Q 225.57 127.13 225.51 124.51 Q 225.48 122.88 224.56 121.56 Q 224.27 121.14 223.77 121.09 Q 222.87 121.00 221.58 121.35 Q 216.82 123.59 212.99 127.96 Q 210.86 130.39 209.56 134.07 Q 209.51 133.91 209.46 133.76 Q 208.23 133.54 208.33 132.49"/>
          </svg>
        </div>
        <p className="loading-text" style={{ color: theme.colors.text }}>Loading Duel Arena...</p>
      </div>
    );
  }

  return (
    <div className="play-container" style={{ backgroundColor: theme.colors.background }}>
      <div className="play-header">
        <h1 style={{ color: theme.colors.text }}>Duel Arena</h1>
      </div>
      
      <div className="duel-arena">
        {/* Player 1 */}
        <div className="player-section player1">
          <LifePointCalculator 
            playerName="Player 1" 
            position="top" 
            onClick={() => handlePlayerClick('player1')}
            lifePoints={player1LP}
          />
          
          {activeCalculator === 'player1' && (
            <div className="calculator-popup">
              <div 
                className="calculator-popup-content"
                style={{ 
                  backgroundColor: theme.colors.surface,
                  borderColor: theme.colors.border
                }}
              >
                <div className="calculator-header">
                  <h3 style={{ color: theme.colors.text }}>Player 1 Calculator</h3>
                  <button 
                    className="close-button"
                    onClick={() => setActiveCalculator(null)}
                    style={{ color: theme.colors.text }}
                  >
                    ×
                  </button>
                </div>
                <div className="calculator">
                  <div 
                    className="calculator-display"
                    style={{ 
                      backgroundColor: theme.colors.cardBackground,
                      color: theme.colors.text,
                      borderColor: theme.colors.border
                    }}
                  >
                    {calculatorValue || '0'}
                  </div>
                  
                  <div className="calculator-buttons">
                    <div className="number-buttons">
                      {[1, 2, 3, 4, 5, 6, 7, 8, 9, 0].map(num => (
                        <button 
                          key={num}
                          onClick={() => handleCalculatorInput(num.toString())}
                          style={{ 
                            backgroundColor: theme.colors.buttonPrimary,
                            color: theme.colors.buttonText
                          }}
                        >
                          {num}
                        </button>
                      ))}
                      <button 
                        onClick={clearCalculatorInput}
                        style={{ 
                          backgroundColor: theme.colors.buttonSecondary,
                          color: theme.colors.buttonText
                        }}
                      >
                        C
                      </button>
                      <button 
                        onClick={() => resetLifePoints('player1')}
                        style={{ 
                          backgroundColor: theme.colors.warning,
                          color: theme.colors.buttonText
                        }}
                      >
                        Reset
                      </button>
                    </div>
                    
                    <div className="operation-buttons">
                      <button 
                        onClick={() => applyCalculation('add')}
                        style={{ 
                          backgroundColor: theme.colors.success,
                          color: theme.colors.buttonText
                        }}
                      >
                        +
                      </button>
                      <button 
                        onClick={() => applyCalculation('subtract')}
                        style={{ 
                          backgroundColor: theme.colors.error,
                          color: theme.colors.buttonText
                        }}
                      >
                        -
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
        
        {/* Timer in the middle */}
        <div className="center-timer">
          <GameTimer />
        </div>
        
        {/* Player 2 */}
        <div className="player-section player2">
          <LifePointCalculator 
            playerName="Player 2" 
            position="bottom" 
            onClick={() => handlePlayerClick('player2')}
            lifePoints={player2LP}
          />
          
          {activeCalculator === 'player2' && (
            <div className="calculator-popup">
              <div 
                className="calculator-popup-content"
                style={{ 
                  backgroundColor: theme.colors.surface,
                  borderColor: theme.colors.border
                }}
              >
                <div className="calculator-header">
                  <h3 style={{ color: theme.colors.text }}>Player 2 Calculator</h3>
                  <button 
                    className="close-button"
                    onClick={() => setActiveCalculator(null)}
                    style={{ color: theme.colors.text }}
                  >
                    ×
                  </button>
                </div>
                <div className="calculator">
                  <div 
                    className="calculator-display"
                    style={{ 
                      backgroundColor: theme.colors.cardBackground,
                      color: theme.colors.text,
                      borderColor: theme.colors.border
                    }}
                  >
                    {calculatorValue || '0'}
                  </div>
                  
                  <div className="calculator-buttons">
                    <div className="number-buttons">
                      {[1, 2, 3, 4, 5, 6, 7, 8, 9, 0].map(num => (
                        <button 
                          key={num}
                          onClick={() => handleCalculatorInput(num.toString())}
                          style={{ 
                            backgroundColor: theme.colors.buttonPrimary,
                            color: theme.colors.buttonText
                          }}
                        >
                          {num}
                        </button>
                      ))}
                      <button 
                        onClick={clearCalculatorInput}
                        style={{ 
                          backgroundColor: theme.colors.buttonSecondary,
                          color: theme.colors.buttonText
                        }}
                      >
                        C
                      </button>
                      <button 
                        onClick={() => resetLifePoints('player2')}
                        style={{ 
                          backgroundColor: theme.colors.warning,
                          color: theme.colors.buttonText
                        }}
                      >
                        Reset
                      </button>
                    </div>
                    
                    <div className="operation-buttons">
                      <button 
                        onClick={() => applyCalculation('add')}
                        style={{ 
                          backgroundColor: theme.colors.success,
                          color: theme.colors.buttonText
                        }}
                      >
                        +
                      </button>
                      <button 
                        onClick={() => applyCalculation('subtract')}
                        style={{ 
                          backgroundColor: theme.colors.error,
                          color: theme.colors.buttonText
                        }}
                      >
                        -
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Play;
