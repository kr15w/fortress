import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { login } from '@/utils/auth';

const Gate: React.FC = () => {
  const [credentials, setCredentials] = useState({
    username: '',
    password: ''
  });
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setCredentials({
      ...credentials,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    
    try {
      await login(credentials);
      navigate('/menu');
    } catch (err) {
      setError('Login failed. Please check your credentials.');
    }
  };

  const handleGoogleLogin = () => {
    window.location.href = 'http://localhost:5000/auth/google/login'; // Redirect to Google Login
  };

  return (
    <>
      <h1>Login</h1>
      {error && <div className="error">{error}</div>}
      
      <form id="loginForm" onSubmit={handleSubmit}>
        <h2>Enter your credentials</h2>
        <label>Username:</label>
        <input
          type='text'
          name="username"
          value={credentials.username}
          onChange={handleChange}
          required
        /><br/>
        
        <label>Password:</label>
        <input
          type='password'
          name="password"
          value={credentials.password}
          onChange={handleChange}
          required
        /><br/>
        
        <input type="submit" value="Log in" />
      </form>
      
      Or 

      {/* Google Login Button */}
      <button onClick={handleGoogleLogin} style={{ padding: '10px', fontSize: '16px' }}>
        Sign in with Google
      </button>

      <br />
      <br />

      {/* Additional Links */}
      <Link to="/signup">Create an Account</Link><br />
      <Link to="/leaderboard">View the Leaderboard</Link><br />
      
      {/* Reset Password Link */}
      <Link to="/change-password">Reset Password</Link>
    </>
  );
};

export default Gate;