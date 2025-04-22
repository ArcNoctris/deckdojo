import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { useTheme } from '../../contexts/ThemeContext';
import { getUserDecks } from '../../services/deckService';
import './DeckWelcome.css';
import DeckBox from './DeckBox';

const DeckWelcome = () => {
  const { theme } = useTheme();
  const { currentUser } = useAuth();
  const navigate = useNavigate();
  const [decks, setDecks] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDecks = async () => {
      if (currentUser) {
        try {
          setLoading(true);
          const userDecks = await getUserDecks(currentUser.uid);
          setDecks(userDecks);
        } catch (error) {
          console.error('Error fetching decks:', error);
        } finally {
          setLoading(false);
        }
      }
    };

    fetchDecks();
  }, [currentUser]);

  const handleDeckClick = (deck) => {
    navigate(`/decks/${deck.id}`);
  };

  return (
    <div 
      className="deck-welcome-container"
      style={{ backgroundColor: theme.colors.background }}
    >
      <div className="deck-welcome-header">
        <h1 style={{ color: theme.colors.text }}>My Decks</h1>
        <p style={{ color: theme.colors.textSecondary }}>
          Create and manage your YuGiOh decks
        </p>
      </div>

      {loading ? (
        <div className="deck-loading" style={{ color: theme.colors.text }}>
          Loading your decks...
        </div>
      ) : (
        <div className="deck-grid">
          {decks.map(deck => (
            <div 
              key={deck.id}
              className="deck-link"
              onClick={() => handleDeckClick(deck)}
            >
              <DeckBox 
                name={deck.name} 
                main={deck.main}
                extra={deck.extra}
                side={deck.side}
                mainColor={deck.mainColor || theme.colors.accent}
              />
            </div>
          ))}
          
          <Link to="/decks/new" className="deck-link new-deck">
            <div 
              className="new-deck-box"
              style={{ 
                backgroundColor: theme.colors.surface,
                borderColor: theme.colors.border
              }}
            >
              <div className="plus-icon" style={{ color: theme.colors.accent }}>+</div>
              <p style={{ color: theme.colors.text }}>Create New Deck</p>
            </div>
          </Link>
        </div>
      )}

      {!loading && decks.length === 0 && (
        <div 
          className="no-decks-message"
          style={{ color: theme.colors.textSecondary }}
        >
          <p>You don't have any decks yet. Create your first deck to get started!</p>
        </div>
      )}
    </div>
  );
};

export default DeckWelcome;
