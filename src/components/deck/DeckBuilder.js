import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { useTheme } from '../../contexts/ThemeContext';
import { db } from '../../firebase/firebase';
import { doc, getDoc, updateDoc, collection, addDoc } from 'firebase/firestore';
import './DeckBuilder.css';
import DeckCardDisplay from './DeckCardDisplay';
import CardSearch from './CardSearch';

const DeckBuilder = () => {
  const { deckId } = useParams();
  const navigate = useNavigate();
  const { theme } = useTheme();
  const { currentUser } = useAuth();
  const [deck, setDeck] = useState({
    name: '',
    main: [],
    extra: [],
    side: [],
    mainColor: theme?.colors?.accent || '#000000',
    uid: currentUser?.uid || '',
    createdAt: null,
    updatedAt: null
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);
  const isNewDeck = deckId === 'new';

  useEffect(() => {
    const fetchDeck = async () => {
      if (!currentUser) {
        setError('You must be logged in to access decks');
        setLoading(false);
        return;
      }

      if (isNewDeck) {
        setDeck(prev => ({
          ...prev,
          name: 'New Deck',
          mainColor: theme?.colors?.accent || '#000000',
          uid: currentUser.uid
        }));
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        setError(null);
        
        if (!deckId) {
          setError('Invalid deck ID');
          setLoading(false);
          return;
        }

        const deckRef = doc(db, 'deck', deckId);
        const deckSnap = await getDoc(deckRef);
        
        if (deckSnap.exists()) {
          const deckData = deckSnap.data();
          
          if (deckData.uid === currentUser.uid) {
            setDeck({
              ...deckData,
              mainColor: deckData.mainColor || theme?.colors?.accent || '#000000',
              main: deckData.main || [],
              extra: deckData.extra || [],
              side: deckData.side || []
            });
          } else {
            setError('You do not have permission to edit this deck');
            navigate('/decks');
          }
        } else {
          setError('Deck not found');
          navigate('/decks');
        }
      } catch (error) {
        console.error('Error fetching deck:', error);
        setError('Failed to load deck. Please try again.');
      } finally {
        setLoading(false);
      }
    };

    fetchDeck();
  }, [deckId, currentUser, isNewDeck, navigate, theme?.colors?.accent]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setDeck(prev => ({
      ...prev,
      [name]: value,
      updatedAt: new Date()
    }));
  };

  const handleColorChange = (e) => {
    const { value } = e.target;
    setDeck(prev => ({
      ...prev,
      mainColor: value,
      updatedAt: new Date()
    }));
  };

  const handleCardSelect = (card) => {
    // Determine which deck section to add the card to based on its type
    let targetDeck = 'main';
    if (card.type.includes('Fusion') || 
        card.type.includes('Synchro') || 
        card.type.includes('XYZ') || 
        card.type.includes('Link')) {
      targetDeck = 'extra';
    }

    // Count how many copies of this card are already in the deck
    const cardCount = deck[targetDeck].filter(c => c.id === card.id).length;
    
    if (cardCount >= 3) {
      setError('You can only have up to 3 copies of a card in your deck');
      return;
    }

    // Add the card to the appropriate deck
    setDeck(prev => ({
      ...prev,
      [targetDeck]: [...prev[targetDeck], card]
    }));
  };

  const saveDeck = async () => {
    if (!currentUser) {
      setError('You must be logged in to save decks');
      return;
    }

    if (!deck.name.trim()) {
      setError('Please enter a deck name');
      return;
    }

    try {
      setSaving(true);
      setError(null);

      const deckData = {
        name: deck.name.trim(),
        main: Array.isArray(deck.main) ? deck.main : [],
        extra: Array.isArray(deck.extra) ? deck.extra : [],
        side: Array.isArray(deck.side) ? deck.side : [],
        uid: currentUser.uid,
        mainColor: deck.mainColor || theme?.colors?.accent || '#000000',
        updatedAt: new Date()
      };

      if (isNewDeck) {
        deckData.createdAt = new Date();
        const deckRef = await addDoc(collection(db, 'deck'), deckData);
        navigate(`/decks/${deckRef.id}`);
      } else {
        const deckRef = doc(db, 'deck', deckId);
        await updateDoc(deckRef, deckData);
        setError(null);
      }
    } catch (error) {
      console.error('Error saving deck:', error);
      setError('Failed to save deck. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div 
        className="deck-builder-loading"
        style={{ backgroundColor: theme.colors.background, color: theme.colors.text }}
      >
        Loading deck...
      </div>
    );
  }

  return (
    <div 
      className="deck-builder-container"
      style={{ backgroundColor: theme.colors.background }}
    >
      <div className="deck-builder-header">
        <div className="deck-settings">
          <div className="deck-name-color">
            <div className="form-group">
              <label htmlFor="name" style={{ color: theme.colors.text }}>Deck Name</label>
              <input
                type="text"
                id="name"
                name="name"
                value={deck.name}
                onChange={handleInputChange}
                placeholder="Enter deck name"
                style={{ 
                  backgroundColor: theme.colors.cardBackground,
                  color: theme.colors.text,
                  borderColor: theme.colors.border
                }}
              />
            </div>
            
            <div className="form-group">
              <label htmlFor="mainColor" style={{ color: theme.colors.text }}>Deck Color</label>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <input
                  type="color"
                  id="mainColor"
                  name="mainColor"
                  value={deck.mainColor}
                  onChange={handleColorChange}
                  style={{ width: '50px', height: '30px' }}
                />
                <span style={{ color: theme.colors.text }}>{deck.mainColor}</span>
              </div>
            </div>
          </div>

          <div className="deck-stats">
            <div className="stat-item">
              <span style={{ color: theme.colors.textSecondary }}>Main Deck</span>
              <span style={{ color: theme.colors.text }}>{deck.main.length}</span>
            </div>
            <div className="stat-item">
              <span style={{ color: theme.colors.textSecondary }}>Extra Deck</span>
              <span style={{ color: theme.colors.text }}>{deck.extra.length}</span>
            </div>
            <div className="stat-item">
              <span style={{ color: theme.colors.textSecondary }}>Side Deck</span>
              <span style={{ color: theme.colors.text }}>{deck.side.length}</span>
            </div>
            <div className="stat-item">
              <span style={{ color: theme.colors.textSecondary }}>Total</span>
              <span style={{ color: theme.colors.text }}>
                {deck.main.length + deck.extra.length + deck.side.length}
              </span>
            </div>
          </div>

          <div className="deck-actions">
            <button 
              className="back-button"
              onClick={() => navigate('/decks')}
              style={{ 
                backgroundColor: theme.colors.surface,
                color: theme.colors.text,
                borderColor: theme.colors.border
              }}
            >
              Back to Decks
            </button>
            <button 
              className="save-button"
              onClick={saveDeck}
              disabled={saving}
              style={{ 
                backgroundColor: theme.colors.success,
                color: theme.colors.white
              }}
            >
              {saving ? 'Saving...' : 'Save Deck'}
            </button>
          </div>
        </div>
      </div>

      {error && (
        <div 
          className="error-message"
          style={{ 
            backgroundColor: theme.colors.error,
            color: theme.colors.white,
            padding: '10px',
            margin: '10px 0',
            borderRadius: '4px'
          }}
        >
          {error}
        </div>
      )}

      <div className="deck-builder-main">
        <div className="deck-builder-grid">
          <div className="card-search-section">
            <CardSearch onCardSelect={handleCardSelect} />
          </div>
          <div 
            className="card-display-panel"
            style={{ 
              backgroundColor: theme.colors.surface,
              borderColor: theme.colors.border
            }}
          >
            <DeckCardDisplay deck={deck} />
          </div>
        </div>
      </div>
    </div>
  );
};

export default DeckBuilder;
