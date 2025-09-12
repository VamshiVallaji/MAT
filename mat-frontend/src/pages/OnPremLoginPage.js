import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

const OnPremLoginPage = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const navigate = useNavigate();

  const handleOnPremLogin = async (e) => {
    e.preventDefault();
    const userEmail = sessionStorage.getItem('userEmail'); // Get user email from session storage
    if (!userEmail) {
      alert('User not logged in. Please log in again.');
      navigate('/login');
      return;
    }

    try {
      const response = await fetch('http://localhost:3001/users/on-prem-credentials', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email: userEmail, username, password }),
      });

      const data = await response.json();

      if (response.ok) {
        alert('On-Prem credentials saved successfully!');
        // After successful login, navigate to dashboard or appropriate page
        navigate('/assessment-options');
      } else {
        alert(data.message || 'Failed to save On-Prem credentials.');
      }
    } catch (error) {
      console.error('On-Prem credential submission error:', error);
      alert('An error occurred while saving On-Prem credentials.');
    }
  };

  return (
    <div className="container mt-5">
      <h2 className="text-center" style={{ color: '#003366' }}>On-Premises Login</h2>
      <div className="card mx-auto" style={{ maxWidth: '500px' }}>
        <div className="card-body">
          <form onSubmit={handleOnPremLogin}>
            <div className="mb-3">
              <label htmlFor="account" className="form-label">Account</label>
              <input
                type="text"
                className="form-control"
                id="account"
                required
                placeholder="Enter your account name"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
              />
            </div>
            <div className="mb-3">
              <label htmlFor="password" className="form-label">Password</label>
              <input
                type={showPassword ? 'text' : 'password'}
                className="form-control"
                id="password"
                required
                placeholder="Enter your password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </div>
            <div className="mb-3 form-check">
              <input
                type="checkbox"
                className="form-check-input"
                id="showPassword"
                checked={showPassword}
                onChange={() => setShowPassword(!showPassword)}
              />
              <label className="form-check-label" htmlFor="showPassword">Show Password</label>
            </div>
            <div className="d-grid gap-2">
              <button type="submit" className="btn btn-primary">Proceed</button>
              <button type="button" className="btn btn-secondary" onClick={() => navigate('/environment-selection')}>Back</button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default OnPremLoginPage;
