import TopBar from '@/components/TopBar';
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { license } from '@/utils/auth';

const License: React.FC = () => {
  const [licenseKey, setLicenseKey] = useState('');
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setLicenseKey(e.target.value);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setMessage('');

    try {
      await license({ licenseKey });
      setMessage('License verification successful! Redirecting...');
      setTimeout(() => {
        navigate('/menu');
      }, 2000); // Delay redirection for user to see the message
    } catch (err: any) {
      setError(err.message || 'License verification failed due to invalid license key. Please try again.');
    }
  };

  return (
    <>
      <TopBar />
      <h1>License Verification</h1>
      {error && <div className="error">{error}</div>}
      {message && <div className="success">{message}</div>}
      <form id="licenseForm" onSubmit={handleSubmit}>
        <h2>Enter your license key</h2>
        <label>License Key:</label>
        <input
          type='text'
          name="licenseKey"
          value={licenseKey}
          onChange={handleChange}
          required
        /><br/>

        <input type='submit' value="Verify License" />
      </form>
    </>
  );
};

export default License;