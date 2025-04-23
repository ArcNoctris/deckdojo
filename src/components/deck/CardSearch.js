import React, { useState } from 'react';
import { useTheme } from '../../contexts/ThemeContext';
import { searchCards } from '../../services/mongodbService';
import './CardSearch.css';

const CARD_TYPES = [
  'Normal Monster',
  'Effect Monster',
  'Fusion Monster',
  'Ritual Monster',
  'Synchro Monster',
  'XYZ Monster',
  'Link Monster',
  'Pendulum Monster',
  'Spell Card',
  'Trap Card'
];

const MONSTER_ATTRIBUTES = [
  'DARK',
  'DIVINE',
  'EARTH',
  'FIRE',
  'LIGHT',
  'WATER',
  'WIND'
];

const CardSearch = ({ onCardSelect }) => {
  const { theme } = useTheme();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedType, setSelectedType] = useState('');
  const [selectedAttribute, setSelectedAttribute] = useState('');
  const [minLevel, setMinLevel] = useState('');
  const [maxLevel, setMaxLevel] = useState('');
  const [minATK, setMinATK] = useState('');
  const [maxATK, setMaxATK] = useState('');
  const [minDEF, setMinDEF] = useState('');
  const [maxDEF, setMaxDEF] = useState('');
  const [cards, setCards] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const fetchCards = async () => {
    try {
      setLoading(true);
      setError(null);

      // Build filters object for the search
      const filters = {};
      
      if (selectedType) {
        filters.type = selectedType;
      }
      
      if (selectedAttribute && selectedType.includes('Monster')) {
        filters.attribute = selectedAttribute;
      }
      
      if (minLevel && selectedType.includes('Monster')) {
        filters.minLevel = minLevel;
      }
      
      if (maxLevel && selectedType.includes('Monster')) {
        filters.maxLevel = maxLevel;
      }
      
      if (minATK && selectedType.includes('Monster')) {
        filters.minATK = minATK;
      }
      
      if (maxATK && selectedType.includes('Monster')) {
        filters.maxATK = maxATK;
      }
      
      if (minDEF && selectedType.includes('Monster')) {
        filters.minDEF = minDEF;
      }
      
      if (maxDEF && selectedType.includes('Monster')) {
        filters.maxDEF = maxDEF;
      }

      console.log("Searching cards with term:", searchTerm, "and filters:", filters);
      
      // Use the mongodbService to search for cards
      const result = await searchCards(searchTerm, filters);
      console.log("Raw search results:", result);
      
      // Ensure result is an array before setting state
      const validCards = Array.isArray(result) 
        ? result.filter(card => card && typeof card === 'object' && Object.keys(card).length > 0)
        : [];
      
      console.log("Filtered valid cards:", validCards);
      setCards(validCards);
    } catch (error) {
      console.error('Error searching cards:', error);
      setError('Failed to search cards. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    fetchCards();
  };

  const handleCardSelectWrapper = (card) => {
    // Debug the card being selected
    console.log("Card selected:", card);
    
    // Check if the card is valid
    if (!card || typeof card !== 'object' || Object.keys(card).length === 0) {
      console.error("Attempted to select an invalid card:", card);
      return;
    }
    
    // Check for required properties
    if (!card.id) {
      console.error("Card is missing id:", card);
      card.id = `temp-${Date.now()}-${Math.random().toString(36).substring(2)}`;
    }
    
    if (!card.name) {
      console.error("Card is missing name:", card);
      card.name = "Unknown Card";
    }
    
    if (!card.type) {
      console.error("Card is missing type:", card);
      card.type = "Unknown Type";
    }
    
    // Call the original onCardSelect
    onCardSelect(card, determineCardSection(card));
  };

  // Determine which section (main, extra, side) a card belongs to
  const determineCardSection = (card) => {
    if (!card || !card.type) return 'main';
    
    const extraDeckTypes = [
      'Fusion Monster', 
      'Synchro Monster', 
      'XYZ Monster', 
      'Link Monster'
    ];
    
    return extraDeckTypes.some(type => card.type.includes(type)) ? 'extra' : 'main';
  };

  const isMonsterType = selectedType.includes('Monster');

  return (
    <div 
      className="card-search-container"
      style={{ backgroundColor: theme.colors.surface }}
    >
      <form onSubmit={handleSubmit} className="search-form">
        <div className="search-fields">
          <div className="form-group">
            <label style={{ color: theme.colors.text }}>Card Name</label>
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search by name..."
              style={{
                backgroundColor: theme.colors.cardBackground,
                color: theme.colors.text,
                borderColor: theme.colors.border
              }}
            />
          </div>

          <div className="form-group">
            <label style={{ color: theme.colors.text }}>Card Type</label>
            <select
              value={selectedType}
              onChange={(e) => setSelectedType(e.target.value)}
              style={{
                backgroundColor: theme.colors.cardBackground,
                color: theme.colors.text,
                borderColor: theme.colors.border
              }}
            >
              <option value="">All Types</option>
              {CARD_TYPES.map(type => (
                <option key={type} value={type}>{type}</option>
              ))}
            </select>
          </div>

          {isMonsterType && (
            <>
              <div className="form-group">
                <label style={{ color: theme.colors.text }}>Attribute</label>
                <select
                  value={selectedAttribute}
                  onChange={(e) => setSelectedAttribute(e.target.value)}
                  style={{
                    backgroundColor: theme.colors.cardBackground,
                    color: theme.colors.text,
                    borderColor: theme.colors.border
                  }}
                >
                  <option value="">All Attributes</option>
                  {MONSTER_ATTRIBUTES.map(attr => (
                    <option key={attr} value={attr}>{attr}</option>
                  ))}
                </select>
              </div>

              <div className="form-group">
                <label style={{ color: theme.colors.text }}>Level Range</label>
                <div className="range-inputs">
                  <input
                    type="number"
                    value={minLevel}
                    onChange={(e) => setMinLevel(e.target.value)}
                    placeholder="Min"
                    min="1"
                    max="12"
                    style={{
                      backgroundColor: theme.colors.cardBackground,
                      color: theme.colors.text,
                      borderColor: theme.colors.border
                    }}
                  />
                  <span style={{ color: theme.colors.text }}>to</span>
                  <input
                    type="number"
                    value={maxLevel}
                    onChange={(e) => setMaxLevel(e.target.value)}
                    placeholder="Max"
                    min="1"
                    max="12"
                    style={{
                      backgroundColor: theme.colors.cardBackground,
                      color: theme.colors.text,
                      borderColor: theme.colors.border
                    }}
                  />
                </div>
              </div>

              <div className="form-group">
                <label style={{ color: theme.colors.text }}>ATK Range</label>
                <div className="range-inputs">
                  <input
                    type="number"
                    value={minATK}
                    onChange={(e) => setMinATK(e.target.value)}
                    placeholder="Min"
                    min="0"
                    style={{
                      backgroundColor: theme.colors.cardBackground,
                      color: theme.colors.text,
                      borderColor: theme.colors.border
                    }}
                  />
                  <span style={{ color: theme.colors.text }}>to</span>
                  <input
                    type="number"
                    value={maxATK}
                    onChange={(e) => setMaxATK(e.target.value)}
                    placeholder="Max"
                    min="0"
                    style={{
                      backgroundColor: theme.colors.cardBackground,
                      color: theme.colors.text,
                      borderColor: theme.colors.border
                    }}
                  />
                </div>
              </div>

              <div className="form-group">
                <label style={{ color: theme.colors.text }}>DEF Range</label>
                <div className="range-inputs">
                  <input
                    type="number"
                    value={minDEF}
                    onChange={(e) => setMinDEF(e.target.value)}
                    placeholder="Min"
                    min="0"
                    style={{
                      backgroundColor: theme.colors.cardBackground,
                      color: theme.colors.text,
                      borderColor: theme.colors.border
                    }}
                  />
                  <span style={{ color: theme.colors.text }}>to</span>
                  <input
                    type="number"
                    value={maxDEF}
                    onChange={(e) => setMaxDEF(e.target.value)}
                    placeholder="Max"
                    min="0"
                    style={{
                      backgroundColor: theme.colors.cardBackground,
                      color: theme.colors.text,
                      borderColor: theme.colors.border
                    }}
                  />
                </div>
              </div>
            </>
          )}
        </div>

        <button 
          type="submit"
          className="search-button"
          style={{
            backgroundColor: theme.colors.primary,
            color: theme.colors.text
          }}
          disabled={loading}
        >
          {loading ? 'Searching...' : 'Search Cards'}
        </button>
      </form>

      {error && (
        <div className="error-message" style={{ color: theme.colors.error }}>
          {error}
        </div>
      )}

      <div className="search-results">
        {cards.length === 0 ? (
          <div className="no-results" style={{ color: theme.colors.textSecondary }}>
            {loading ? 'Searching for cards...' : 'No cards found. Try adjusting your search.'}
          </div>
        ) : (
          <div className="card-grid">
            {cards.map((card, index) => (
              <div 
                key={card.id || `search-card-${index}`}
                className="card-item"
                onClick={() => handleCardSelectWrapper(card)}
                style={{
                  backgroundColor: theme.colors.cardBackground,
                  borderColor: theme.colors.border
                }}
              >
                {(card.card_images && card.card_images[0]?.image_url) || card.image_url ? (
                  <div className="card-image-container">
                    <img 
                      src={card.card_images ? card.card_images[0]?.image_url : (card.image_url || '')} 
                      alt={card.name || 'Card'} 
                      className="card-image"
                      loading="lazy"
                    />
                    <div className="card-details-overlay">
                      <div className="card-name" style={{ color: theme.colors.white }}>
                        {card.name || 'Unknown Card'}
                      </div>
                    </div>
                  </div>
                ) : (
                  <div 
                    className="card-placeholder"
                    style={{ backgroundColor: theme.colors.accent }}
                  >
                    {card.name ? card.name.substring(0, 1) : '?'}
                    <div className="card-details-overlay">
                      <div className="card-name" style={{ color: theme.colors.white }}>
                        {card.name || 'Unknown Card'}
                      </div>
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default CardSearch; 