import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

const CloudLoginPage = () => {
  const [clientId, setClientId] = useState('');
  const [clientSecret, setClientSecret] = useState('');
  const [showSecret, setShowSecret] = useState(false);
  const navigate = useNavigate();

  const handleCloudLogin = async (e) => {
    e.preventDefault();
    const userEmail = sessionStorage.getItem('userEmail'); // Get user email from session storage
    if (!userEmail) {
      alert('User not logged in. Please log in again.');
      navigate('/login');
      return;
    }

    try {
      const response = await fetch('http://localhost:3001/users/client-credentials', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email: userEmail, clientId, clientSecret }),
      });

      const data = await response.json();

      if (response.ok) {
        navigate('/assessment-options');
      } else {
        alert(data.message || 'Failed to save credentials.');
      }
    } catch (error) {
      console.error('Credential submission error:', error);
      alert('An error occurred while saving credentials.');
    }
  };

  return (
    <div className="container mt-5">
      <h2 className="text-center" style={{ color: '#003366' }}>Microsoft 365 Login</h2>
      <div className="card mx-auto" style={{ maxWidth: '500px' }}>
        <div className="card-body">
          <form onSubmit={handleCloudLogin}>
            <div className="mb-3">
              <label htmlFor="clientId" className="form-label">Client ID</label>
              <input
                type="text"
                className="form-control"
                id="clientId"
                required
                placeholder="Enter your Client ID"
                value={clientId}
                onChange={(e) => setClientId(e.target.value)}
              />
            </div>
            <div className="mb-3">
              <label htmlFor="clientSecret" className="form-label">Client Secret</label>
              <input
                type={showSecret ? 'text' : 'password'}
                className="form-control"
                id="clientSecret"
                required
                placeholder="Enter your Client Secret"
                value={clientSecret}
                onChange={(e) => setClientSecret(e.target.value)}
              />
            </div>
            <div className="mb-3 form-check">
              <input
                type="checkbox"
                className="form-check-input"
                id="showSecret"
                checked={showSecret}
                onChange={() => setShowSecret(!showSecret)}
              />
              <label className="form-check-label" htmlFor="showSecret">Show Secret</label>
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

export default CloudLoginPage;
