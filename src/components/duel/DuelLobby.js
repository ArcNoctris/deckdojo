import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { useTheme } from '../../contexts/ThemeContext';
import { db } from '../../services/firebase/firebase';
import { collection, query, where, onSnapshot, addDoc, serverTimestamp } from 'firebase/firestore';
import { getUserDecks } from '../../services/deckService';
import PageBackground from '../common/PageBackground';
import { pageBackgrounds } from '../../assets/images/page-backgrounds';
import QRCode from 'qrcode.react';
import './Duel.css';

const DuelLobby = () => {
  const navigate = useNavigate();
  const { currentUser } = useAuth();
  const { theme } = useTheme();
  const [duels, setDuels] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedDeck, setSelectedDeck] = useState(null);
  const [userDecks, setUserDecks] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [showQR, setShowQR] = useState(false);
  const [roomCode, setRoomCode] = useState('');

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

    const fetchDecks = async () => {
      try {
        const fetchedDecks = await getUserDecks(currentUser.uid);
        setUserDecks(fetchedDecks);
      } catch (error) {
        console.error('Error fetching decks:', error);
      }
    };
    
    fetchDecks();

    return () => {
      unsubscribe();
    };
  }, [currentUser]);

  const createDuel = async () => {
    try {
      console.log('Creating new duel...'); // Debug log
      const duelData = {
        player1Id: currentUser.uid,
        player1Name: currentUser.displayName || 'Player 1',
        player1Deck: selectedDeck || { name: 'Not Specified' },
        status: 'waiting',
        createdAt: serverTimestamp(),
        roomCode: Math.random().toString(36).substring(2, 8).toUpperCase(),
        player1LifePoints: 8000,
        player2LifePoints: 8000,
        gameStarted: false,
        timeRemaining: 45 * 60, // 45 minutes in seconds
        currentDuel: 1,
        player1Score: 0,
        player2Score: 0,
        matchOver: false,
        matchWinner: null,
        matchPaused: false
      };
      console.log('Duel data:', duelData); // Debug log

      const duelRef = await addDoc(collection(db, 'duels'), duelData);
      console.log('Duel created with ID:', duelRef.id); // Debug log

      navigate(`/duel/${duelRef.id}`);
    } catch (error) {
      console.error('Error creating duel:', error);
      setError('Failed to create duel');
    }
  };

  const joinDuel = async (duelId) => {
    try {
      console.log('Joining duel:', duelId); // Debug log
      navigate(`/duel/${duelId}`);
    } catch (error) {
      console.error('Error joining duel:', error);
      setError('Failed to join duel');
    }
  };

  const joinByCode = async () => {
    if (!roomCode) {
      setError('Please enter a room code');
      return;
    }

    const duel = duels.find(d => d.roomCode === roomCode.toUpperCase());
    if (duel) {
      console.log('Found duel by code:', duel.id); // Debug log
      joinDuel(duel.id);
    } else {
      setError('Room not found');
    }
  };

  const filteredDuels = duels.filter(duel => 
    duel.player1Name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    duel.roomCode?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  if (loading) {
    return (
      <PageBackground backgroundImage={pageBackgrounds.duel}>
        <div className="page-content duel-content">
          <div className="loading-message">Loading duels...</div>
        </div>
      </PageBackground>
    );
  }

  return (
    <PageBackground backgroundImage={pageBackgrounds.duel}>
      <div className="page-content duel-content">
        <header className="page-header">
          <h1>Duel Lobby</h1>
          <p className="page-description">Join a duel or create your own</p>
        </header>

        <div className="duel-option">
          <label>Select Deck:</label>
          <select
            value={selectedDeck?.id || 'not-specified'}
            onChange={(e) => {
              if (e.target.value === 'not-specified') {
                setSelectedDeck(null);
              } else {
                const deck = userDecks.find(d => d.id === e.target.value);
                setSelectedDeck(deck);
              }
            }}
            className="pixel-select"
          >
            <option value="not-specified">Not Specified</option>
            {userDecks.map(deck => (
              <option key={deck.id} value={deck.id}>
                {deck.name}
              </option>
            ))}
          </select>
        </div>

        {error && (
          <div className="error-message">
            {error}
          </div>
        )}

        <div className="duel-options">
          <div className="duel-option">
            <h2>Create Duel</h2>
            <p>Start a new duel and wait for opponents</p>
            <button className="pixel-button" onClick={createDuel}>
              Create New Duel
            </button>
          </div>

          <div className="duel-option">
            <h2>Join Duel</h2>
            <div className="join-options">
              <input
                type="text"
                placeholder="Search by name or room code"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pixel-input"
              />
              <div className="room-code-input">
                <input
                  type="text"
                  placeholder="Enter room code"
                  value={roomCode}
                  onChange={(e) => setRoomCode(e.target.value.toUpperCase())}
                  className="pixel-input"
                />
                <button className="pixel-button" onClick={joinByCode}>
                  Join by Code
                </button>
              </div>
              <button className="pixel-button" onClick={() => setShowQR(!showQR)}>
                {showQR ? 'Hide QR Scanner' : 'Show QR Scanner'}
              </button>
              {showQR && (
                <div className="qr-scanner">
                  {/* QR Scanner component will go here */}
                  <p>QR Scanner placeholder</p>
                </div>
              )}
            </div>
          </div>

          <div className="duel-option">
            <h2>Available Duels</h2>
            {filteredDuels.length === 0 ? (
              <p>No duels available</p>
            ) : (
              <div className="duel-list">
                {filteredDuels.map(duel => (
                  <div key={duel.id} className="duel-item">
                    <div className="duel-info">
                      <span>Host: {duel.player1Name}</span>
                      <span>Deck: {duel.player1Deck?.name || 'Not Specified'}</span>
                      <span>Room Code: {duel.roomCode}</span>
                    </div>
                    <button
                      className="pixel-button"
                      onClick={() => joinDuel(duel.id)}
                    >
                      Join Duel
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </PageBackground>
  );
};

export default DuelLobby; 