import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { useTheme } from '../../contexts/ThemeContext';
import { db } from '../../services/firebase/firebase';
import { collection, query, where, onSnapshot, addDoc, serverTimestamp } from 'firebase/firestore';
import { getUserDecks } from '../../services/deckService';
import './DuelLobby.css';

const DuelLobby = () => {
  const navigate = useNavigate();
  const { currentUser, isAuthenticated } = useAuth();
  const { theme } = useTheme();
  const [duels, setDuels] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedDeck, setSelectedDeck] = useState(null);
  const [userDecks, setUserDecks] = useState([]);
  const [guestName, setGuestName] = useState('');
  const [isGuest, setIsGuest] = useState(!isAuthenticated);
  const [useGuestMode, setUseGuestMode] = useState(!isAuthenticated);

  useEffect(() => {
    // Fetch available duels
    const q = query(
      collection(db, 'duels'),
      where('status', '==', 'waiting')
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const duelList = [];
      snapshot.forEach((doc) => {
        duelList.push({ id: doc.id, ...doc.data() });
      });
      setDuels(duelList);
      setLoading(false);
    }, (error) => {
      console.error('Error fetching duels:', error);
      setError('Failed to load duels');
      setLoading(false);
    });

    // Only fetch decks if user is authenticated and not in guest mode
    if (isAuthenticated && !useGuestMode) {
      // Fetch user's decks using the same service as DeckWelcome
      const fetchDecks = async () => {
        try {
          const fetchedDecks = await getUserDecks(currentUser.uid);
          setUserDecks(fetchedDecks);
        } catch (error) {
          console.error('Error fetching decks:', error);
        }
      };
      
      fetchDecks();
    }

    return () => {
      unsubscribe();
    };
  }, [currentUser, isAuthenticated, useGuestMode]);

  const createDuel = async () => {
    try {
      if (useGuestMode && !guestName) {
        setError('Please enter a guest name');
        return;
      }

      const duelRef = await addDoc(collection(db, 'duels'), {
        player1Id: useGuestMode ? 'guest' : currentUser.uid,
        player1Name: useGuestMode ? guestName : (currentUser.displayName || 'Player 1'),
        player1Deck: selectedDeck || { name: 'Not Specified' },
        status: 'waiting',
        createdAt: serverTimestamp(),
        isGuestHost: useGuestMode
      });

      navigate(`/duel/${duelRef.id}${useGuestMode ? `?guestName=${encodeURIComponent(guestName)}` : ''}`);
    } catch (error) {
      console.error('Error creating duel:', error);
      setError('Failed to create duel');
    }
  };

  const joinDuel = async (duelId) => {
    try {
      if (useGuestMode && !guestName) {
        setError('Please enter a guest name');
        return;
      }
      
      navigate(`/duel/${duelId}${useGuestMode ? `?guestName=${encodeURIComponent(guestName)}` : ''}`);
    } catch (error) {
      console.error('Error joining duel:', error);
      setError('Failed to join duel');
    }
  };

  if (loading) {
    return (
      <div className="duel-lobby" style={{ backgroundColor: theme.colors.background }}>
        <div className="loading-message">Loading duels...</div>
      </div>
    );
  }

  const allDecks = [
    { id: 'not-specified', name: 'Not Specified' },
    ...(isAuthenticated && !useGuestMode ? userDecks : [])
  ];

  return (
    <div className="duel-lobby" style={{ backgroundColor: theme.colors.background }}>
      <div className="lobby-header">
        <h2 style={{ color: theme.colors.text }}>Duel Lobby</h2>
        
        {isAuthenticated && (
          <div className="auth-toggle" style={{ marginBottom: '15px' }}>
            <button 
              onClick={() => setUseGuestMode(!useGuestMode)}
              style={{
                backgroundColor: theme.colors.secondary,
                color: theme.colors.text,
                padding: '8px 12px',
                border: 'none',
                borderRadius: '4px',
                cursor: 'pointer'
              }}
            >
              {useGuestMode ? 'Use Authenticated Account' : 'Use Guest Mode'}
            </button>
          </div>
        )}
        
        {useGuestMode ? (
          <div className="guest-controls">
            <input
              type="text"
              placeholder="Enter your guest name"
              value={guestName}
              onChange={(e) => setGuestName(e.target.value)}
              style={{
                backgroundColor: theme.colors.background,
                color: theme.colors.text,
                borderColor: theme.colors.border,
                padding: '8px',
                borderRadius: '4px',
                width: '100%',
                maxWidth: '300px'
              }}
            />
          </div>
        ) : (
          <div className="deck-selection">
            <label style={{ color: theme.colors.text }}>Select Deck:</label>
            <select
              value={selectedDeck?.id || 'not-specified'}
              onChange={(e) => {
                if (e.target.value === 'not-specified') {
                  setSelectedDeck(null);
                } else {
                  const deck = allDecks.find(d => d.id === e.target.value);
                  setSelectedDeck(deck);
                }
              }}
              style={{
                backgroundColor: theme.colors.background,
                color: theme.colors.text,
                borderColor: theme.colors.border
              }}
            >
              {allDecks.map(deck => (
                <option key={deck.id} value={deck.id}>
                  {deck.name}
                </option>
              ))}
            </select>
          </div>
        )}
      </div>

      {error && (
        <div className="error-message" style={{ color: theme.colors.error }}>
          {error}
        </div>
      )}

      <div className="lobby-actions">
        <button
          className="create-duel-button"
          onClick={createDuel}
          style={{
            backgroundColor: theme.colors.primary,
            color: theme.colors.text
          }}
        >
          Create New Duel
        </button>
      </div>

      <div className="available-duels">
        <h3 style={{ color: theme.colors.text }}>Available Duels</h3>
        {duels.length === 0 ? (
          <p style={{ color: theme.colors.text }}>No duels available</p>
        ) : (
          <div className="duel-list">
            {duels.map(duel => (
              <div
                key={duel.id}
                className="duel-item"
                style={{
                  backgroundColor: theme.colors.cardBackground,
                  borderColor: theme.colors.border
                }}
              >
                <div className="duel-info">
                  <span style={{ color: theme.colors.text }}>
                    Host: {duel.player1Name}
                  </span>
                  <span style={{ color: theme.colors.text }}>
                    Deck: {duel.player1Deck?.name || 'Not Specified'}
                  </span>
                  {duel.isGuestHost && (
                    <span style={{ color: theme.colors.text, fontStyle: 'italic' }}>
                      (Guest host)
                    </span>
                  )}
                </div>
                <button
                  className="join-button"
                  onClick={() => joinDuel(duel.id)}
                  style={{
                    backgroundColor: theme.colors.primary,
                    color: theme.colors.text
                  }}
                >
                  Join Duel
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      <div style={{ marginTop: '30px', padding: '15px', backgroundColor: theme.colors.cardBackground, borderRadius: '8px' }}>
        <h3 style={{ color: theme.colors.text }}>Access From Mobile Device</h3>
        <p style={{ color: theme.colors.text }}>
          To access this duel lobby from your smartphone on the same WiFi network, open your phone's browser and navigate to:
        </p>
        <div style={{ 
          padding: '10px', 
          backgroundColor: 'rgba(0,0,0,0.1)', 
          borderRadius: '4px', 
          marginTop: '10px',
          color: theme.colors.primary,
          textAlign: 'center',
          fontWeight: 'bold'
        }}>
          http://192.168.178.54:3000
        </div>
      </div>
    </div>
  );
};

export default DuelLobby; 