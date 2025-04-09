import React, { useState, useEffect } from 'react';
import { useTheme } from '../../contexts/ThemeContext';
import { db } from '../../firebase/firebase';
import { collection, query, where, getDocs, orderBy, limit } from 'firebase/firestore';
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

  const searchCards = async () => {
    try {
      setLoading(true);
      setError(null);

      let q = collection(db, 'card');
      const conditions = [];

      // Name search
      if (searchTerm) {
        conditions.push(where('name', '>=', searchTerm));
        conditions.push(where('name', '<=', searchTerm + '\uf8ff'));
      }

      // Type filter
      if (selectedType) {
        conditions.push(where('type', '==', selectedType));
      }

      // Attribute filter (only for monsters)
      if (selectedAttribute && selectedType.includes('Monster')) {
        conditions.push(where('attribute', '==', selectedAttribute));
      }

      // Level range (only for monsters)
      if (selectedType.includes('Monster')) {
        if (minLevel) conditions.push(where('level', '>=', parseInt(minLevel)));
        if (maxLevel) conditions.push(where('level', '<=', parseInt(maxLevel)));
      }

      // ATK range (only for monsters)
      if (selectedType.includes('Monster')) {
        if (minATK) conditions.push(where('atk', '>=', parseInt(minATK)));
        if (maxATK) conditions.push(where('atk', '<=', parseInt(maxATK)));
      }

      // DEF range (only for monsters)
      if (selectedType.includes('Monster')) {
        if (minDEF) conditions.push(where('def', '>=', parseInt(minDEF)));
        if (maxDEF) conditions.push(where('def', '<=', parseInt(maxDEF)));
      }

      // Add order and limit
      conditions.push(orderBy('name'));
      conditions.push(limit(50));

      const cardQuery = query(q, ...conditions);
      const querySnapshot = await getDocs(cardQuery);
      
      const cardList = [];
      querySnapshot.forEach((doc) => {
        cardList.push({ id: doc.id, ...doc.data() });
      });

      setCards(cardList);
    } catch (error) {
      console.error('Error searching cards:', error);
      setError('Failed to search cards. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    searchCards();
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
            backgroundColor: theme.colors.accent,
            color: theme.colors.white
          }}
        >
          Search
        </button>
      </form>

      {error && (
        <div 
          className="error-message"
          style={{ 
            backgroundColor: theme.colors.error,
            color: theme.colors.white
          }}
        >
          {error}
        </div>
      )}

      {loading ? (
        <div className="loading-message" style={{ color: theme.colors.text }}>
          Searching cards...
        </div>
      ) : (
        <div className="search-results">
          {cards.map(card => (
            <div
              key={card.id}
              className="card-result"
              onClick={() => onCardSelect(card)}
              style={{
                backgroundColor: theme.colors.cardBackground,
                borderColor: theme.colors.border
              }}
            >
              <img 
                src={card.card_image.small} 
                alt={card.name}
                className="card-image"
                loading="lazy"
              />
              <div className="card-info">
                <span className="card-name" style={{ color: theme.colors.text }}>
                  {card.name}
                </span>
                <span className="card-type" style={{ color: theme.colors.textSecondary }}>
                  {card.type}
                </span>
                {isMonsterType && (
                  <>
                    <span style={{ color: theme.colors.textSecondary }}>
                      ATK: {card.atk} / DEF: {card.def}
                    </span>
                    <span style={{ color: theme.colors.textSecondary }}>
                      Level: {card.level} / Attribute: {card.attribute}
                    </span>
                  </>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default CardSearch; 