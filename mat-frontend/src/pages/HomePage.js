
import React from 'react';
import { Link } from 'react-router-dom';

const HomePage = () => {
  return (
    <div className="container text-center vh-100 d-flex flex-column justify-content-center">
      <div className="p-5 mb-4 bg-white rounded-3 shadow-sm">
        <h1 className="display-4 fw-bold" style={{ color: '#003366' }}>Migration Acceleration Toolkit</h1>
        <p className="fs-4" style={{ color: '#003366' }}>Your one-stop solution for seamless cloud migration.</p>
      </div>
      <div className="d-grid gap-2 d-sm-flex justify-content-sm-center">
        <Link to="/register" className="btn btn-primary btn-lg px-4 gap-3">New User</Link>
        <Link to="/login" className="btn btn-outline-secondary btn-lg px-4">Existing User</Link>
      </div>
    </div>
  );
};

export default HomePage;
