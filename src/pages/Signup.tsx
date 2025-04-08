import TopBar from '@/components/TopBar';
import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { register } from '@/utils/auth';

const Signup: React.FC = () => {
  const [formData, setFormData] = useState({
    username: '',
    password: '',
    passwordConfirm: '',
    email: ''
  });
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    
    if (formData.password !== formData.passwordConfirm) {
      setError('Passwords do not match');
      return;
    }

    try {
      await register({
        username: formData.username,
        password: formData.password,
        email: formData.email
      });
      navigate('/');
    } catch (err) {
      setError('Registration failed. Please try again.');
    }
  };

  return (
    <>
      <TopBar/>
      <h1>Signup</h1>
      {error && <div className="error">{error}</div>}
      <form id="loginForm" onSubmit={handleSubmit}>
        <h2>Get a new account!</h2>
        <label>Username:</label>
        <input
          type='text'
          name="username"
          value={formData.username}
          onChange={handleChange}
          required
        /><br/>

        <label>Email:</label>
        <input
          type='email'
          name="email"
          value={formData.email}
          onChange={handleChange}
          required
        /><br/>

        <label htmlFor="password">Password:</label>
        <input
          type='password'
          name="password"
          value={formData.password}
          onChange={handleChange}
          required
        /><br/>

        <label htmlFor="passwordConfirm">Confirm Password:</label>
        <input
          type='password'
          name="passwordConfirm"
          value={formData.passwordConfirm}
          onChange={handleChange}
          required
        /><br/>

        <input type='submit' value="Create Account" />
      </form>
      <Link to="/">Go back</Link><br/>
    </>
  );
};

export default Signup;
