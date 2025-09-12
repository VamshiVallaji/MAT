import React from 'react';
import { useNavigate } from 'react-router-dom';

const AssessmentOptionsPage = () => {
  const navigate = useNavigate();

  const handleAssessmentTypeClick = async (type) => {
    console.log(`Selected Assessment Type: ${type}`);
    const userEmail = sessionStorage.getItem('userEmail');
    if (!userEmail) {
      alert('User not logged in. Please log in again.');
      navigate('/login');
      return;
    }

    try {
      const response = await fetch('http://localhost:3001/users/assessments', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: userEmail,
          type: type,
          reportName: `${type} Assessment - ${new Date().toLocaleString()}`,
          status: 'Initiated',
          date: new Date().toISOString().split('T')[0], // YYYY-MM-DD
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        alert(`Failed to initiate assessment: ${errorData.message || 'Unknown error'}`);
        return;
      }

      // Navigate after successful initiation
      if (type === 'Share Point online') {
        navigate('/assessment-details/sharepoint-online');
      } else if (type === 'Identity online (Entra)') {
        navigate('/assessment-details/identity-online');
      } else if (type === 'Exchange online') {
        navigate('/assessment-details/exchange-online');
      } else if (type === 'OneDrive for Business') {
        navigate('/assessment-details/onedrive-for-business');
      } else if (type === 'Teams & Enterprise Voice') {
        navigate('/assessment-details/teams-enterprise-voice');
      } else if (type === 'Cloud file shares') {
        navigate('/assessment-details/cloud-file-shares');
      } else {
        // Handle unknown assessment type or do nothing
      }
    } catch (error) {
      console.error('Error initiating assessment:', error);
      alert('An error occurred while initiating the assessment.');
    }
  };

  return (
    <div className="container mt-5" style={{ minHeight: '100vh', overflowY: 'auto' }}>
      <h2 className="text-center" style={{ color: '#003366' }}>Select M365 Technology</h2>
      <div className="d-grid gap-3 col-md-8 mx-auto mt-4">
        <button className="btn btn-primary btn-lg" onClick={() => handleAssessmentTypeClick('Identity online (Entra)')}>Identity online (Entra)</button>
        <button className="btn btn-primary btn-lg" onClick={() => handleAssessmentTypeClick('Exchange online')}>Exchange online</button>
        <button className="btn btn-primary btn-lg" onClick={() => handleAssessmentTypeClick('Share Point online')}>Share Point online</button>
        <button className="btn btn-primary btn-lg" onClick={() => handleAssessmentTypeClick('OneDrive for Business')}>OneDrive for Business</button>
        <button className="btn btn-primary btn-lg" onClick={() => handleAssessmentTypeClick('Teams & Enterprise Voice')}>Teams & Enterprise Voice</button>
        <button className="btn btn-primary btn-lg" onClick={() => handleAssessmentTypeClick('Cloud file shares')}>Cloud file shares</button>
      </div>
      <div className="text-center mt-4">
        <button className="btn btn-secondary" onClick={() => navigate('/assessment-operations-selection')}>Back to Selection</button>
      </div>
    </div>
  );
};

export default AssessmentOptionsPage;
