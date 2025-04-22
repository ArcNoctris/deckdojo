import React, { useState, useEffect } from 'react';
import { useTheme } from '../../contexts/ThemeContext';
import LifePointCalculator from './LifePointCalculator';
import GameTimer from './GameTimer';
import './Play.css';
import LoadingAnimation from '../../components/common/LoadingAnimation';


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
    return <LoadingAnimation fullScreen={true}/>;
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
