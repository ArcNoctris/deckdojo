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
  const [currentPage, setCurrentPage] = useState(1);
  const decksPerPage = 12;

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

  // Get current decks for pagination
  const indexOfLastDeck = currentPage * decksPerPage;
  const indexOfFirstDeck = indexOfLastDeck - decksPerPage;
  const currentDecks = decks.slice(indexOfFirstDeck, indexOfLastDeck);
  const totalPages = Math.ceil(decks.length / decksPerPage);

  const paginate = (pageNumber) => setCurrentPage(pageNumber);

  return (
    <div 
      className="deck-welcome-container"
      style={{ backgroundColor: theme.colors.background }}
    >
      <div className="deck-welcome-header">
        <h1 style={{ color: theme.colors.text }}>My Decks</h1>
        <p style={{ color: theme.colors.textSecondary }}>
          Create and manage your card decks
        </p>
        
        {console.log('Create deck link URL:', '/decks/new')}
        <Link 
          to="/decks/new" 
          onClick={(e) => {
            // Ensure we're properly creating a new deck
            e.preventDefault();
            // Force a full page load to ensure clean state
            window.location.href = '/decks/new';
          }}
          className="create-deck-button" 
          style={{ 
            backgroundColor: theme.colors.accent,
            color: theme.colors.white
          }}
        >
          <span className="plus-icon-small">+</span> Create New Deck
        </Link>
      </div>

      {loading ? (
        <div className="deck-loading" style={{ color: theme.colors.text }}>
          Loading your decks...
        </div>
      ) : (
        <>
          <div className="deck-grid">
            {currentDecks.map(deck => (
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
          </div>
          
          {totalPages > 1 && (
            <div className="pagination-container">
              <div className="pagination">
                <button 
                  onClick={() => paginate(currentPage - 1)} 
                  disabled={currentPage === 1}
                  style={{
                    backgroundColor: theme.colors.surface,
                    color: theme.colors.text,
                    borderColor: theme.colors.border,
                    opacity: currentPage === 1 ? 0.5 : 1
                  }}
                >
                  Previous
                </button>
                
                <div className="page-info" style={{ color: theme.colors.text }}>
                  Page {currentPage} of {totalPages}
                </div>
                
                <button 
                  onClick={() => paginate(currentPage + 1)} 
                  disabled={currentPage === totalPages}
                  style={{
                    backgroundColor: theme.colors.surface,
                    color: theme.colors.text,
                    borderColor: theme.colors.border,
                    opacity: currentPage === totalPages ? 0.5 : 1
                  }}
                >
                  Next
                </button>
              </div>
            </div>
          )}
        </>
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
