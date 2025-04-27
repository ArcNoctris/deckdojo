import React, { useState, useEffect } from 'react';
import { useTheme } from '../../contexts/ThemeContext';
import { useToast } from '../../contexts/ToastContext';
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

const MONSTER_RACES = [
  'Aqua',
  'Beast',
  'Beast-Warrior',
  'Cyberse',
  'Dinosaur',
  'Divine-Beast',
  'Dragon',
  'Fairy',
  'Fiend',
  'Fish',
  'Insect',
  'Machine',
  'Plant',
  'Psychic',
  'Pyro',
  'Reptile',
  'Rock',
  'Sea Serpent',
  'Spellcaster',
  'Thunder',
  'Warrior',
  'Winged Beast',
  'Wyrm',
  'Zombie'
];

const CardSearch = ({ onCardSelect }) => {
  const { theme } = useTheme();
  const { showToast } = useToast();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedType, setSelectedType] = useState('');
  const [selectedRace, setSelectedRace] = useState('');
  const [selectedAttribute, setSelectedAttribute] = useState('');
  const [level, setLevel] = useState('');
  const [archetype, setArchetype] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(20);
  const [searchResults, setSearchResults] = useState({
    cards: [],
    total: 0,
    page: 1,
    pageSize: 20,
    totalPages: 0
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Reset to page 1 when search criteria change
  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, selectedType, selectedRace, selectedAttribute, level, archetype]);

  const fetchCards = async (page = currentPage) => {
    try {
      setLoading(true);
      setError(null);

      // Build filters object for the search
      const filters = {};
      
      if (selectedType) {
        filters.type = selectedType;
      }
      
      if (selectedRace) {
        filters.race = selectedRace;
      }
      
      if (selectedAttribute && selectedType.includes('Monster')) {
        filters.attribute = selectedAttribute;
      }
      
      if (level && selectedType.includes('Monster')) {
        filters.level = level;
      }
      
      if (archetype) {
        filters.archetype = archetype;
      }

      console.log("Searching cards with term:", searchTerm, "and filters:", filters, "page:", page);
      
      // Use the mongodbService to search for cards with pagination
      const result = await searchCards(searchTerm, filters, page, pageSize);
      console.log("Search results:", result);
      
      if (result.error) {
        setError(`Search failed: ${result.error}`);
        showToast(`Search failed: ${result.error}`, 'error');
        setSearchResults({
          cards: [],
          total: 0,
          page: 1,
          pageSize: pageSize,
          totalPages: 0
        });
      } else {
        setSearchResults(result);
        
        if (result.cards.length === 0) {
          showToast('No cards found matching your criteria', 'info');
        } else {
          showToast(`Found ${result.total} cards`, 'success');
        }
      }
    } catch (error) {
      console.error('Error searching cards:', error);
      setError('Failed to search cards. Please try again.');
      showToast('Failed to search cards', 'error');
      setSearchResults({
        cards: [],
        total: 0,
        page: 1,
        pageSize: pageSize,
        totalPages: 0
      });
    } finally {
      setLoading(false);
    }
  };

  const handlePageChange = (newPage) => {
    if (newPage < 1 || newPage > searchResults.totalPages) return;
    setCurrentPage(newPage);
    fetchCards(newPage);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    setCurrentPage(1); // Reset to first page on new search
    fetchCards(1);
  };

  const handleCardSelectWrapper = (card) => {
    // Debug the card being selected
    console.log("Card selected:", card);
    
    // Check if the card is valid
    if (!card || typeof card !== 'object' || Object.keys(card).length === 0) {
      console.error("Attempted to select an invalid card:", card);
      return;
    }
    
    // Check for required properties and silently add if missing
    if (!card.id) {
      card.id = `temp-${Date.now()}-${Math.random().toString(36).substring(2)}`;
    }
    
    if (!card.name) {
      card.name = "Unknown Card";
    }
    
    if (!card.type) {
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

  const renderPagination = () => {
    if (searchResults.totalPages <= 1) return null;
    
    const pageNumbers = [];
    const maxPagesToShow = 5;
    
    let startPage = Math.max(1, currentPage - Math.floor(maxPagesToShow / 2));
    let endPage = Math.min(searchResults.totalPages, startPage + maxPagesToShow - 1);
    
    if (endPage - startPage + 1 < maxPagesToShow) {
      startPage = Math.max(1, endPage - maxPagesToShow + 1);
    }
    
    for (let i = startPage; i <= endPage; i++) {
      pageNumbers.push(i);
    }
    
    return (
      <div className="pagination">
        <button 
          onClick={() => handlePageChange(1)}
          disabled={currentPage === 1}
          className="pagination-button"
          style={{
            backgroundColor: theme.colors.surface,
            color: currentPage === 1 ? theme.colors.textSecondary : theme.colors.text,
            borderColor: theme.colors.border
          }}
        >
          &laquo;
        </button>
        <button 
          onClick={() => handlePageChange(currentPage - 1)}
          disabled={currentPage === 1}
          className="pagination-button"
          style={{
            backgroundColor: theme.colors.surface,
            color: currentPage === 1 ? theme.colors.textSecondary : theme.colors.text,
            borderColor: theme.colors.border
          }}
        >
          &lt;
        </button>
        
        {pageNumbers.map(number => (
          <button
            key={number}
            onClick={() => handlePageChange(number)}
            className={`pagination-button ${currentPage === number ? 'active' : ''}`}
            style={{
              backgroundColor: currentPage === number ? theme.colors.primary : theme.colors.surface,
              color: currentPage === number ? theme.colors.white : theme.colors.text,
              borderColor: theme.colors.border
            }}
          >
            {number}
          </button>
        ))}
        
        <button 
          onClick={() => handlePageChange(currentPage + 1)}
          disabled={currentPage === searchResults.totalPages}
          className="pagination-button"
          style={{
            backgroundColor: theme.colors.surface,
            color: currentPage === searchResults.totalPages ? theme.colors.textSecondary : theme.colors.text,
            borderColor: theme.colors.border
          }}
        >
          &gt;
        </button>
        <button 
          onClick={() => handlePageChange(searchResults.totalPages)}
          disabled={currentPage === searchResults.totalPages}
          className="pagination-button"
          style={{
            backgroundColor: theme.colors.surface,
            color: currentPage === searchResults.totalPages ? theme.colors.textSecondary : theme.colors.text,
            borderColor: theme.colors.border
          }}
        >
          &raquo;
        </button>
      </div>
    );
  };

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
          
          <div className="form-group">
            <label style={{ color: theme.colors.text }}>Archetype</label>
            <input
              type="text"
              value={archetype}
              onChange={(e) => setArchetype(e.target.value)}
              placeholder="Card archetype..."
              style={{
                backgroundColor: theme.colors.cardBackground,
                color: theme.colors.text,
                borderColor: theme.colors.border
              }}
            />
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
                <label style={{ color: theme.colors.text }}>Monster Type</label>
                <select
                  value={selectedRace}
                  onChange={(e) => setSelectedRace(e.target.value)}
                  style={{
                    backgroundColor: theme.colors.cardBackground,
                    color: theme.colors.text,
                    borderColor: theme.colors.border
                  }}
                >
                  <option value="">All Monster Types</option>
                  {MONSTER_RACES.map(race => (
                    <option key={race} value={race}>{race}</option>
                  ))}
                </select>
              </div>

              <div className="form-group">
                <label style={{ color: theme.colors.text }}>Level/Rank</label>
                <select
                  value={level}
                  onChange={(e) => setLevel(e.target.value)}
                  style={{
                    backgroundColor: theme.colors.cardBackground,
                    color: theme.colors.text,
                    borderColor: theme.colors.border
                  }}
                >
                  <option value="">Any Level</option>
                  {Array.from({ length: 12 }, (_, i) => i + 1).map(lvl => (
                    <option key={lvl} value={lvl}>{lvl}</option>
                  ))}
                </select>
              </div>
            </>
          )}
        </div>

        <button 
          type="submit"
          className="search-button"
          style={{
            backgroundColor: theme.colors.primary,
            color: theme.colors.white
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
        {searchResults.cards.length === 0 ? (
          <div className="no-results" style={{ color: theme.colors.textSecondary }}>
            {loading ? 'Searching for cards...' : 'No cards found. Try adjusting your search.'}
          </div>
        ) : (
          <>
            <div className="search-stats">
              <p style={{ color: theme.colors.textSecondary }}>
                Showing {(currentPage - 1) * pageSize + 1}-
                {Math.min(currentPage * pageSize, searchResults.total)} of {searchResults.total} cards
              </p>
            </div>
            
            <div className="card-grid">
              {searchResults.cards.map((card, index) => (
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
                        src={card.card_images && card.card_images[0]?.image_url ? card.card_images[0].image_url : card.image_url} 
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
            
            {renderPagination()}
          </>
        )}
      </div>
    </div>
  );
};

export default CardSearch; 