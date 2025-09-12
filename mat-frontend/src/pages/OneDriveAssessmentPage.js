import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

const oneDriveAssessmentReports = [
  'Detailed Onedrive Usage report',
  'Unlicensed Onedrive user report',
  'Onedrive Configuration report',
];

const OneDriveAssessmentPage = () => {
  const navigate = useNavigate();
  const [selectedOptions, setSelectedOptions] = useState([]);
  const [tenantConfig, setTenantConfig] = useState(null);
  const userEmail = sessionStorage.getItem('userEmail');

  useEffect(() => {
    if (userEmail) {
      const fetchTenantConfig = async () => {
        try {
          const response = await fetch(`http://127.0.0.1:3001/users/tenants/${userEmail}`);
          if (response.ok) {
            const data = await response.json();
            if (data.tenants && data.tenants.length > 0) {
              setTenantConfig(data.tenants[0]); // Assuming one tenant config per user
            } else {
              alert('Configuration not found. Please configure your tenant and storage details first.');
              navigate('/configuration');
            }
          } else {
            alert('Failed to load configuration.');
            navigate('/configuration');
          }
        } catch (error) {
          console.error('Error fetching configuration:', error);
          alert('An error occurred while loading configuration.');
          navigate('/configuration');
        }
      };
      fetchTenantConfig();
    }
  }, [userEmail, navigate]);


  const handleCheckboxChange = (option) => {
    setSelectedOptions((prevSelected) =>
      prevSelected.includes(option)
        ? prevSelected.filter((item) => item !== option)
        : [...prevSelected, option]
    );
  };

  const handleSelectAll = () => {
    const allOptions = [...oneDriveAssessmentReports];
    setSelectedOptions(allOptions);
  };

  const handleClear = () => {
    setSelectedOptions([]);
  };

  const handleExecute = async () => {
    if (!userEmail) {
      alert('User not logged in. Please log in again.');
      navigate('/login');
      return;
    }

    if (selectedOptions.length === 0) {
      alert('Please select at least one report.');
      return;
    }

    if (!tenantConfig) {
      alert('Tenant configuration is not loaded yet. Please wait or re-configure.');
      return;
    }

    const initiatedJobs = [];
    const assessmentType = 'OneDrive for Business';
    // As discussed, using a fixed container name. This can be made configurable later.
    const containerName = 'onedrivereports';
    const storageAccountName = tenantConfig.azureFileStorage;

    for (const reportName of selectedOptions) {
      try {
        const response = await fetch('http://127.0.0.1:3001/api/execute-report', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            TenantId: tenantConfig.tenantId,
            ClientId: tenantConfig.clientId,
            // NOTE: The backend expects CertificateName. We are using certificateThumbprint from config.
            // Ensure your PowerShell runbook uses the certificate thumbprint.
            CertificateName: tenantConfig.certificateThumbprint,
            StorageAccountName: storageAccountName,
            StorageAccountKey: tenantConfig.storageAccountKey,
            ContainerName: containerName,
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
      const reportNames = initiatedJobs.map(job => encodeURIComponent(job.reportName)).join(',');
      const assessmentTypes = initiatedJobs.map(job => encodeURIComponent(job.assessmentType)).join(',');
      const storageParam = encodeURIComponent(storageAccountName);
      const containerParam = encodeURIComponent(containerName);

      navigate(`/dashboard?jobIds=${jobIds}&reportNames=${reportNames}&assessmentTypes=${assessmentTypes}&storageAccountName=${storageParam}&containerName=${containerParam}`);
    } else {
      alert('No reports were successfully initiated.');
    }
  };

  return (
    <div className="container mt-5 pb-5">
      <div className="text-start mb-4">
        <button className="btn btn-info btn-lg" onClick={() => navigate('/assessment-options')}>Back to Assessment Options</button>
      </div>
      <h2 className="text-center" style={{ color: '#003366' }}>You have Selected Assessment for OneDrive for Business</h2>

      <div className="card mx-auto mt-4" style={{ maxWidth: '800px' }}>
        <div className="card-body" style={{ maxHeight: '400px', overflowY: 'auto' }}>
          <h4 className="card-title">Select Assessment Reports:</h4>

          <div className="mb-3">
            <label className="form-label">OneDrive Assessment Reports</label>
            {oneDriveAssessmentReports.map((option) => (
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

export default OneDriveAssessmentPage;
