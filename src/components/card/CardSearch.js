import React, { useState, useEffect, useCallback } from 'react';
import { useTheme } from '../../contexts/ThemeContext';
import { searchCards, getRandomCards } from '../../services/mongodbService';
import CardGrid from './CardGrid';
import './CardSearch.css';

const CardSearch = ({ onCardSelect }) => {
  const { theme } = useTheme();
  const [searchQuery, setSearchQuery] = useState('');
  const [cards, setCards] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [filters, setFilters] = useState({
    type: '',
    attribute: '',
    race: '',
    level: '',
    atk: '',
    def: ''
  });

  const debouncedSearch = useCallback(
    async (query, currentFilters) => {
      setLoading(true);
      setError(null);
      try {
        let results;
        if (query.trim() === '') {
          results = await getRandomCards(20);
        } else {
          // Convert empty string filters to undefined
          const cleanFilters = Object.fromEntries(
            Object.entries(currentFilters)
              .filter(([_, value]) => value !== '')
              .map(([key, value]) => [key, value])
          );
          results = await searchCards(query, cleanFilters);
        }
        setCards(results);
      } catch (err) {
        setError('Failed to search cards. Please try again.');
        console.error('Search error:', err);
      } finally {
        setLoading(false);
      }
    },
    []
  );

  useEffect(() => {
    const timer = setTimeout(() => {
      debouncedSearch(searchQuery, filters);
    }, 300);

    return () => clearTimeout(timer);
  }, [searchQuery, filters, debouncedSearch]);

  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setFilters(prev => ({
      ...prev,
      [name]: value
    }));
  };

  return (
    <div className="card-search" style={{ backgroundColor: theme.colors.background }}>
      <div className="search-container">
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="Search cards..."
          className="search-input"
          style={{
            //backgroundColor: theme.colors.surface,
            //color: theme.colors.text,
            borderColor: theme.colors.border
          }}
        />
        
        <div className="filters">
          <select
            name="type"
            value={filters.type}
            onChange={handleFilterChange}
            className="filter-select"
            style={{
              backgroundColor: theme.colors.surface,
              color: theme.colors.text,
              borderColor: theme.colors.border
            }}
          >
            <option value="">All Types</option>
            <option value="Monster">Monster</option>
            <option value="Spell">Spell</option>
            <option value="Trap">Trap</option>
          </select>

          {filters.type === 'Monster' && (
            <>
              <select
                name="attribute"
                value={filters.attribute}
                onChange={handleFilterChange}
                className="filter-select"
                style={{
                  backgroundColor: theme.colors.surface,
                  color: theme.colors.text,
                  borderColor: theme.colors.border
                }}
              >
                <option value="">All Attributes</option>
                <option value="DARK">DARK</option>
                <option value="LIGHT">LIGHT</option>
                <option value="EARTH">EARTH</option>
                <option value="WATER">WATER</option>
                <option value="FIRE">FIRE</option>
                <option value="WIND">WIND</option>
                <option value="DIVINE">DIVINE</option>
              </select>

              <select
                name="race"
                value={filters.race}
                onChange={handleFilterChange}
                className="filter-select"
                style={{
                  backgroundColor: theme.colors.surface,
                  color: theme.colors.text,
                  borderColor: theme.colors.border
                }}
              >
                <option value="">All Races</option>
                <option value="Dragon">Dragon</option>
                <option value="Spellcaster">Spellcaster</option>
                <option value="Zombie">Zombie</option>
                <option value="Warrior">Warrior</option>
                <option value="Beast-Warrior">Beast-Warrior</option>
                <option value="Beast">Beast</option>
                <option value="Winged Beast">Winged Beast</option>
                <option value="Fiend">Fiend</option>
                <option value="Fairy">Fairy</option>
                <option value="Insect">Insect</option>
                <option value="Dinosaur">Dinosaur</option>
                <option value="Reptile">Reptile</option>
                <option value="Fish">Fish</option>
                <option value="Sea Serpent">Sea Serpent</option>
                <option value="Machine">Machine</option>
                <option value="Thunder">Thunder</option>
                <option value="Aqua">Aqua</option>
                <option value="Pyro">Pyro</option>
                <option value="Rock">Rock</option>
                <option value="Plant">Plant</option>
                <option value="Psychic">Psychic</option>
                <option value="Divine-Beast">Divine-Beast</option>
                <option value="Wyrm">Wyrm</option>
                <option value="Cyberse">Cyberse</option>
              </select>

              <input
                type="number"
                name="level"
                value={filters.level}
                onChange={handleFilterChange}
                placeholder="Level"
                className="filter-input"
                style={{
                  backgroundColor: theme.colors.surface,
                  color: theme.colors.text,
                  borderColor: theme.colors.border
                }}
              />

              <input
                type="number"
                name="atk"
                value={filters.atk}
                onChange={handleFilterChange}
                placeholder="ATK"
                className="filter-input"
                style={{
                  backgroundColor: theme.colors.surface,
                  color: theme.colors.text,
                  borderColor: theme.colors.border
                }}
              />

              <input
                type="number"
                name="def"
                value={filters.def}
                onChange={handleFilterChange}
                placeholder="DEF"
                className="filter-input"
                style={{
                  backgroundColor: theme.colors.surface,
                  color: theme.colors.text,
                  borderColor: theme.colors.border
                }}
              />
            </>
          )}
        </div>
      </div>

      {error && (
        <div className="error-message" style={{ color: theme.colors.error }}>
          {error}
        </div>
      )}

      {loading ? (
        <div className="loading" style={{ color: theme.colors.text }}>
          Loading...
        </div>
      ) : (
        <CardGrid 
          cards={cards} 
          onCardSelect={onCardSelect}
          theme={theme}
        />
      )}
    </div>
  );
};

export default CardSearch; 