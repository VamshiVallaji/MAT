
import React from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';

const Navbar = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const userEmail = sessionStorage.getItem('userEmail'); // Get user email

  const handleLogout = () => {
    sessionStorage.removeItem('userEmail'); // Clear user email on logout
    console.log('Logging out...');
    navigate('/login');
  };

  // Determine where the Home link should go
  const homeLinkPath = userEmail ? '/dashboard' : '/';

  return (
    <nav className="navbar navbar-expand-lg navbar-light bg-cognizant-blue">
      <div className="container-fluid d-flex justify-content-between align-items-center">
        <Link className="navbar-brand" to="/dashboard">
          <img src="/lo.jpg" alt="Logo" style={{ height: '40px', marginRight: '10px' }} />
        </Link>
        <span className="navbar-text mx-auto" style={{ fontSize: '1.5rem', fontWeight: 'bold', color: 'white' }}>
          Migration Acceleration Toolkit
        </span>
        <button className="navbar-toggler" type="button" data-bs-toggle="collapse" data-bs-target="#navbarNav" aria-controls="navbarNav" aria-expanded="false" aria-label="Toggle navigation">
          <span className="navbar-toggler-icon"></span>
        </button>
        <div className="collapse navbar-collapse" id="navbarNav">
          <ul className="navbar-nav ms-auto">
            <li className="nav-item">
              <Link className="nav-link" to={homeLinkPath}>Home</Link>
            </li>
            <li className="nav-item">
              <Link className="nav-link" to="/help">Get help</Link>
            </li>
            <li className="nav-item">
              <Link className="nav-link" to="/feedback">Feedback</Link>
            </li>
            <li className="nav-item">
              <button className="btn btn-link nav-link" onClick={handleLogout}>Logout</button>
            </li>
          </ul>
        </div>
      </div>
    </nav>
  );
};


export default Navbar;
