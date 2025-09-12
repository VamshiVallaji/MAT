import React from 'react';
import { useNavigate } from 'react-router-dom';

const EnvironmentSelectionPage = () => {
  const navigate = useNavigate();

  return (
    <div className="container mt-5">
      <h2 className="text-center" style={{ color: '#003366' }}>Select Your Environment</h2>
      <div className="d-grid gap-3 col-md-8 mx-auto mt-4">
        <button
          className="btn btn-primary btn-lg"
          onClick={() => navigate('/assessment-operations-selection')}
        >
          Collaborate on Cloud
        </button>
        <button
          className="btn btn-primary btn-lg"
          onClick={() => navigate('/on-prem-login')}
        >
          Collaborate On-Premises
        </button>
      </div>
    </div>
  );
};

export default EnvironmentSelectionPage;
