import React, { useState, useEffect } from 'react';
import { useTheme } from '../../contexts/ThemeContext';
import { getCachedImage, initImageCache } from '../../utils/imageCache';
import './DeckCardDisplay.css';

const DeckCardDisplay = ({ deck, onCardSelect, onCardRemove }) => {
  const { theme } = useTheme();
  const [imageUrls, setImageUrls] = useState({});
  const [selectedCard, setSelectedCard] = useState(null);

  useEffect(() => {
    // Initialize cache when component mounts
    initImageCache();
  }, []);

  useEffect(() => {
    const loadImages = async () => {
      const urls = {};
      
      // Load images for all cards in the deck
      const allCards = [...deck.main, ...deck.extra, ...deck.side];
      for (const card of allCards) {
        if (card.image && !imageUrls[card.id]) {
          try {
            const response = await getCachedImage(card.image);
            if (response.ok) {
              const blob = await response.blob();
              urls[card.id] = URL.createObjectURL(blob);
            }
          } catch (error) {
            console.error(`Error loading image for card ${card.id}:`, error);
          }
        }
      }
      
      setImageUrls(prev => ({ ...prev, ...urls }));
    };

    loadImages();
  }, [deck.main, deck.extra, deck.side]);

  // Cleanup object URLs when component unmounts
  useEffect(() => {
    return () => {
      Object.values(imageUrls).forEach(url => URL.revokeObjectURL(url));
    };
  }, [imageUrls]);

  const getCardTypeClass = (type) => {
    if (type.includes('Monster')) return 'monster';
    if (type.includes('Spell')) return 'spell';
    if (type.includes('Trap')) return 'trap';
    return '';
  };

  const handleCardClick = (card) => {
    setSelectedCard(card);
  };

  const handleCloseDetail = () => {
    setSelectedCard(null);
  };

  const handleAddCard = (card) => {
    if (onCardSelect) {
      onCardSelect(card);
    }
  };

  const handleRemoveCard = (card) => {
    if (onCardRemove) {
      onCardRemove(card);
    }
  };

  const renderCardDetail = (card) => (
    <div className="card-detail-overlay" onClick={handleCloseDetail}>
      <div 
        className="card-detail"
        onClick={e => e.stopPropagation()}
        style={{ backgroundColor: theme.colors.surface }}
      >
        <div className="card-detail-header">
          <h3 style={{ color: theme.colors.text }}>{card.name}</h3>
          <button 
            className="close-button"
            onClick={handleCloseDetail}
            style={{ color: theme.colors.text }}
          >
            ×
          </button>
        </div>
        <div className="card-detail-content">
          <img 
            src={imageUrls[card.id]} 
            alt={card.name}
            className="card-detail-image"
          />
          <div className="card-detail-info">
            <p style={{ color: theme.colors.text }}><strong>Type:</strong> {card.type}</p>
            {card.attribute && <p style={{ color: theme.colors.text }}><strong>Attribute:</strong> {card.attribute}</p>}
            {card.level && <p style={{ color: theme.colors.text }}><strong>Level:</strong> {card.level}</p>}
            {card.atk && <p style={{ color: theme.colors.text }}><strong>ATK:</strong> {card.atk}</p>}
            {card.def && <p style={{ color: theme.colors.text }}><strong>DEF:</strong> {card.def}</p>}
            {card.desc && <p style={{ color: theme.colors.text }}><strong>Description:</strong> {card.desc}</p>}
          </div>
        </div>
        <div className="card-detail-actions">
          <button 
            className="add-button"
            onClick={() => handleAddCard(card)}
            style={{ backgroundColor: theme.colors.success }}
          >
            Add to Deck
          </button>
          <button 
            className="remove-button"
            onClick={() => handleRemoveCard(card)}
            style={{ backgroundColor: theme.colors.error }}
          >
            Remove from Deck
          </button>
        </div>
      </div>
    </div>
  );

  const renderCardSection = (title, cards) => (
    <div className="card-section">
      <h3 style={{ color: theme.colors.text }}>
        {title} ({cards.length})
      </h3>
      <div className="card-grid">
        {cards.map((card, index) => (
          <div 
            key={`${card.id}-${index}`} 
            className={`card-preview ${getCardTypeClass(card.type)}`}
            onClick={() => handleCardClick(card)}
            style={{ 
              backgroundColor: theme.colors.surface,
              borderColor: theme.colors.border
            }}
          >
            {imageUrls[card.id] ? (
              <img 
                src={imageUrls[card.id]} 
                alt={card.name}
                className="card-image"
                loading="lazy"
              />
            ) : (
              <div className="card-placeholder">
                <span style={{ color: theme.colors.textSecondary }}>
                  Loading...
                </span>
              </div>
            )}
            <div className="card-info">
              <span className="card-name" style={{ color: theme.colors.text }}>
                {card.name}
              </span>
              <span className="card-type" style={{ color: theme.colors.textSecondary }}>
                {card.type}
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );

  return (
    <div className="deck-card-display">
      {renderCardSection('Main Deck', deck.main || [])}
      {renderCardSection('Extra Deck', deck.extra || [])}
      {renderCardSection('Side Deck', deck.side || [])}
      {selectedCard && renderCardDetail(selectedCard)}
    </div>
  );
};

export default DeckCardDisplay; 