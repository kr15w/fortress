import React, { useState } from 'react';
import axios from 'axios';

const ChangePassword: React.FC = () => {
  const [email, setEmail] = useState('');
  const [verificationCode, setVerificationCode] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [step, setStep] = useState(1);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  const handleSendEmail = async () => {
    try {
      await axios.post('http://localhost:5000/api/auth/send-reset-code', { email });
      setStep(2);
      setMessage('Verification code sent to your email.');
      setError(''); // Clear error when setting message
    } catch (err: any) {
      setError(err.response?.data?.error || 'Failed to send email.');
      setMessage(''); // Clear message when setting error
    }
  };

  const handleChangePassword = async () => {
    try {
      await axios.post('http://localhost:5000/api/auth/change-password', {
        email,
        code: verificationCode,
        newPassword
      });
      setMessage('Password changed successfully.');
      setError(''); // Clear error when setting message
    } catch (err: any) {
      setError(err.response?.data?.error || 'Failed to change password.');
      setMessage(''); // Clear message when setting error
    }
  };

  return (
    <div>
      <h1>Change Password</h1>
      {error && <div className="error">{error}</div>}
      {message && <div className="success">{message}</div>}
      {step === 1 && (
        <div>
          <input
            type="email"
            placeholder="Enter your email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
          <button onClick={handleSendEmail}>Send Verification Code</button>
        </div>
      )}
      {step === 2 && (
        <div>
          <input
            type="text"
            placeholder="Enter verification code"
            value={verificationCode}
            onChange={(e) => setVerificationCode(e.target.value)}
            required
          />
          <input
            type="password"
            placeholder="Enter new password"
            value={newPassword}
            onChange={(e) => setNewPassword(e.target.value)}
            required
          />
          <button onClick={handleChangePassword}>Change Password</button>
        </div>
      )}
    </div>
  );
};

export default ChangePassword;