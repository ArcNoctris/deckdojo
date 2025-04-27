import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { useTheme } from '../../contexts/ThemeContext';
import { useToast } from '../../contexts/ToastContext';
import { getDeckById, createDeck, updateDeck } from '../../services/deckService';
import './DeckBuilder.css';
import DeckCardDisplay from './DeckCardDisplay';
import CardSearch from './CardSearch';

// Define deck size limits
const DECK_LIMITS = {
  main: 60,
  extra: 15,
  side: 15,
  cardCopies: 3
};

const SORT_OPTIONS = [
  { label: 'Name (A-Z)', value: 'name-asc' },
  { label: 'Name (Z-A)', value: 'name-desc' },
  { label: 'Level/Rank (High-Low)', value: 'level-desc' },
  { label: 'Level/Rank (Low-High)', value: 'level-asc' },
  { label: 'ATK (High-Low)', value: 'atk-desc' },
  { label: 'ATK (Low-High)', value: 'atk-asc' },
  { label: 'Type', value: 'type' }
];

const DeckBuilder = () => {
  const { deckId } = useParams();
  const navigate = useNavigate();
  const { theme } = useTheme();
  const { currentUser } = useAuth();
  const { showToast } = useToast();
  const lastAddedCardRef = useRef(null);
  
  console.log('DeckBuilder mounted with deckId:', deckId);
  
  const [deck, setDeck] = useState({
    name: '',
    description: '',
    main: [],
    extra: [],
    side: [],
    mainColor: theme?.colors?.accent || '#000000',
    uid: currentUser?.uid || '',
    visibility: 'private',
    tags: [],
    createdAt: null,
    updatedAt: null
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);
  const [sortOption, setSortOption] = useState('name-asc');
  
  // Fix for isNewDeck check
  const isNewDeck = deckId === 'new' || !deckId;
  
  console.log('isNewDeck value:', isNewDeck);

  // More debugging
  useEffect(() => {
    console.log('DeckBuilder effect running with:');
    console.log('- deckId:', deckId);
    console.log('- isNewDeck:', isNewDeck);
  }, [deckId, isNewDeck]);

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

  // Helper to count occurrences of a card in a deck section
  const countCardCopies = (cardId, section) => {
    if (!Array.isArray(deck[section])) return 0;
    return deck[section].filter(card => card.id === cardId).length;
  };

  // Count total copies of a card across all sections
  const countTotalCardCopies = (cardId) => {
    return countCardCopies(cardId, 'main') + 
           countCardCopies(cardId, 'extra') + 
           countCardCopies(cardId, 'side');
  };

  const handleCardSelect = (card, section) => {
    if (!card || !section) return;
    
    // Special case for reordering (from drag and drop)
    if (card.type === 'reorder') {
      // Handle cross-section drag and drop reordering
      if (card.from && card.to && card.from !== card.to) {
        // The DeckCardDisplay component has already updated its local state
        // We just need to sync that with our deck state
        setDeck(prev => ({
          ...prev,
          updatedAt: new Date()
        }));
      }
      return;
    }
    
    // Store the card reference for potential animation
    lastAddedCardRef.current = card;
    
    // Determine the initial section based on card type
    const initialSection = section;
    let targetSection = section;
    
    // Check if we've reached the maximum number of copies for this card
    const totalCopies = countTotalCardCopies(card.id);
    if (totalCopies >= DECK_LIMITS.cardCopies) {
      showToast(`Maximum ${DECK_LIMITS.cardCopies} copies of "${card.name}" allowed`, 'warning');
      document.querySelector('.card-search-section').classList.add('shake');
      setTimeout(() => {
        document.querySelector('.card-search-section').classList.remove('shake');
      }, 500);
      return;
    }
    
    // Check if initial section is full
    if (Array.isArray(deck[initialSection]) && deck[initialSection].length >= DECK_LIMITS[initialSection]) {
      // If main/extra is full, try putting in side deck
      if (initialSection !== 'side' && Array.isArray(deck.side) && deck.side.length < DECK_LIMITS.side) {
        targetSection = 'side';
        showToast(`${initialSection.charAt(0).toUpperCase() + initialSection.slice(1)} deck is full, adding to side deck`, 'info');
      } else {
        // All decks are full
        showToast(`${initialSection.charAt(0).toUpperCase() + initialSection.slice(1)} deck is limited to ${DECK_LIMITS[initialSection]} cards`, 'warning');
        document.querySelector('.card-search-section').classList.add('shake');
        setTimeout(() => {
          document.querySelector('.card-search-section').classList.remove('shake');
        }, 500);
        return;
      }
    }
    
    setDeck(prev => {
      const newSection = Array.isArray(prev[targetSection]) ? [...prev[targetSection]] : [];
      newSection.push(card);
      return {
        ...prev,
        [targetSection]: newSection,
        updatedAt: new Date()
      };
    });
    
    // Show success toast
    const copiesAfterAdd = countTotalCardCopies(card.id) + 1;
    if (copiesAfterAdd === DECK_LIMITS.cardCopies) {
      showToast(`Added maximum ${DECK_LIMITS.cardCopies} copies of "${card.name}"`, 'info');
    }
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

  // Sort the cards based on selected option
  const sortCards = (section) => {
    if (!Array.isArray(deck[section]) || deck[section].length === 0) return;
    
    setDeck(prev => {
      const sortedCards = [...prev[section]];
      
      // Apply sorting based on the selected option
      switch (sortOption) {
        case 'name-asc':
          sortedCards.sort((a, b) => a.name?.localeCompare(b.name));
          break;
        case 'name-desc':
          sortedCards.sort((a, b) => b.name?.localeCompare(a.name));
          break;
        case 'level-desc':
          sortedCards.sort((a, b) => (b.level || b.rank || 0) - (a.level || a.rank || 0));
          break;
        case 'level-asc':
          sortedCards.sort((a, b) => (a.level || a.rank || 0) - (b.level || b.rank || 0));
          break;
        case 'atk-desc':
          sortedCards.sort((a, b) => (b.atk || 0) - (a.atk || 0));
          break;
        case 'atk-asc':
          sortedCards.sort((a, b) => (a.atk || 0) - (b.atk || 0));
          break;
        case 'type':
          sortedCards.sort((a, b) => a.type?.localeCompare(b.type));
          break;
        default:
          break;
      }
      
      return {
        ...prev,
        [section]: sortedCards,
        updatedAt: new Date()
      };
    });
    
    showToast(`Sorted ${section} deck by ${getSortLabel(sortOption)}`, 'success');
  };
  
  // Get readable label for sort option
  const getSortLabel = (value) => {
    const option = SORT_OPTIONS.find(opt => opt.value === value);
    return option ? option.label : '';
  };

  const saveDeck = async () => {
    console.log('Saving deck, isNewDeck:', isNewDeck);
    console.log('Current deckId:', deckId);
    
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
        user: {
          uid: currentUser.uid,
          username: currentUser.displayName || 'Anonymous',
          photoURL: currentUser.photoURL || ''
        },
        description: deck.description || '',
        visibility: deck.visibility || 'private',
        mainColor: deck.mainColor || theme?.colors?.accent || '#000000',
        tags: deck.tags || [],
        updatedAt: new Date()
      };

      // Force create if it's a new deck, has a default name, or doesn't have an ID
      const shouldCreateNew = isNewDeck || 
                             !deckId || 
                             deckId === 'undefined' || 
                             deckId === 'null' ||
                             deck.name === 'New Deck';
      
      console.log('Should create new deck?', shouldCreateNew);

      if (shouldCreateNew) {
        console.log('Creating new deck');
        deckData.createdAt = new Date();
        const newDeckId = await createDeck(deckData);
        showToast('Deck created successfully!', 'success');
        navigate(`/decks/${newDeckId}`);
      } else {
        // Only update if we're certain we have a valid existing deck ID
        if (!deckId) {
          setError('Invalid deck ID');
          return;
        }
        console.log('Updating deck with ID:', deckId);
        await updateDeck(deckId.toString(), deckData);
        showToast('Deck updated successfully!', 'success');
        setError(null);
      }
    } catch (error) {
      console.error('Error saving deck:', error);
      setError('Failed to save deck. Please try again.');
      showToast('Failed to save deck', 'error');
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
              <label htmlFor="description" style={{ color: theme.colors.text }}>Description</label>
              <input
                type="text"
                id="description"
                name="description"
                value={deck.description || ''}
                onChange={handleInputChange}
                placeholder="Enter deck description"
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
            
            <div className="form-group">
              <label htmlFor="sortOption" style={{ color: theme.colors.text }}>Sort Cards</label>
              <div className="sort-controls">
                <select
                  id="sortOption"
                  value={sortOption}
                  onChange={(e) => setSortOption(e.target.value)}
                  className="sort-dropdown"
                  style={{ 
                    backgroundColor: theme.colors.cardBackground,
                    color: theme.colors.text,
                    borderColor: theme.colors.border,
                    padding: '5px',
                    borderRadius: '4px'
                  }}
                >
                  {SORT_OPTIONS.map(option => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
                <div className="sort-buttons">
                  <button 
                    onClick={() => sortCards('main')}
                    style={{ 
                      backgroundColor: theme.colors.primary,
                      color: theme.colors.white,
                      border: 'none',
                      padding: '5px 10px',
                      borderRadius: '4px',
                      cursor: 'pointer'
                    }}
                  >
                    Main
                  </button>
                  <button 
                    onClick={() => sortCards('extra')}
                    style={{ 
                      backgroundColor: theme.colors.primary,
                      color: theme.colors.white,
                      border: 'none',
                      padding: '5px 10px',
                      borderRadius: '4px',
                      cursor: 'pointer'
                    }}
                  >
                    Extra
                  </button>
                  <button 
                    onClick={() => sortCards('side')}
                    style={{ 
                      backgroundColor: theme.colors.primary,
                      color: theme.colors.white,
                      border: 'none',
                      padding: '5px 10px',
                      borderRadius: '4px',
                      cursor: 'pointer'
                    }}
                  >
                    Side
                  </button>
                </div>
              </div>
            </div>
          </div>

          <div className="deck-stats">
            <div className="stat-item">
              <span style={{ color: theme.colors.textSecondary }}>Main Deck</span>
              <span style={{ color: theme.colors.text }}>
                {Array.isArray(deck.main) ? deck.main.length : 0}/{DECK_LIMITS.main}
              </span>
            </div>
            <div className="stat-item">
              <span style={{ color: theme.colors.textSecondary }}>Extra Deck</span>
              <span style={{ color: theme.colors.text }}>
                {Array.isArray(deck.extra) ? deck.extra.length : 0}/{DECK_LIMITS.extra}
              </span>
            </div>
            <div className="stat-item">
              <span style={{ color: theme.colors.textSecondary }}>Side Deck</span>
              <span style={{ color: theme.colors.text }}>
                {Array.isArray(deck.side) ? deck.side.length : 0}/{DECK_LIMITS.side}
              </span>
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
