import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

const teamsAndEnterpriseVoiceReports = [
  'Teams users List',
  'Teams Enterprise Voice users List',
  'Unassigned Numbers',
  'List of Teams',
  'Teams Data size and Storage Reports',
  'Teams Owners list',
  'Ownerless Teams',
  'Teams Members list',
  'Auto Attendants',
  'Call Queues',
  'Resource Accounts',
  'App Permission Policies',
  'Teams Policies',
  'Meeting Policies',
  'Calling Policies',
  'Call Hold Policies',
  'Call Park Policies',
  'Caller ID Policies',
  'Emergency Policies',
  'Voice Routing Policies',
  'Voicemail policies',
  'Dial Plans',
  'Voice Routes',
  'Online Voice gateways',
  'Network Regions',
  'Network Locations',
  'Trusted IP Addressess',
  'Teams Devices',
];

const TeamsAssessmentPage = () => {
  const navigate = useNavigate();
  const [selectedOptions, setSelectedOptions] = useState([]);

  const handleCheckboxChange = (option) => {
    setSelectedOptions((prevSelected) =>
      prevSelected.includes(option)
        ? prevSelected.filter((item) => item !== option)
        : [...prevSelected, option]
    );
  };

  const handleSelectAll = () => {
    const allOptions = [...teamsAndEnterpriseVoiceReports];
    setSelectedOptions(allOptions);
  };

  const handleClear = () => {
    setSelectedOptions([]);
  };

  const handleExecute = async () => {
    const userEmail = sessionStorage.getItem('userEmail');
    if (!userEmail) {
      alert('User not logged in. Please log in again.');
      navigate('/login');
      return;
    }

    if (selectedOptions.length === 0) {
      alert('Please select at least one report.');
      return;
    }

    const initiatedJobs = [];
    const assessmentType = 'Teams & Enterprise Voice';

    for (const reportName of selectedOptions) {
      try {
        const response = await fetch('http://localhost:3001/api/execute-report', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            email: userEmail,
            assessmentType,
            reportName,
          }),
        });

        if (response.ok) {
          const data = await response.json();
          initiatedJobs.push({
            jobId: data.jobId,
            reportName: reportName,
            assessmentType: assessmentType,
          });
        } else {
          const errorData = await response.json();
          console.error(`Failed to initiate report ${reportName}: ${errorData.message || 'Unknown error'}`);
          alert(`Failed to initiate report ${reportName}: ${errorData.message || 'Unknown error'}`);
        }
      } catch (error) {
        console.error(`Error initiating report ${reportName}:`, error);
        alert(`An error occurred while initiating report ${reportName}.`);
      }
    }

    if (initiatedJobs.length > 0) {
      const jobIds = initiatedJobs.map(job => job.jobId).join(',');
      const reportNames = initiatedJobs.map(job => job.reportName).join(',');
      const assessmentTypes = initiatedJobs.map(job => job.assessmentType).join(',');

      navigate(`/dashboard?jobIds=${jobIds}&reportNames=${reportNames}&assessmentTypes=${assessmentTypes}`);
    } else {
      alert('No reports were successfully initiated.');
    }
  };

  return (
    <div className="container mt-5 pb-5">
      <div className="text-start mb-4">
        <button className="btn btn-info btn-lg" onClick={() => navigate('/assessment-options')}>Back to Assessment Options</button>
      </div>
      <h2 className="text-center" style={{ color: '#003366' }}>You have Selected Assessment for Teams & Enterprise Voice</h2>

      <div className="card mx-auto mt-4" style={{ maxWidth: '800px' }}>
        <div className="card-body" style={{ maxHeight: '400px', overflowY: 'auto' }}>
          <h4 className="card-title">Select Assessment Reports:</h4>

          <div className="mb-3">
            <label className="form-label">Teams & Enterprise Voice Assessment Reports</label>
            {teamsAndEnterpriseVoiceReports.map((option) => (
              <div className="form-check" key={option}>
                <input
                  className="form-check-input"
                  type="checkbox"
                  value={option}
                  id={option.replace(/\s/g, '')}
                  checked={selectedOptions.includes(option)}
                  onChange={() => handleCheckboxChange(option)}
                />
                <label className="form-check-label" htmlFor={option.replace(/\s/g, '')}>
                  {option}
                </label>
              </div>
            ))}
          </div>

          <div className="d-flex justify-content-between mt-4">
            <button className="btn btn-outline-primary" onClick={handleSelectAll}>Select All</button>
            <button className="btn btn-outline-warning" onClick={handleClear}>Clear</button>
            <button className="btn btn-success" onClick={handleExecute}>Execute</button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TeamsAssessmentPage;
