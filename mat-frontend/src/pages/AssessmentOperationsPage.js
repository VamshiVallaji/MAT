import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

const AssessmentOperationsPage = () => {
  const navigate = useNavigate();
  const [selectedOption, setSelectedOption] = useState('');

  const handleOptionChange = (e) => {
    const value = e.target.value;
    setSelectedOption(value);
    if (value === 'assessment') {
      navigate('/assessment-types'); // Navigate to a page listing assessment types
    } else if (value === 'operations') {
      // Handle navigation for operations, or show operations content
      console.log('Operations selected');
    }
  };

  return (
    <div className="container mt-5 d-flex flex-column align-items-center">
      <h1 className="mb-4" style={{ color: '#003366' }}>Assessment and Operations</h1>
      <div className="card" style={{ width: '30rem' }}>
        <div className="card-body">
          <p className="card-text">Please select an option:</p>
          <select className="form-select" value={selectedOption} onChange={handleOptionChange}>
            <option value="">Select...</option>
            <option value="assessment">Assessment</option>
            <option value="operations">Operations</option>
          </select>
        </div>
      </div>
      <button className="btn btn-secondary mt-3" onClick={() => navigate('/selection')}>Back</button>
    </div>
  );
};

export default AssessmentOperationsPage;
