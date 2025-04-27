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
      className="arsenal-container"
      style={{ backgroundColor: theme.colors.background }}
    >
      <div className="arsenal-header">
        <h1 style={{ color: theme.colors.text }}>Arsenal</h1>
        <p style={{ color: theme.colors.textSecondary }}>
          Your deck collection displayed on a wooden shelf
        </p>
        
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
          <span className="plus-icon-small">+</span> Add to Arsenal
        </Link>
      </div>

      {loading ? (
        <div className="deck-loading" style={{ color: theme.colors.text }}>
          Loading your arsenal...
        </div>
      ) : (
        <>
          <div className="wooden-shelf">
            {currentDecks.map(deck => (
              <div 
                key={deck.id}
                className="deck-link"
              >
                <DeckBox deck={deck} />
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
          className="empty-arsenal-message"
          style={{ color: theme.colors.textSecondary }}
        >
          <p>Your arsenal is empty. Add your first deck to get started!</p>
        </div>
      )}
    </div>
  );
};

export default DeckWelcome;
