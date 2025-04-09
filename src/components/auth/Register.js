import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { registerUser, signInWithGoogle } from '../../firebase/firebase';
import { useTheme } from '../../contexts/ThemeContext';
import './Auth.css';

const Register = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { theme } = useTheme();

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (password !== confirmPassword) {
      return setError('Passwords do not match');
    }
    
    try {
      setError('');
      setLoading(true);
      await registerUser(email, password);
      navigate('/dashboard');
    } catch (error) {
      setError('Failed to create an account: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleSignIn = async () => {
    try {
      setError('');
      setLoading(true);
      await signInWithGoogle();
      navigate('/dashboard');
    } catch (error) {
      setError('Failed to sign in with Google: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-container" style={{ backgroundColor: theme.colors.background }}>
      <div className="auth-card pixel-border" style={{ 
        backgroundColor: theme.colors.surface,
        borderColor: theme.colors.primary,
        boxShadow: theme.shadows.pixelMedium
      }}>
        <h2 className="auth-title" style={{ color: theme.colors.text }}>Create an Account</h2>
        
        {error && (
          <div className="auth-error pixel-border" style={{ 
            backgroundColor: theme.colors.error,
            color: theme.colors.white,
            borderColor: theme.colors.error
          }}>
            {error}
          </div>
        )}
        
        <form onSubmit={handleSubmit} className="auth-form">
          <div className="form-group">
            <label htmlFor="email" style={{ color: theme.colors.text }}>Email</label>
            <input
              type="email"
              id="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="pixel-input"
              style={{ 
                borderColor: theme.colors.border,
                backgroundColor: theme.colors.background,
                color: theme.colors.text
              }}
            />
          </div>
          
          <div className="form-group">
            <label htmlFor="password" style={{ color: theme.colors.text }}>Password</label>
            <input
              type="password"
              id="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              className="pixel-input"
              style={{ 
                borderColor: theme.colors.border,
                backgroundColor: theme.colors.background,
                color: theme.colors.text
              }}
            />
          </div>
          
          <div className="form-group">
            <label htmlFor="confirm-password" style={{ color: theme.colors.text }}>Confirm Password</label>
            <input
              type="password"
              id="confirm-password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              required
              className="pixel-input"
              style={{ 
                borderColor: theme.colors.border,
                backgroundColor: theme.colors.background,
                color: theme.colors.text
              }}
            />
          </div>
          
          <button 
            type="submit" 
            disabled={loading}
            className="auth-button pixel-button"
            style={{
              backgroundColor: theme.colors.primary,
              color: theme.colors.textOnPrimary,
              borderColor: theme.colors.primary
            }}
          >
            {loading ? 'Creating Account...' : 'Register'}
          </button>
        </form>
        
        <div className="auth-divider" style={{ color: theme.colors.textSecondary }}>
          <span>OR</span>
        </div>
        
        <button 
          onClick={handleGoogleSignIn}
          className="social-button google-button pixel-button"
          style={{
            backgroundColor: theme.colors.surface,
            color: theme.colors.text,
            borderColor: theme.colors.border
          }}
        >
          <span className="social-icon">G</span>
          <span>Sign up with Google</span>
        </button>
        
        <div className="auth-links" style={{ color: theme.colors.textSecondary }}>
          <p>
            Already have an account? <Link to="/login" style={{ color: theme.colors.primary }}>Login</Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Register;
