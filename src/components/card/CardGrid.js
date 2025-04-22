import React from 'react';
import './CardGrid.css';

const CardGrid = ({ cards, onCardSelect, theme }) => {
  const getCardTypeClass = (type) => {
    if (type.includes('Monster')) return 'monster';
    if (type.includes('Spell')) return 'spell';
    if (type.includes('Trap')) return 'trap';
    return '';
  };

  const getCardImage = (card) => {
    return card?.imageUrl || null;
  };

  const getMonsterStats = (card) => {
    if (!card.type.includes('Monster')) return null;

    const stats = [];
    if (card.level) stats.push(`Lv.${card.level}`);
    if (card.rank) stats.push(`Rank ${card.rank}`);
    if (card.linkval) stats.push(`Link-${card.linkval}`);
    if (card.attribute) stats.push(card.attribute);
    if (card.race) stats.push(card.race);

    return stats.join(' ');
  };

  return (
    <div className="card-grid">
      {cards.map((card) => (
        <div
          key={card.id}
          className={`card-item ${getCardTypeClass(card.type)}`}
          onClick={() => onCardSelect(card)}
          style={{
            backgroundColor: theme.colors.surface,
            borderColor: theme.colors.border
          }}
        >
          {getCardImage(card) ? (
            <img
              src={getCardImage(card)}
              alt={card.name}
              className="card-image"
              loading="lazy"
            />
          ) : (
            <div className="card-placeholder">
              <span style={{ color: theme.colors.textSecondary }}>
                No Image
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
            {card.type.includes('Monster') && (
              <div className="monster-stats">
                <span style={{ color: theme.colors.textSecondary }}>
                  {getMonsterStats(card)}
                </span>
                <span style={{ color: theme.colors.textSecondary }}>
                  {card.atk !== undefined && `ATK: ${card.atk}`}
                  {card.def !== undefined && ` / DEF: ${card.def}`}
                </span>
                {card.linkmarkers && (
                  <div className="link-markers">
                    {card.linkmarkers.map((marker, index) => (
                      <span key={index} className="link-marker">
                        {marker}
                      </span>
                    ))}
                  </div>
                )}
              </div>
            )}
            {card.archetype && (
              <span className="archetype" style={{ color: theme.colors.textSecondary }}>
                {card.archetype}
              </span>
            )}
          </div>
        </div>
      ))}
    </div>
  );
};

export default CardGrid; 