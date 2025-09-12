import React from 'react';
import { useNavigate } from 'react-router-dom';

const AssessmentTypesPage = () => {
  const navigate = useNavigate();

  const assessmentTypes = [
    { name: 'Identity online (Entra)', path: 'identity-online' },
    { name: 'Exchange online', path: 'exchange-online' },
    { name: 'SharePoint online', path: 'sharepoint-online' },
    { name: 'OneDrive for Business', path: 'onedrive-for-business' },
    { name: 'Teams & Enterprise Voice', path: 'teams-enterprise-voice' },
    { name: 'Cloud file shares', path: 'cloud-file-shares' },
  ];

  return (
    <div className="container mt-5 d-flex flex-column align-items-center">
      <h1 className="mb-4" style={{ color: '#003366' }}>Select Assessment Type</h1>
      <div className="card" style={{ width: '35rem' }}>
        <div className="card-body">
          <ul className="list-group">
            {assessmentTypes.map((type) => (
              <li key={type.path} className="list-group-item list-group-item-action" onClick={() => navigate(`/assessment-details/${type.path}`)}>
                {type.name}
              </li>
            ))}
          </ul>
        </div>
      </div>
      <button className="btn btn-secondary mt-3" onClick={() => navigate('/assessment-operations')}>Back</button>
    </div>
  );
};

export default AssessmentTypesPage;
