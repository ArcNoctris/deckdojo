import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { useTheme } from '../../contexts/ThemeContext';
import { db } from '../../services/firebase/firebase';
import { doc, onSnapshot, updateDoc, collection, addDoc, serverTimestamp } from 'firebase/firestore';
import { QRCodeSVG } from 'qrcode.react';
import './Duel.css';

const INITIAL_LIFE_POINTS = 8000;
const MATCH_TIMER = 45 * 60; // 45 minutes in seconds

const Duel = () => {
  const { sessionId } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const { currentUser, isAuthenticated } = useAuth();
  const { theme } = useTheme();
  const [duelSession, setDuelSession] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [player1LifePoints, setPlayer1LifePoints] = useState(INITIAL_LIFE_POINTS);
  const [player2LifePoints, setPlayer2LifePoints] = useState(INITIAL_LIFE_POINTS);
  const [timeRemaining, setTimeRemaining] = useState(MATCH_TIMER);
  const [gameStarted, setGameStarted] = useState(false);
  const [showQRCode, setShowQRCode] = useState(false);
  const [currentDuel, setCurrentDuel] = useState(1);
  const [player1Score, setPlayer1Score] = useState(0);
  const [player2Score, setPlayer2Score] = useState(0);
  const [matchOver, setMatchOver] = useState(false);
  const [matchWinner, setMatchWinner] = useState(null);
  const [showMatchSummary, setShowMatchSummary] = useState(false);
  const [showCalculator, setShowCalculator] = useState(false);
  const [calculatorValue, setCalculatorValue] = useState('');
  const [targetPlayer, setTargetPlayer] = useState(null);
  const [showDuelWinner, setShowDuelWinner] = useState(false);
  const [duelWinnerName, setDuelWinnerName] = useState('');
  const [matchPaused, setMatchPaused] = useState(false);
  const timerRef = useRef(null);
  
  // Parse query parameters for guest name
  const queryParams = new URLSearchParams(location.search);
  const guestName = queryParams.get('guestName');
  const isGuest = !isAuthenticated || !!guestName;

  useEffect(() => {
    if (!sessionId) {
      setError('No duel session ID provided');
      setLoading(false);
      return;
    }

    const unsubscribe = onSnapshot(
      doc(db, 'duels', sessionId),
      async (docSnapshot) => {
        if (docSnapshot.exists()) {
          const duelData = docSnapshot.data();
          setDuelSession(duelData);
          
          // Initialize game state from the duel data if it exists
          if (duelData.player1LifePoints !== undefined) {
            setPlayer1LifePoints(duelData.player1LifePoints);
          }
          
          if (duelData.player2LifePoints !== undefined) {
            setPlayer2LifePoints(duelData.player2LifePoints);
          }
          
          if (duelData.timeRemaining !== undefined) {
            setTimeRemaining(duelData.timeRemaining);
          }
          
          if (duelData.gameStarted !== undefined) {
            setGameStarted(duelData.gameStarted);
          }

          if (duelData.currentDuel !== undefined) {
            setCurrentDuel(duelData.currentDuel);
          }

          if (duelData.player1Score !== undefined) {
            setPlayer1Score(duelData.player1Score);
          }

          if (duelData.player2Score !== undefined) {
            setPlayer2Score(duelData.player2Score);
          }

          if (duelData.matchOver !== undefined) {
            setMatchOver(duelData.matchOver);
          }

          if (duelData.matchWinner !== undefined) {
            setMatchWinner(duelData.matchWinner);
          }
          
          if (duelData.matchPaused !== undefined) {
            setMatchPaused(duelData.matchPaused);
          }

          // If this is a guest joining a waiting duel, update the duel with guest info
          if (isGuest && 
              duelData.status === 'waiting' && 
              (duelData.player1Id !== 'guest' || guestName !== duelData.player1Name) &&
              !duelData.player2Id) {
            try {
              await updateDoc(doc(db, 'duels', sessionId), {
                player2Id: 'guest',
                player2Name: guestName || 'Guest Player',
                player2IsGuest: true,
                status: 'active',
                player2LifePoints: INITIAL_LIFE_POINTS,
                currentDuel: 1,
                player1Score: 0,
                player2Score: 0,
                matchOver: false,
                matchWinner: null,
                matchPaused: false
              });
            } catch (error) {
              console.error('Error joining duel as guest:', error);
            }
          }
          // If this is an authenticated user joining a waiting duel
          else if (isAuthenticated && 
                  duelData.status === 'waiting' && 
                  duelData.player1Id !== currentUser.uid && 
                  !duelData.player2Id) {
            try {
              await updateDoc(doc(db, 'duels', sessionId), {
                player2Id: currentUser.uid,
                player2Name: currentUser.displayName || 'Player 2',
                player2IsGuest: false,
                status: 'active',
                player2LifePoints: INITIAL_LIFE_POINTS,
                currentDuel: 1,
                player1Score: 0,
                player2Score: 0,
                matchOver: false,
                matchWinner: null,
                matchPaused: false
              });
            } catch (error) {
              console.error('Error joining duel:', error);
            }
          }
          
          setLoading(false);
        } else {
          setError('Duel session not found');
          setLoading(false);
        }
      },
      (error) => {
        console.error('Error fetching duel session:', error);
        setError('Failed to load duel session');
        setLoading(false);
      }
    );

    return () => unsubscribe();
  }, [sessionId, isAuthenticated, currentUser, guestName, isGuest]);

  // Timer effect
  useEffect(() => {
    if (gameStarted && timeRemaining > 0 && !matchOver && !matchPaused) {
      timerRef.current = setInterval(() => {
        setTimeRemaining(prevTime => {
          const newTime = prevTime - 1;
          // Update the timer in the database every 15 seconds
          if (newTime % 15 === 0 && duelSession) {
            updateDoc(doc(db, 'duels', sessionId), {
              timeRemaining: newTime
            }).catch(err => console.error('Error updating time:', err));
          }
          return newTime;
        });
      }, 1000);
    } else if (timeRemaining <= 0 || matchOver || matchPaused) {
      clearInterval(timerRef.current);
      
      // If time ran out and match isn't over, end the current duel
      if (timeRemaining <= 0 && !matchOver) {
        const winner = player1LifePoints > player2LifePoints ? 1 : 2;
        handleDuelEnd(winner);
      }
    }

    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
    };
  }, [gameStarted, timeRemaining, sessionId, duelSession, matchOver, player1LifePoints, player2LifePoints, matchPaused]);

  // Watch for life points reaching 0
  useEffect(() => {
    if (gameStarted && !matchOver) {
      if (player1LifePoints <= 0) {
        handleDuelEnd(2); // Player 2 wins this duel
      } else if (player2LifePoints <= 0) {
        handleDuelEnd(1); // Player 1 wins this duel
      }
    }
  }, [player1LifePoints, player2LifePoints, gameStarted, matchOver]);

  // Handle end of a single duel
  const handleDuelEnd = async (winner) => {
    try {
      let newPlayer1Score = player1Score;
      let newPlayer2Score = player2Score;
      let newMatchOver = matchOver;
      let newMatchWinner = matchWinner;
      let newCurrentDuel = currentDuel;
      let winnerName = winner === 1 ? duelSession.player1Name : duelSession.player2Name;

      // Show duel winner notification
      setDuelWinnerName(winnerName);
      setShowDuelWinner(true);

      // Update scores
      if (winner === 1) {
        newPlayer1Score += 1;
      } else {
        newPlayer2Score += 1;
      }

      // Check if match is over (best of 3)
      if (newPlayer1Score >= 2) {
        newMatchOver = true;
        newMatchWinner = duelSession.player1Name;
      } else if (newPlayer2Score >= 2) {
        newMatchOver = true;
        newMatchWinner = duelSession.player2Name;
      } else {
        // Move to next duel if match not over
        newCurrentDuel += 1;
      }

      // Update state
      setPlayer1Score(newPlayer1Score);
      setPlayer2Score(newPlayer2Score);
      setMatchOver(newMatchOver);
      setMatchWinner(newMatchWinner);
      setCurrentDuel(newCurrentDuel);

      // Reset life points for next duel if match not over
      if (!newMatchOver) {
        // Automatically close the duel winner notification after 3 seconds and reset life points
        setTimeout(() => {
          setShowDuelWinner(false);
          setPlayer1LifePoints(INITIAL_LIFE_POINTS);
          setPlayer2LifePoints(INITIAL_LIFE_POINTS);
        }, 3000);
      } else {
        // Save match history if match is over
        await saveMatchHistory(newPlayer1Score, newPlayer2Score, newMatchWinner);
        setShowMatchSummary(true);
        setTimeout(() => {
          setShowDuelWinner(false);
        }, 3000);
      }

      // Update database
      await updateDoc(doc(db, 'duels', sessionId), {
        player1Score: newPlayer1Score,
        player2Score: newPlayer2Score,
        matchOver: newMatchOver,
        matchWinner: newMatchWinner,
        currentDuel: newCurrentDuel,
        player1LifePoints: newMatchOver ? player1LifePoints : INITIAL_LIFE_POINTS,
        player2LifePoints: newMatchOver ? player2LifePoints : INITIAL_LIFE_POINTS,
        duelResults: {
          ...(duelSession.duelResults || {}),
          [currentDuel]: {
            winner,
            player1LP: player1LifePoints,
            player2LP: player2LifePoints,
            endTime: new Date().toISOString()
          }
        }
      });
    } catch (error) {
      console.error('Error handling duel end:', error);
    }
  };

  // Save match history to Firebase
  const saveMatchHistory = async (p1Score, p2Score, winner) => {
    try {
      await addDoc(collection(db, 'matchHistory'), {
        matchId: sessionId,
        player1Id: duelSession.player1Id,
        player1Name: duelSession.player1Name,
        player1Deck: duelSession.player1Deck,
        player1IsGuest: duelSession.isGuestHost,
        player1Score: p1Score,
        player2Id: duelSession.player2Id,
        player2Name: duelSession.player2Name,
        player2Deck: duelSession.player2Deck,
        player2IsGuest: duelSession.player2IsGuest,
        player2Score: p2Score,
        winner,
        createdAt: serverTimestamp(),
        duelResults: duelSession.duelResults || {}
      });
    } catch (error) {
      console.error('Error saving match history:', error);
    }
  };

  const updateLifePoints = async (player, amount) => {
    try {
      const field = player === 1 ? 'player1LifePoints' : 'player2LifePoints';
      const currentPoints = player === 1 ? player1LifePoints : player2LifePoints;
      const newPoints = Math.max(0, currentPoints + amount);
      
      if (player === 1) {
        setPlayer1LifePoints(newPoints);
      } else {
        setPlayer2LifePoints(newPoints);
      }
      
      await updateDoc(doc(db, 'duels', sessionId), {
        [field]: newPoints
      });
    } catch (error) {
      console.error('Error updating life points:', error);
    }
  };

  const openCalculator = (player) => {
    setTargetPlayer(player);
    setCalculatorValue('');
    setShowCalculator(true);
  };

  const handleCalculatorInput = (value) => {
    if (value === 'C') {
      setCalculatorValue('');
    } else if (value === '←') {
      setCalculatorValue(prev => prev.slice(0, -1));
    } else if (value === '×2') {
      // Multiply current value by 2
      if (calculatorValue) {
        const currentValue = parseInt(calculatorValue, 10);
        setCalculatorValue((currentValue * 2).toString());
      }
    } else if (value === '÷2') {
      // Divide current value by 2
      if (calculatorValue) {
        const currentValue = parseInt(calculatorValue, 10);
        setCalculatorValue(Math.floor(currentValue / 2).toString());
      }
    } else if (value === 'Apply+') {
      // Apply positive change
      if (calculatorValue && targetPlayer) {
        const amount = parseInt(calculatorValue, 10);
        updateLifePoints(targetPlayer, amount);
        setShowCalculator(false);
      }
    } else if (value === 'Apply-') {
      // Apply negative change
      if (calculatorValue && targetPlayer) {
        const amount = parseInt(calculatorValue, 10);
        updateLifePoints(targetPlayer, -amount);
        setShowCalculator(false);
      }
    } else {
      setCalculatorValue(prev => prev + value);
    }
  };

  const togglePauseMatch = async () => {
    try {
      const newPauseState = !matchPaused;
      setMatchPaused(newPauseState);
      
      await updateDoc(doc(db, 'duels', sessionId), {
        matchPaused: newPauseState
      });
    } catch (error) {
      console.error('Error toggling match pause:', error);
    }
  };

  const startGame = async () => {
    try {
      await updateDoc(doc(db, 'duels', sessionId), {
        gameStarted: true,
        timeRemaining: MATCH_TIMER,
        player1LifePoints: INITIAL_LIFE_POINTS,
        player2LifePoints: INITIAL_LIFE_POINTS,
        currentDuel: 1,
        player1Score: 0,
        player2Score: 0,
        matchOver: false,
        matchWinner: null,
        matchPaused: false
      });
      setGameStarted(true);
      setPlayer1Score(0);
      setPlayer2Score(0);
      setCurrentDuel(1);
      setMatchOver(false);
      setMatchWinner(null);
      setShowMatchSummary(false);
      setMatchPaused(false);
    } catch (error) {
      console.error('Error starting game:', error);
    }
  };

  const rematch = async () => {
    try {
      await updateDoc(doc(db, 'duels', sessionId), {
        gameStarted: true,
        timeRemaining: MATCH_TIMER,
        player1LifePoints: INITIAL_LIFE_POINTS,
        player2LifePoints: INITIAL_LIFE_POINTS,
        currentDuel: 1,
        player1Score: 0,
        player2Score: 0,
        matchOver: false,
        matchWinner: null,
        duelResults: {},
        matchPaused: false
      });
      setTimeRemaining(MATCH_TIMER);
      setGameStarted(true);
      setPlayer1LifePoints(INITIAL_LIFE_POINTS);
      setPlayer2LifePoints(INITIAL_LIFE_POINTS);
      setPlayer1Score(0);
      setPlayer2Score(0);
      setCurrentDuel(1);
      setMatchOver(false);
      setMatchWinner(null);
      setShowMatchSummary(false);
      setMatchPaused(false);
    } catch (error) {
      console.error('Error starting rematch:', error);
    }
  };

  const formatTime = (seconds) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}:${remainingSeconds < 10 ? '0' : ''}${remainingSeconds}`;
  };

  const getLifePointsColor = (lifePoints) => {
    if (lifePoints > INITIAL_LIFE_POINTS) {
      // Blue to purple gradient for points above 8000
      const extraRatio = Math.min((lifePoints - INITIAL_LIFE_POINTS) / 8000, 1);
      return `hsl(${240 - extraRatio * 60}, 100%, 50%)`;
    } else if (lifePoints > INITIAL_LIFE_POINTS * 0.5) {
      // Green for 50-100% of initial
      return '#2ecc71';
    } else if (lifePoints > INITIAL_LIFE_POINTS * 0.25) {
      // Yellow for 25-50% of initial
      return '#f1c40f';
    } else {
      // Red for 0-25% of initial
      return '#e74c3c';
    }
  };

  const getInviteUrl = () => {
    return `${window.location.origin}/duel/${sessionId}`;
  };

  if (loading) {
    return (
      <div className="duel-container" style={{ backgroundColor: theme.colors.background }}>
        <div className="loading-message">Loading duel session...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="duel-container" style={{ backgroundColor: theme.colors.background }}>
        <div className="error-message">{error}</div>
        <button 
          className="back-button"
          onClick={() => navigate('/duel')}
          style={{
            backgroundColor: theme.colors.primary,
            color: theme.colors.text
          }}
        >
          Back to Duel Lobby
        </button>
      </div>
    );
  }

  if (!duelSession) {
    return (
      <div className="duel-container" style={{ backgroundColor: theme.colors.background }}>
        <div className="error-message">Duel session not found</div>
        <button 
          className="back-button"
          onClick={() => navigate('/duel')}
          style={{
            backgroundColor: theme.colors.primary,
            color: theme.colors.text
          }}
        >
          Back to Duel Lobby
        </button>
      </div>
    );
  }

  // Check if the user is part of this duel
  const isPlayer1 = isAuthenticated 
    ? duelSession.player1Id === currentUser.uid 
    : (duelSession.player1Id === 'guest' && guestName === duelSession.player1Name);
    
  const isPlayer2 = isAuthenticated 
    ? duelSession.player2Id === currentUser.uid 
    : (duelSession.player2Id === 'guest' && guestName === duelSession.player2Name);

  if (!isPlayer1 && !isPlayer2) {
    return (
      <div className="duel-container" style={{ backgroundColor: theme.colors.background }}>
        <div className="error-message">You are not part of this duel</div>
        <button 
          className="back-button"
          onClick={() => navigate('/duel')}
          style={{
            backgroundColor: theme.colors.primary,
            color: theme.colors.text
          }}
        >
          Back to Duel Lobby
        </button>
      </div>
    );
  }

  return (
    <div className="duel-container" style={{ backgroundColor: theme.colors.background }}>
      {/* Duel Winner Notification */}
      {showDuelWinner && (
        <div className="duel-winner-notification" style={{ backgroundColor: theme.colors.success }}>
          <div className="duel-winner-text">
            {duelWinnerName} won duel #{currentDuel - (currentDuel > 1 ? 1 : 0)}!
          </div>
        </div>
      )}

      <div className="duel-header">
        <div className="duel-info">
          <h2 style={{ color: theme.colors.text }}>Duel Session</h2>
          <div className="match-info" style={{ color: theme.colors.textSecondary }}>
            <span>Match: {player1Score} - {player2Score}</span>
            <span>Current Duel: {currentDuel}</span>
            {matchPaused && <span className="paused-indicator">PAUSED</span>}
          </div>
        </div>
        <div className="game-timer" style={{ color: theme.colors.primary }}>
          Time: {formatTime(timeRemaining)}
        </div>
      </div>

      <div className="players-area">
        <div className="player-card" style={{ backgroundColor: theme.colors.cardBackground }}>
          <div className="player-header">
            <div className="player-name" style={{ color: theme.colors.text }}>
              {duelSession.player1Name}
              {duelSession.isGuestHost && <span style={{ fontStyle: 'italic' }}> (Guest)</span>}
            </div>
            <div className="player-score" style={{ color: theme.colors.primary }}>
              Score: {player1Score}
            </div>
          </div>
          
          <div className="life-points-display">
            <div className="life-points-value" style={{ color: theme.colors.text }}>
              {player1LifePoints} LP
            </div>
            <div className="life-points-bar-container">
              <div 
                className="life-points-bar"
                style={{ 
                  width: `${Math.min(player1LifePoints / INITIAL_LIFE_POINTS * 100, 100)}%`,
                  backgroundColor: getLifePointsColor(player1LifePoints)
                }}
              ></div>
              {player1LifePoints > INITIAL_LIFE_POINTS && (
                <div 
                  className="life-points-bar extra"
                  style={{ 
                    width: `${Math.min((player1LifePoints - INITIAL_LIFE_POINTS) / INITIAL_LIFE_POINTS * 100, 100)}%`,
                    backgroundColor: getLifePointsColor(player1LifePoints)
                  }}
                ></div>
              )}
            </div>
          </div>
          
          {gameStarted && !matchOver && !matchPaused && (
            <div className="life-point-controls">
              <button 
                onClick={() => updateLifePoints(1, -100)}
                style={{ backgroundColor: theme.colors.error }}
              >
                -100
              </button>
              <button 
                onClick={() => updateLifePoints(1, -500)}
                style={{ backgroundColor: theme.colors.error }}
              >
                -500
              </button>
              <button 
                onClick={() => updateLifePoints(1, -1000)}
                style={{ backgroundColor: theme.colors.error }}
              >
                -1000
              </button>
              <button 
                onClick={() => updateLifePoints(1, 100)}
                style={{ backgroundColor: theme.colors.success }}
              >
                +100
              </button>
              <button 
                onClick={() => updateLifePoints(1, 500)}
                style={{ backgroundColor: theme.colors.success }}
              >
                +500
              </button>
              <button 
                onClick={() => updateLifePoints(1, 1000)}
                style={{ backgroundColor: theme.colors.success }}
              >
                +1000
              </button>
              <button
                onClick={() => openCalculator(1)}
                style={{ 
                  backgroundColor: theme.colors.secondary,
                  gridColumn: 'span 3' 
                }}
              >
                Calculator
              </button>
            </div>
          )}
        </div>

        <div className="vs-indicator" style={{ color: theme.colors.text }}>VS</div>

        <div className="player-card" style={{ backgroundColor: theme.colors.cardBackground }}>
          <div className="player-header">
            <div className="player-name" style={{ color: theme.colors.text }}>
              {duelSession.player2Name || 'Waiting for player...'}
              {duelSession.player2IsGuest && <span style={{ fontStyle: 'italic' }}> (Guest)</span>}
            </div>
            <div className="player-score" style={{ color: theme.colors.primary }}>
              Score: {player2Score}
            </div>
          </div>
          
          <div className="life-points-display">
            <div className="life-points-value" style={{ color: theme.colors.text }}>
              {player2LifePoints} LP
            </div>
            <div className="life-points-bar-container">
              <div 
                className="life-points-bar"
                style={{ 
                  width: `${Math.min(player2LifePoints / INITIAL_LIFE_POINTS * 100, 100)}%`,
                  backgroundColor: getLifePointsColor(player2LifePoints)
                }}
              ></div>
              {player2LifePoints > INITIAL_LIFE_POINTS && (
                <div 
                  className="life-points-bar extra"
                  style={{ 
                    width: `${Math.min((player2LifePoints - INITIAL_LIFE_POINTS) / INITIAL_LIFE_POINTS * 100, 100)}%`,
                    backgroundColor: getLifePointsColor(player2LifePoints)
                  }}
                ></div>
              )}
            </div>
          </div>
          
          {gameStarted && !matchOver && !matchPaused && duelSession.player2Id && (
            <div className="life-point-controls">
              <button 
                onClick={() => updateLifePoints(2, -100)}
                style={{ backgroundColor: theme.colors.error }}
              >
                -100
              </button>
              <button 
                onClick={() => updateLifePoints(2, -500)}
                style={{ backgroundColor: theme.colors.error }}
              >
                -500
              </button>
              <button 
                onClick={() => updateLifePoints(2, -1000)}
                style={{ backgroundColor: theme.colors.error }}
              >
                -1000
              </button>
              <button 
                onClick={() => updateLifePoints(2, 100)}
                style={{ backgroundColor: theme.colors.success }}
              >
                +100
              </button>
              <button 
                onClick={() => updateLifePoints(2, 500)}
                style={{ backgroundColor: theme.colors.success }}
              >
                +500
              </button>
              <button 
                onClick={() => updateLifePoints(2, 1000)}
                style={{ backgroundColor: theme.colors.success }}
              >
                +1000
              </button>
              <button
                onClick={() => openCalculator(2)}
                style={{ 
                  backgroundColor: theme.colors.secondary,
                  gridColumn: 'span 3' 
                }}
              >
                Calculator
              </button>
            </div>
          )}
        </div>
      </div>

      {showMatchSummary && matchOver && (
        <div className="match-summary" style={{ backgroundColor: theme.colors.surface }}>
          <h3 style={{ color: theme.colors.text }}>Match Complete!</h3>
          <div className="match-result" style={{ color: theme.colors.primary }}>
            {matchWinner} wins the match ({player1Score} - {player2Score})
          </div>
          <div className="match-actions">
            <button 
              onClick={rematch}
              style={{
                backgroundColor: theme.colors.secondary,
                color: theme.colors.text
              }}
            >
              Rematch
            </button>
          </div>
        </div>
      )}

      <div className="game-controls">
        {!gameStarted && duelSession.player2Id && (
          <button 
            onClick={startGame}
            style={{
              backgroundColor: theme.colors.success,
              color: theme.colors.text
            }}
          >
            Start Match
          </button>
        )}
        
        {gameStarted && !matchOver && (
          <button 
            onClick={togglePauseMatch}
            style={{
              backgroundColor: matchPaused ? theme.colors.success : theme.colors.warning,
              color: theme.colors.text
            }}
          >
            {matchPaused ? 'Resume Match' : 'Pause Match'}
          </button>
        )}
        
        {matchOver && !showMatchSummary && (
          <button 
            onClick={() => setShowMatchSummary(true)}
            style={{
              backgroundColor: theme.colors.primary,
              color: theme.colors.text
            }}
          >
            View Results
          </button>
        )}
        
        <button 
          onClick={() => setShowQRCode(!showQRCode)}
          style={{
            backgroundColor: theme.colors.secondary,
            color: theme.colors.text
          }}
        >
          {showQRCode ? 'Hide QR Code' : 'Show QR Code'}
        </button>
        
        <button 
          onClick={() => navigate('/duel')}
          style={{
            backgroundColor: theme.colors.primary,
            color: theme.colors.text
          }}
        >
          Back to Lobby
        </button>
      </div>

      {showQRCode && (
        <div className="qr-code-container">
          <h3 style={{ color: theme.colors.text }}>Scan to Join the Duel</h3>
          <QRCodeSVG value={getInviteUrl()} size={200} />
          <div className="invite-url" style={{ color: theme.colors.text }}>
            {getInviteUrl()}
          </div>
        </div>
      )}

      {/* Calculator Modal */}
      {showCalculator && (
        <div className="calculator-modal">
          <div className="calculator" style={{ backgroundColor: theme.colors.surface }}>
            <div className="calculator-header">
              <h3 style={{ color: theme.colors.text }}>
                Life Points Calculator - Player {targetPlayer}
              </h3>
              <button 
                className="close-button"
                onClick={() => setShowCalculator(false)}
                style={{ color: theme.colors.error }}
              >
                ×
              </button>
            </div>
            <div 
              className="calculator-display"
              style={{ 
                backgroundColor: theme.colors.background,
                color: theme.colors.text 
              }}
            >
              {calculatorValue || '0'}
            </div>
            <div className="calculator-buttons">
              <button onClick={() => handleCalculatorInput('7')}>7</button>
              <button onClick={() => handleCalculatorInput('8')}>8</button>
              <button onClick={() => handleCalculatorInput('9')}>9</button>
              <button onClick={() => handleCalculatorInput('×2')}>×2</button>
              <button onClick={() => handleCalculatorInput('4')}>4</button>
              <button onClick={() => handleCalculatorInput('5')}>5</button>
              <button onClick={() => handleCalculatorInput('6')}>6</button>
              <button onClick={() => handleCalculatorInput('÷2')}>÷2</button>
              <button onClick={() => handleCalculatorInput('1')}>1</button>
              <button onClick={() => handleCalculatorInput('2')}>2</button>
              <button onClick={() => handleCalculatorInput('3')}>3</button>
              <button onClick={() => handleCalculatorInput('←')}>←</button>
              <button onClick={() => handleCalculatorInput('0')}>0</button>
              <button onClick={() => handleCalculatorInput('00')}>00</button>
              <button onClick={() => handleCalculatorInput('000')}>000</button>
              <button onClick={() => handleCalculatorInput('C')}>C</button>
              <button 
                onClick={() => handleCalculatorInput('Apply+')}
                style={{ 
                  backgroundColor: theme.colors.success,
                  gridColumn: 'span 2' 
                }}
              >
                Apply +
              </button>
              <button 
                onClick={() => handleCalculatorInput('Apply-')}
                style={{ 
                  backgroundColor: theme.colors.error,
                  gridColumn: 'span 2' 
                }}
              >
                Apply -
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Duel; 