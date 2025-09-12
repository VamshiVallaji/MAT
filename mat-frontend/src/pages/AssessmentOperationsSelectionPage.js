import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

const AssessmentOperationsSelectionPage = () => {
  const [selectionType, setSelectionType] = useState(''); // 'assessment' or 'operations'
  const navigate = useNavigate();

  const handleProceed = () => {
    if (selectionType === 'assessment') {
      navigate('/assessment-options');
    } else if (selectionType === 'operations') {
      // For operations, we can either show the cloud/on-prem buttons here
      // or navigate to a dedicated operations selection page.
      // For now, let's assume the user will then click the cloud/on-prem buttons.
      // No direct navigation here, just reveal the buttons.
    }
  };

  return (
    <div className="container mt-5">
      <h1 className="mb-4">Select your path: Assessment or Operations</h1>
      <div className="row justify-content-center mb-4">
        <div className="col-md-6">
          <select
            className="form-select form-select-lg mb-3"
            aria-label="Select assessment or operations"
            value={selectionType}
            onChange={(e) => setSelectionType(e.target.value)}
          >
            <option value="">Select...</option>
            <option value="assessment">Assessment</option>
            <option value="operations">Operations</option>
          </select>
        </div>
      </div>

      {selectionType === 'assessment' && (
        <div className="d-grid gap-2 col-6 mx-auto">
          <button className="btn btn-primary" onClick={handleProceed}>Proceed to Assessment Options</button>
        </div>
      )}

      
    </div>
  );
};

export default AssessmentOperationsSelectionPage;
