import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { useTheme } from '../../contexts/ThemeContext';
import { getDeckById, createDeck, updateDeck } from '../../services/deckService';
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

        const deckData = await getDeckById(deckId);
        
        if (deckData) {
          if (deckData.uid === currentUser.uid) {
            setDeck({
              ...deckData,
              mainColor: deckData.mainColor || theme?.colors?.accent || '#000000',
              main: Array.isArray(deckData.main) ? deckData.main : [],
              extra: Array.isArray(deckData.extra) ? deckData.extra : [],
              side: Array.isArray(deckData.side) ? deckData.side : []
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

  const handleCardSelect = (card, section) => {
    if (!card || !section) return;
    
    setDeck(prev => {
      const newSection = Array.isArray(prev[section]) ? [...prev[section]] : [];
      newSection.push(card);
      return {
        ...prev,
        [section]: newSection,
        updatedAt: new Date()
      };
    });
  };

  const handleCardRemove = (card, section) => {
    if (!card || !section) return;
    
    setDeck(prev => {
      const newSection = Array.isArray(prev[section]) 
        ? prev[section].filter(c => c && c.id !== card.id)
        : [];
      return {
        ...prev,
        [section]: newSection,
        updatedAt: new Date()
      };
    });
  };

  const saveDeck = async () => {
    if (!currentUser) {
      setError('You must be logged in to save decks');
      return;
    }

    if (!deck.name || !deck.name.trim()) {
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
        const newDeckId = await createDeck(deckData);
        navigate(`/decks/${newDeckId}`);
      } else {
        await updateDeck(deckId, deckData);
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
                value={deck.name || ''}
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
              <div style={{ display: 'flex', alignItems: 'center', gap: '3px' }}>
                <input
                  type="color"
                  id="mainColor"
                  name="mainColor"

                  value={deck.mainColor || '#000000'}
                  onChange={handleColorChange}
                  style={{ width: '50px', height: '30px',accentColor: deck.mainColor, backgroundColor: deck.mainColor}}
                />
                
              </div>
            </div>
          </div>

          <div className="deck-stats">
            <div className="stat-item">
              <span style={{ color: theme.colors.textSecondary }}>Main Deck</span>
              <span style={{ color: theme.colors.text }}>{Array.isArray(deck.main) ? deck.main.length : 0}</span>
            </div>
            <div className="stat-item">
              <span style={{ color: theme.colors.textSecondary }}>Extra Deck</span>
              <span style={{ color: theme.colors.text }}>{Array.isArray(deck.extra) ? deck.extra.length : 0}</span>
            </div>
            <div className="stat-item">
              <span style={{ color: theme.colors.textSecondary }}>Side Deck</span>
              <span style={{ color: theme.colors.text }}>{Array.isArray(deck.side) ? deck.side.length : 0}</span>
            </div>
            <div className="stat-item">
              <span style={{ color: theme.colors.textSecondary }}>Total</span>
              <span style={{ color: theme.colors.text }}>
                {(Array.isArray(deck.main) ? deck.main.length : 0) +
                 (Array.isArray(deck.extra) ? deck.extra.length : 0) +
                 (Array.isArray(deck.side) ? deck.side.length : 0)}
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
            <DeckCardDisplay 
              deck={deck} 
              onCardSelect={handleCardSelect}
              onCardRemove={handleCardRemove}
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default DeckBuilder;
