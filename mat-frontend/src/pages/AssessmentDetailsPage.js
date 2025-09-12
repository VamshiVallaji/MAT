import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';

const AssessmentDetailsPage = () => {
  const [assessment, setAssessment] = useState(null);
  const [loading, setLoading] = useState(true);
  const location = useLocation();
  const navigate = useNavigate();
  const userEmail = sessionStorage.getItem('userEmail');

  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const id = params.get('id');

    if (!userEmail || !id) {
      navigate('/login');
      return;
    }

    const fetchAssessment = async () => {
      try {
        const response = await fetch(`http://localhost:3001/users/assessments/${userEmail}/${id}`);
        if (response.ok) {
          const data = await response.json();
          setAssessment(data.assessment);
        } else {
          console.error('Failed to fetch assessment:', response.statusText);
          alert('Failed to load assessment details.');
        }
      } catch (error) {
        console.error('Error fetching assessment:', error);
        alert('An error occurred while loading assessment details.');
      } finally {
        setLoading(false);
      }
    };

    fetchAssessment();
  }, [userEmail, location, navigate]);

  if (loading) {
    return <div className="container mt-5 text-center">Loading assessment details...</div>;
  }

  if (!assessment) {
    return <div className="container mt-5 text-center">Assessment not found.</div>;
  }

  return (
    <div className="container mt-5">
      <h1 className="mb-4">Assessment Details</h1>
      <div className="card">
        <div className="card-header">
          <h5 className="card-title">{assessment.reportName}</h5>
        </div>
        <div className="card-body">
          <p><strong>Type:</strong> {assessment.type}</p>
          <p><strong>Status:</strong> {assessment.status}</p>
          <p><strong>Date:</strong> {assessment.date}</p>
        </div>
      </div>
      <button className="btn btn-primary mt-3" onClick={() => navigate('/dashboard')}>Back to Dashboard</button>
    </div>
  );
};

export default AssessmentDetailsPage;