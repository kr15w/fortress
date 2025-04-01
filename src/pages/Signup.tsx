import TopBar from '@/components/TopBar';
import React from 'react';
import { Link } from 'react-router-dom';

const Signup: React.FC = () => {
  return (
    <>
    <TopBar/>
    
      <h1>Signup</h1>
      <form id="loginForm">
        <h2>Get a new account!</h2>
        <label>Your name (You can change it later):</label>
        <input type='text' name="username" /><br/>

        <label htmlFor="password">Password:</label>
        <input type='password' name="password" /><br/>

        <label htmlFor="passwordConfirm">Type it again:</label>
        <input type='password' name="passwordConfirm" /><br/>

        <label htmlFor="licenseKey">License key (find it in your email?):</label>
        <input type='text' name='licenseKey' /><hr/>

        <input type='submit' value="Get account" />
      </form>
      <Link to="/">Go back</Link><br/>
    </>
  );
};

export default Signup;
