import React, { useState, useEffect } from 'react';
import { useTheme } from '../../contexts/ThemeContext';
import './DeckCardDisplay.css';

const DeckCardDisplay = ({ deck, onCardSelect, onCardRemove }) => {
  const { theme } = useTheme();
  const [selectedCard, setSelectedCard] = useState(null);

  // Debug logging
  useEffect(() => {
    console.log("DeckCardDisplay received deck:", JSON.stringify(deck));
    
    // Log deck sections to identify potential issues
    if (deck) {
      console.log("Main deck:", deck.main);
      console.log("Extra deck:", deck.extra);
      console.log("Side deck:", deck.side);
      
      // Check for empty objects in deck arrays
      const findEmptyObjects = (array, name) => {
        if (!Array.isArray(array)) {
          console.error(`${name} is not an array:`, array);
          return;
        }
        
        array.forEach((item, index) => {
          if (item && typeof item === 'object' && Object.keys(item).length === 0) {
            console.error(`Empty object found in ${name} at index ${index}:`, item);
          }
        });
      };
      
      findEmptyObjects(deck.main, 'Main deck');
      findEmptyObjects(deck.extra, 'Extra deck');
      findEmptyObjects(deck.side, 'Side deck');
    }
  }, [deck]);

  const getCardImage = (card) => {
    if (!card) return null;
    return card.image_url || card.imageUrl || null;
  };

  const getMonsterStats = (card) => {
    if (!card || !card.type || !card.type.includes('Monster')) return '';

    const stats = [];
    if (card.level) stats.push(`Lv.${card.level}`);
    if (card.rank) stats.push(`Rank ${card.rank}`);
    if (card.linkval) stats.push(`Link-${card.linkval}`);
    if (card.attribute) stats.push(card.attribute);
    if (card.race) stats.push(card.race);

    return stats.join(' ');
  };

  const renderCardDetail = (card) => {
    if (!card) return null;

    return (
      <div className="card-detail" style={{ backgroundColor: theme.colors.surface }}>
        <div className="card-detail-header">
          <h3 style={{ color: theme.colors.text }}>{card.name || 'Unknown Card'}</h3>
          <span className="card-type" style={{ color: theme.colors.textSecondary }}>
            {card.type || 'Unknown Type'}
          </span>
        </div>
        <div className="card-detail-content">
          {getCardImage(card) && (
            <img
              src={getCardImage(card)}
              alt={card.name || 'Card'}
              className="card-detail-image"
            />
          )}
          <div className="card-detail-stats">
            {card.type && card.type.includes('Monster') && (
              <>
                <div className="monster-stats">
                  <span style={{ color: theme.colors.textSecondary }}>
                    {getMonsterStats(card)}
                  </span>
                  <span style={{ color: theme.colors.textSecondary }}>
                    {card.atk !== undefined && `ATK: ${card.atk}`}
                    {card.def !== undefined && ` / DEF: ${card.def}`}
                  </span>
                </div>
                {card.linkmarkers && Array.isArray(card.linkmarkers) && (
                  <div className="link-markers">
                    {card.linkmarkers.map((marker, index) => (
                      <span key={index} className="link-marker">
                        {marker}
                      </span>
                    ))}
                  </div>
                )}
              </>
            )}
            <p className="card-description" style={{ color: theme.colors.text }}>
              {card.desc || card.description || 'No description available.'}
            </p>
          </div>
        </div>
      </div>
    );
  };

  const renderCardSection = (title, cards, section) => {
    // Debug the cards array
    console.log(`Rendering ${title} section:`, cards);
    
    // Ensure cards is an array
    const cardArray = Array.isArray(cards) ? cards : [];
    
    // Check for problematic cards (empty objects)
    cardArray.forEach((card, index) => {
      if (card && typeof card === 'object' && Object.keys(card).length === 0) {
        console.error(`Empty card object in ${title} at index ${index}`);
      }
    });
    
    // Filter out empty objects that could cause rendering issues
    const filteredCards = cardArray.filter(card => 
      card && typeof card === 'object' && Object.keys(card).length > 0
    );
    
    console.log(`Filtered ${title} cards:`, filteredCards);
    
    return (
      <div className="deck-section">
        <h3 style={{ color: theme.colors.text }}>{title} ({filteredCards.length})</h3>
        <div className="card-grid">
          {filteredCards.map((card, index) => (
            <div
              key={card.id || `${section}-card-${index}`}
              className="card-item"
              onClick={() => setSelectedCard(card)}
              style={{
                backgroundColor: theme.colors.surface,
                borderColor: theme.colors.border
              }}
            >
              {getCardImage(card) ? (
                <img
                  src={getCardImage(card)}
                  alt={card.name || 'Card'}
                  className="card-image"
                  loading="lazy"
                />
              ) : (
                <div className="card-placeholder">
                  <span style={{ color: theme.colors.textSecondary }}>
                    {card.name ? card.name.substring(0, 1) : '?'}
                  </span>
                </div>
              )}
              <div className="card-info">
                <span className="card-name" style={{ color: theme.colors.text }}>
                  {card.name || 'Unknown Card'}
                </span>
                <span className="card-type" style={{ color: theme.colors.textSecondary }}>
                  {card.type || 'Unknown Type'}
                </span>
                {card.type && card.type.includes('Monster') && (
                  <div className="monster-stats">
                    <span style={{ color: theme.colors.textSecondary }}>
                      {getMonsterStats(card)}
                    </span>
                  </div>
                )}
              </div>
              <button
                className="remove-card"
                onClick={(e) => {
                  e.stopPropagation();
                  onCardRemove(card, section);
                }}
                style={{
                  backgroundColor: theme.colors.error,
                  color: theme.colors.text
                }}
              >
                Remove
              </button>
            </div>
          ))}
        </div>
      </div>
    );
  };

  // Ensure deck object has all required properties and filter out empty objects
  const deckData = {
    main: Array.isArray(deck.main) 
      ? deck.main.filter(card => card && typeof card === 'object' && Object.keys(card).length > 0) 
      : [],
    extra: Array.isArray(deck.extra) 
      ? deck.extra.filter(card => card && typeof card === 'object' && Object.keys(card).length > 0) 
      : [],
    side: Array.isArray(deck.side) 
      ? deck.side.filter(card => card && typeof card === 'object' && Object.keys(card).length > 0) 
      : []
  };

  return (
    <div className="deck-card-display">
      {renderCardSection('Main Deck', deckData.main, 'main')}
      {renderCardSection('Extra Deck', deckData.extra, 'extra')}
      {renderCardSection('Side Deck', deckData.side, 'side')}
      {selectedCard && (
        <div className="card-detail-overlay" onClick={() => setSelectedCard(null)}>
          {renderCardDetail(selectedCard)}
        </div>
      )}
    </div>
  );
};

export default DeckCardDisplay; 