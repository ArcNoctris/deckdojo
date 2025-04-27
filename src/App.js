import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import { ThemeProvider } from './contexts/ThemeContext';
import { ToastProvider } from './contexts/ToastContext';
import ProtectedRoute from './components/auth/ProtectedRoute';
import Navbar from './components/navigation/Navbar';
import Footer from './components/common/Footer';
import Login from './components/auth/Login';
import Register from './components/auth/Register';
import Dashboard from './components/dashboard/Dashboard';
import Play from './archive/play/Play';
import LoadingAnimation from './components/common/LoadingAnimation';
import DeckWelcome from './components/deck/DeckWelcome';
import DeckBuilder from './components/deck/DeckBuilder';
import DuelLobby from './components/duel/DuelLobby';
import Duel from './components/duel/Duel';
import './styles/global.css';
import './App.css';

function App() {
  const [loading, setLoading] = useState(true);

  // Simulate initial loading
  useEffect(() => {
    const timer = setTimeout(() => {
      setLoading(false);
    }, 2000);
    
    return () => clearTimeout(timer);
  }, []);

  // Show loading animation without theme context
  if (loading) {
    return <LoadingAnimation fullScreen={true} />;
  }

  return (
    <Router>
      <ThemeProvider>
        <AuthProvider>
          <ToastProvider>
            <div className="app">
              <Navbar />
              <main className="main-content">
                <Routes>
                  {/* Public routes */}
                  <Route path="/" element={<Navigate to="/dashboard" />} />
                  <Route path="/login" element={<Login />} />
                  <Route path="/register" element={<Register />} />
                  <Route path="/play" element={<Play />} />
                  
                  {/* Protected routes */}
                  <Route element={<ProtectedRoute />}>
                    <Route path="/dashboard" element={<Dashboard />} />
                    <Route path="/decks" element={<DeckWelcome />} />
                    <Route path="/decks/new" element={
                      <DeckBuilder />
                    } />
                    <Route path="/decks/:deckId" element={<DeckBuilder />} />
                    <Route path="/duel" element={<DuelLobby />} />
                    <Route path="/duel/:sessionId" element={<Duel />} />
                  </Route>
                </Routes>
              </main>
              <Footer />
            </div>
          </ToastProvider>
        </AuthProvider>
      </ThemeProvider>
    </Router>
  );
}

export default App;
