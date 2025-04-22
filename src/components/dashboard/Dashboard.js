import React from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { logoutUser } from '../../services/firebase/firebase';

const Dashboard = () => {
  const { currentUser } = useAuth();

  const handleLogout = async () => {
    try {
      await logoutUser();
    } catch (error) {
      console.error('Failed to log out', error);
    }
  };

  return (
    <div className="dashboard">
      <header className="dashboard-header">
        <h1>DeckDojo Dashboard</h1>
        <div className="user-info">
          <span>Welcome, {currentUser?.email}</span>
          <button onClick={handleLogout}>Logout</button>
        </div>
      </header>

      <div className="dashboard-content">
        <div className="feature-cards">
          <div className="feature-card">
            <h3>Life Point Tracker</h3>
            <p>Track life points during your duels</p>
            <Link to="/life-points">Open Tracker</Link>
          </div>
          
          <div className="feature-card">
            <h3>Deck Builder</h3>
            <p>Create and manage your YuGiOh decks</p>
            <Link to="/decks">My Decks</Link>
          </div>
          
          <div className="feature-card">
            <h3>Game History</h3>
            <p>View your past duels and statistics</p>
            <Link to="/history">View History</Link>
          </div>
          
          <div className="feature-card">
            <h3>Card Scanner</h3>
            <p>Scan cards to check prices (Coming Soon)</p>
            <Link to="/scanner" className="disabled">Scanner</Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
