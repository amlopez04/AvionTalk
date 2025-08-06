// components/Auth/Login.jsx
import { useState } from 'react';
import {
  Button, TextField, Typography, Paper, FormControlLabel, Checkbox, Alert
} from '@mui/material';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { useData } from '../../context/DataProvider';
import './Login.css';


const API_URL = "https://slack-api.up.railway.app";

export default function Login({ onLogin }) {
  const [isRegistering, setIsRegistering] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [passwordConfirmation, setPasswordConfirmation] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const navigate = useNavigate();
  const { handleHeaders, setCurrentUser } = useData();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    const payload = {
      email,
      password,
      ...(isRegistering && { password_confirmation: passwordConfirmation })
    };

    const endpoint = isRegistering
      ? `${API_URL}/api/v1/auth/`
      : `${API_URL}/api/v1/auth/sign_in`;

    try {
      console.log(`Attempting ${isRegistering ? 'registration' : 'login'} with:`, payload);
      const response = await axios.post(endpoint, payload);
      const { data, headers } = response;
      
      console.log('Auth response:', response.data);
      console.log('Auth headers:', headers);

      if (data.data && headers) {
        // Set the authentication headers
        handleHeaders(headers);
        
        // Set current user data
        setCurrentUser(data.data);
        
        // Trigger login
        onLogin(true);
        navigate('/');
      }
    } catch (err) {
      console.error('Auth error:', err.response?.data || err.message);
      const errorMessage = err.response?.data?.errors?.full_messages?.[0] || 
                          err.response?.data?.message || 
                          (isRegistering ? "Registration failed" : "Login failed");
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-container">
      <div className="login-sidebar">
        <h1 className="login-title">AvionTalk</h1>
        <p className="login-subtitle">The universal chat app for Avion School bootcampers.</p>
      </div>

      <div className="login-form-container">
        <Paper elevation={3} className="login-paper">
          <Typography variant="h5" gutterBottom>
            {isRegistering ? 'Register' : 'Login'}
          </Typography>
          
          {error && (
            <Alert severity="error" sx={{ mb: 2 }}>
              {error}
            </Alert>
          )}

          <form onSubmit={handleSubmit}>
            <TextField
              fullWidth
              margin="normal"
              label="Email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              disabled={loading}
            />
            <TextField
              fullWidth
              margin="normal"
              type={showPassword ? 'text' : 'password'}
              label="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              disabled={loading}
            />
            {isRegistering && (
              <TextField
                fullWidth
                margin="normal"
                type={showPassword ? 'text' : 'password'}
                label="Confirm Password"
                value={passwordConfirmation}
                onChange={(e) => setPasswordConfirmation(e.target.value)}
                required
                disabled={loading}
              />
            )}

            <FormControlLabel
              control={
                <Checkbox
                  checked={showPassword}
                  onChange={() => setShowPassword(!showPassword)}
                  disabled={loading}
                />
              }
              label="Show password"
            />

            <Button 
              type="submit" 
              fullWidth 
              variant="contained" 
              className="login-button"
              disabled={loading}
            >
              {loading ? 'Processing...' : (isRegistering ? 'Register' : 'Login')}
            </Button>
          </form>

          <div className="login-toggle">
            <Button 
              size="small" 
              onClick={() => setIsRegistering(!isRegistering)}
              disabled={loading}
            >
              {isRegistering ? 'Already have an account? Login' : "Don't have an account? Register"}
            </Button>
          </div>
        </Paper>
      </div>
    </div>
  );
}
