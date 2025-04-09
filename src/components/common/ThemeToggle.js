import React from 'react';
import { useTheme } from '../../contexts/ThemeContext';
import './ThemeToggle.css';

const ThemeToggle = () => {
  const { isDarkMode, toggleTheme } = useTheme();

  return (
    <button 
      className={`theme-toggle pixel-toggle ${isDarkMode ? 'dark' : 'light'}`} 
      onClick={toggleTheme}
      aria-label={`Switch to ${isDarkMode ? 'light' : 'dark'} mode`}
    >
      {isDarkMode ? (
        <div className="toggle-icon sun-icon">
          <div className="sun-center"></div>
          <div className="sun-ray ray-1"></div>
          <div className="sun-ray ray-2"></div>
          <div className="sun-ray ray-3"></div>
          <div className="sun-ray ray-4"></div>
        </div>
      ) : (
        <div className="toggle-icon moon-icon">
          <div className="moon"></div>
          <div className="star star-1"></div>
          <div className="star star-2"></div>
          <div className="star star-3"></div>
        </div>
      )}
    </button>
  );
};

export default ThemeToggle;
