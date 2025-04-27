import React, { useState, useEffect } from 'react';
import { useTheme } from '../../contexts/ThemeContext';
import './DeckCardDisplay.css';

const DeckCardDisplay = ({ deck, onCardSelect, onCardRemove }) => {
  const { theme } = useTheme();
  const [selectedCard, setSelectedCard] = useState(null);
  const [draggedCard, setDraggedCard] = useState(null);
  const [draggedSection, setDraggedSection] = useState(null);
  const [hoveredIndex, setHoveredIndex] = useState(null);
  const [localDeck, setLocalDeck] = useState(deck);
  const [dragOverSection, setDragOverSection] = useState(null);
  const [dragValidSection, setDragValidSection] = useState(true);

  // Deck limits
  const DECK_LIMITS = {
    main: 60,
    extra: 15,
    side: 15
  };

  // Update local deck when prop changes
  useEffect(() => {
    setLocalDeck(deck);
  }, [deck]);

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
    
    // Check all possible image URL properties
    if (card.card_images && card.card_images[0] && card.card_images[0].image_url) {
      return card.card_images[0].image_url;
    }
    
    return card.image_url || null;
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

  const handleDragStart = (e, card, section, index) => {
    setDraggedCard(card);
    setDraggedSection(section);
    
    // Store the card data in the drag event
    e.dataTransfer.setData('text/plain', JSON.stringify({
      cardId: card.id,
      section,
      sourceIndex: index
    }));
    
    // Set the drag effect to move
    e.dataTransfer.effectAllowed = 'move';
    
    // Add a class to the element being dragged
    e.target.classList.add('dragging');
  };
  
  const handleDragOver = (e, section, index) => {
    e.preventDefault();
    
    // Allow drops from any section to side deck, or from side deck to appropriate section
    if (section === draggedSection || 
        section === 'side' || 
        (draggedSection === 'side' && canCardGoInSection(draggedCard, section))) {
      e.dataTransfer.dropEffect = 'move';
      setHoveredIndex(index);
    } else {
      e.dataTransfer.dropEffect = 'none';
    }
  };
  
  // Check if a card can go into a specific section based on card type
  const canCardGoInSection = (card, section) => {
    if (!card || !section) return false;
    
    // Extra deck types
    const extraDeckTypes = [
      'Fusion Monster', 
      'Synchro Monster', 
      'XYZ Monster', 
      'Link Monster'
    ];
    
    // If target is extra deck, only extra deck cards can go there
    if (section === 'extra') {
      return card.type && extraDeckTypes.some(type => card.type.includes(type));
    }
    
    // If target is main deck, only non-extra deck cards can go there
    if (section === 'main') {
      return !card.type || !extraDeckTypes.some(type => card.type.includes(type));
    }
    
    // Side deck can have any card
    return true;
  };
  
  const handleDragEnd = (e) => {
    e.target.classList.remove('dragging');
    setDraggedCard(null);
    setDraggedSection(null);
    setHoveredIndex(null);
  };
  
  const handleDrop = (e, section, targetIndex) => {
    e.preventDefault();
    
    try {
      // Get the dragged card data
      const data = JSON.parse(e.dataTransfer.getData('text/plain'));
      const { cardId, section: sourceSection, sourceIndex } = data;
      
      // Create a copy of the entire deck
      const newDeck = { ...localDeck };
      
      // Don't do anything if dropping on the same spot
      if (sourceSection === section && sourceIndex === targetIndex) return;
      
      // Get the relevant deck sections
      const sourceCards = [...newDeck[sourceSection]];
      const targetCards = sourceSection === section ? sourceCards : [...newDeck[section]];
      
      // Find the card by ID and index
      const cardToMove = sourceCards[sourceIndex];
      
      if (!cardToMove || cardToMove.id !== cardId) {
        console.error("Card mismatch:", cardToMove, cardId);
        return;
      }
      
      // For cross-section moves, check if card can go in the target section
      if (sourceSection !== section && !canCardGoInSection(cardToMove, section)) {
        console.log(`Card ${cardToMove.name} cannot go in ${section} deck`);
        return;
      }
      
      // Remove the card from its original position
      sourceCards.splice(sourceIndex, 1);
      
      // If moving to another section, just add to the end
      if (sourceSection !== section) {
        targetCards.push(cardToMove);
      } else {
        // Insert at the new position within the same section
        const insertIndex = targetIndex > sourceIndex ? targetIndex - 1 : targetIndex;
        targetCards.splice(insertIndex, 0, cardToMove);
      }
      
      // Update the deck with the modified sections
      newDeck[sourceSection] = sourceCards;
      if (sourceSection !== section) {
        newDeck[section] = targetCards;
      }
      
      // Update local state
      setLocalDeck(newDeck);
      
      // Propagate changes to parent component
      if (onCardSelect) {
        // Tell the parent that the deck structure changed
        onCardSelect({ type: 'reorder', from: sourceSection, to: section }, 'reorder');
      }
    } catch (error) {
      console.error('Error during drag and drop:', error);
    }
    
    // Reset drag state
    setDraggedCard(null);
    setDraggedSection(null);
    setHoveredIndex(null);
  };

  // Handle section drag over
  const handleSectionDragOver = (e, section) => {
    e.preventDefault();
    setDragOverSection(section);
    
    // Check if the dragged card can go in this section
    if (draggedCard && draggedSection) {
      const canMove = draggedSection === section || 
                      section === 'side' || 
                      (draggedSection === 'side' && canCardGoInSection(draggedCard, section));
      setDragValidSection(canMove);
    }
  };
  
  // Handle section drag leave
  const handleSectionDragLeave = () => {
    setDragOverSection(null);
    setDragValidSection(true);
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
    
    // Deck limit information
    const cardCount = filteredCards.length;
    const maxCards = DECK_LIMITS[section];
    const isFull = cardCount >= maxCards;
    const isNearFull = cardCount >= maxCards * 0.8;
    
    // Section class based on drag state
    const sectionClass = dragOverSection === section 
      ? (dragValidSection ? 'can-drop' : 'no-drop')
      : '';
    
    return (
      <div 
        className={`deck-section ${sectionClass}`}
        onDragOver={(e) => handleSectionDragOver(e, section)}
        onDragLeave={handleSectionDragLeave}
        onDrop={(e) => handleDrop(e, section, filteredCards.length)} // Drop at the end
      >
        <div className="deck-section-header">
          <h3 style={{ color: theme.colors.text }}>{title}</h3>
          <div 
            className={`deck-limit-indicator ${isFull ? 'full' : isNearFull ? 'near-full' : ''}`}
            style={{ 
              borderColor: theme.colors.border,
              color: isFull || isNearFull ? '#ffffff' : theme.colors.text
            }}
          >
            {cardCount} / {maxCards}
          </div>
        </div>
        
        <div className="card-grid">
          {filteredCards.map((card, index) => (
            <div
              key={`${card.id}-${section}-${index}`}
              className={`card-item ${hoveredIndex === index && draggedSection === section ? 'drag-over' : ''}`}
              onClick={() => setSelectedCard(card)}
              style={{
                backgroundColor: theme.colors.surface,
                borderColor: theme.colors.border
              }}
              draggable="true"
              onDragStart={(e) => handleDragStart(e, card, section, index)}
              onDragEnd={handleDragEnd}
              onDragOver={(e) => handleDragOver(e, section, index)}
              onDrop={(e) => handleDrop(e, section, index)}
            >
              {getCardImage(card) ? (
                <div className="card-image-container">
                  <img
                    src={getCardImage(card)}
                    alt={card.name || 'Card'}
                    className="card-image"
                    loading="lazy"
                  />
                  <div className="card-details-overlay">
                    <span className="card-name" style={{ color: '#ffffff' }}>
                      {card.name || 'Unknown Card'}
                    </span>
                  </div>
                </div>
              ) : (
                <div className="card-placeholder">
                  <span style={{ color: theme.colors.textSecondary }}>
                    {card.name ? card.name.substring(0, 1) : '?'}
                  </span>
                  <div className="card-details-overlay">
                    <span className="card-name" style={{ color: '#ffffff' }}>
                      {card.name || 'Unknown Card'}
                    </span>
                  </div>
                </div>
              )}
              <button
                className="remove-card"
                onClick={(e) => {
                  e.stopPropagation();
                  onCardRemove(card, section);
                }}
                style={{
                  backgroundColor: theme.colors.error,
                  color: theme.colors.white
                }}
              >
                ×
              </button>
            </div>
          ))}
        </div>
      </div>
    );
  };

  // Ensure deck object has all required properties and filter out empty objects
  const deckData = {
    main: Array.isArray(localDeck.main) 
      ? localDeck.main.filter(card => card && typeof card === 'object' && Object.keys(card).length > 0) 
      : [],
    extra: Array.isArray(localDeck.extra) 
      ? localDeck.extra.filter(card => card && typeof card === 'object' && Object.keys(card).length > 0) 
      : [],
    side: Array.isArray(localDeck.side) 
      ? localDeck.side.filter(card => card && typeof card === 'object' && Object.keys(card).length > 0) 
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