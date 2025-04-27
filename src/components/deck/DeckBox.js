import React, { useMemo, useState, useEffect } from 'react';
import { useTheme } from '../../contexts/ThemeContext';
import './DeckBox.css';
import { Link } from 'react-router-dom';
import { getCardById } from '../../services/mongodbService';

const DeckBox = (props) => {
  const { theme } = useTheme();
  const [cardDetails, setCardDetails] = useState([]);
  const [loading, setLoading] = useState(false);
  
  // Handle both cases: when passed a deck object or when passed individual props
  const deck = props.deck || props;
  const id = props.id || deck.id;
  
  const { name, mainColor, deckTags = [], userName, stats, versions = [] } = deck || {};
  
  // Get the latest version of the deck (or use empty arrays if no versions)
  const latestVersion = versions.length > 0 ? versions[versions.length-1] : null;
  
  // Get deck sections from latest version or use empty arrays as fallback
  const main = latestVersion?.main_deck || deck.main || [];
  const extra = latestVersion?.extra_deck || deck.extra || [];
  const side = latestVersion?.side_deck || deck.side || [];
  
  // Calculate card counts - use stats.main_count if available, otherwise fallback to array length
  const mainCount = stats?.main_count || (Array.isArray(main) ? main.length : 0);
  const extraCount = stats?.extra_count || (Array.isArray(extra) ? extra.length : 0);
  const sideCount = stats?.side_count || (Array.isArray(side) ? side.length : 0);
  const totalCards = mainCount + extraCount + sideCount;
  
  // Select 3 random card IDs to display
  const randomCardIds = useMemo(() => {
    const allCards = [...(main || []), ...(extra || []), ...(side || [])];
    
    // If we have no cards, return empty array
    if (!allCards.length) return [];
    
    // Shuffle the card references
    const shuffled = [...allCards].sort(() => 0.5 - Math.random());
    
    // Take up to 3 random card references and extract card_id from different possible formats
    return shuffled.slice(0, 3).map(card => {
      // Handle different ways card IDs might be stored
      if (card.card_id) return card.card_id;
      if (card.id) return card.id;
      return null;
    }).filter(id => id !== null); // Remove any nulls
  }, [main, extra, side]);

  // Fetch the actual card details for display
  useEffect(() => {
    const fetchCardDetails = async () => {
      if (!randomCardIds.length) return;
      
      setLoading(true);
      try {
        // Fetch details for each card ID
        const promises = randomCardIds.map(id => getCardById(id));
        const results = await Promise.all(promises);
        
        // Filter out any null results
        const validCards = results.filter(card => card !== null);
        setCardDetails(validCards);
      } catch (error) {
        console.error('Error fetching card details:', error);
      } finally {
        setLoading(false);
      }
    };
    
    fetchCardDetails();
  }, [randomCardIds]);
  
  const getCardImage = (card) => {
    if (!card) return '';
    if (card?.card_images?.[0]?.image_url) {
      return card.card_images[0].image_url;
    } else if (card?.card_images?.[0]?.image_url_small) {
      return card.card_images[0].image_url_small;
    } else if (card?.image_url) {
      return card.image_url;
    }
    return '';
  };
  
  return (
    <Link to={`/decks/${id}`} style={{ textDecoration: 'none', color: 'inherit' }}>
      <div className="deck-box-container">
        <div 
          className="deck-box"
          style={{ 
            backgroundColor: theme.colors.surface,
            borderColor: theme.colors.border,
            boxShadow: theme.shadows.medium
          }}
        >
          {/* Pixel Deckbox Art */}
          <div className="pixel-deckbox">
            <div 
              className="deckbox-lid"
              style={{ backgroundColor: mainColor || theme.colors.accent }}
            >
              <div className="deckbox-lid-shadow"></div>
              <div className="deckbox-emblem" style={{ backgroundColor: theme.colors.secondary }}></div>
            </div>
            <div 
              className="deckbox-body"
              style={{ backgroundColor: mainColor || theme.colors.accent }}
            >
              <div className="deckbox-body-shadow"></div>
              <div className="deckbox-cards">
                {[...Array(3)].map((_, i) => {
                  // Calculate a small random rotation for each card
                  const randomRotation = Math.random() * 6 - 3;
                  const cardForThisSlot = cardDetails[i];
                  const hasImage = !!cardForThisSlot;
                  
                  return (
                    <div 
                      key={i} 
                      className={`deckbox-card ${hasImage ? 'with-image' : ''}`}
                      style={{ 
                        backgroundColor: theme.colors.cardBackground,
                        borderColor: theme.colors.border,
                        transform: `translateY(${i * -3}px) rotate(${randomRotation}deg)`,
                        zIndex: 10 - i,
                        display: i < cardDetails.length || i === 0 ? 'block' : 'none'
                      }}
                    >
                      {hasImage && (
                        <div 
                          className="deckbox-card-image" 
                          style={{ backgroundImage: `url(${getCardImage(cardForThisSlot)})` }}
                        ></div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
          
          {/* Deck Info */}
          <div className="deck-info">
            <h3 style={{ color: theme.colors.text }}>{name}</h3>
            <div className="deck-stats">
              <span style={{ color: theme.colors.textSecondary }}>
                Main: {mainCount}
              </span>
              <span style={{ color: theme.colors.textSecondary }}>
                Extra: {extraCount}
              </span>
              <span style={{ color: theme.colors.textSecondary }}>
                Side: {sideCount}
              </span>
            </div>
            {userName && (
              <p className="deck-creator" style={{ color: theme.colors.textSecondary }}>
                By: {userName}
              </p>
            )}
            <p style={{ color: theme.colors.textSecondary }}>
              Total: {totalCards} cards
            </p>
            {deckTags && deckTags.length > 0 && (
              <div className="deck-tags">
                {deckTags.map((tag, i) => (
                  <span key={i} className="deck-tag">{tag}</span>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </Link>
  );
};

export default DeckBox;
