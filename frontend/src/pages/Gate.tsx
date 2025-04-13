import React, { useState } from 'react';
import { Link, useNavigate } from "react-router-dom";
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
        
        <input type="submit" value="Log in"/>
      </form>
      
      <p>Or <button>Sign in with Google</button></p>
      
      <Link to="/signup">Create an account</Link><br/>
      <Link to="/leaderboard">View leaderboard</Link><br/>
    </>
  );
};

export default Gate;
