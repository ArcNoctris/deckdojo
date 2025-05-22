import React from 'react';
import PageBackground from '../common/PageBackground';
import { pageBackgrounds } from '../../assets/images/page-backgrounds';

const Explore = () => {
  return (
    <PageBackground backgroundImage={pageBackgrounds.explore}>
      <div className="page-content explore-content">
        <header className="page-header">
          <h1>Card Explorer</h1>
          <p className="page-description">Discover new cards and strategies</p>
        </header>

        <div className="explore-options">
          <div className="explore-option">
            <h2>Card Database</h2>
            <p>Browse the complete card collection</p>
            <button className="pixel-button">View Cards</button>
          </div>

          <div className="explore-option">
            <h2>Meta Analysis</h2>
            <p>Study current meta trends</p>
            <button className="pixel-button">View Meta</button>
          </div>

          <div className="explore-option">
            <h2>Strategy Guides</h2>
            <p>Learn advanced techniques</p>
            <button className="pixel-button">Read Guides</button>
          </div>
        </div>
      </div>
    </PageBackground>
  );
};

export default Explore; 