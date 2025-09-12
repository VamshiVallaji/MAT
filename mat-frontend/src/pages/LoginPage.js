
import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import Modal from '../components/Modal';

const LoginPage = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await fetch('http://localhost:3001/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password }),
      });

      const data = await response.json();

      if (response.ok) {
        // Store user email to identify them in subsequent requests
        sessionStorage.setItem('userEmail', data.email);
        navigate('/dashboard'); // Always navigate to dashboard after login
      } else {
        alert(data.message || 'Login failed.');
      }
    } catch (error) {
      console.error('Login error:', error);
      alert(error.message || 'An error occurred during login.');
    }
  };

  const handleModalClose = () => {
    setShowModal(false);
  };

  const handleOldConfig = () => {
    navigate('/environment-selection');
  };

  const handleNewConfig = () => {
    navigate('/configure');
  };

  return (
    <div className="container d-flex flex-column justify-content-center align-items-center vh-100">
      <div className="card p-4 shadow-sm" style={{ width: '100%', maxWidth: '400px' }}>
        <h1 className="mb-4 text-center">Login</h1>
        <form onSubmit={handleSubmit}>
          <div className="mb-3">
            <label htmlFor="email" className="form-label">Email address</label>
            <input
              type="email"
              className="form-control"
              id="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              placeholder="Enter your email"
            />
          </div>
          <div className="mb-3">
            <label htmlFor="password" className="form-label">Password</label>
            <input
              type={showPassword ? 'text' : 'password'}
              className="form-control"
              id="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              placeholder="Enter your password"
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
          <button type="submit" className="btn btn-primary w-100">Login</button>
        </form>
      </div>
      <Modal show={showModal} title="Configuration" onClose={handleModalClose}>
        <p>Would you like to use old configuration or a new configuration?</p>
        <div className="d-flex justify-content-around">
          <button className="btn btn-primary" onClick={handleOldConfig}>Old Configuration</button>
          <button className="btn btn-secondary" onClick={handleNewConfig}>New Configuration</button>
        </div>
      </Modal>
    </div>
  );
};

export default LoginPage;
