import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';

const allAssessmentReports = {
  'Identity online (Entra)': [
    'Users Report',
    'Security Groups Report',
    'M365 Groups Report',
    'Devices Report',
    'Contact Report',
    'Azure AD Connect Configuration Report',
    'Enterprise Apps Report',
    'MFA Report',
    'Conditional Access Policies Report',
    'Password Expiration Policy Report',
    'App Registration Expiration Policy Report',
  ],
  'Exchange online': [
    'Exchange Org Structure',
    'M365 Groups',
    'Journaling Rules',
    'SPF, DKIM, DMARC',
    'No. of Users',
    'Total mailbox count',
    'Type of mailboxes',
    'Public folder details',
    'Public folder mailboxes',
    'Mailbox permissions',
    'Mailbox delegation',
    'Litigation / Compliance hold',
    'Mailbox size',
    'Archive mailbox usage',
    'Distribution Groups and membership',
    'Mail Enabled Security group',
    'Email delivery restrictions for groups and mailboxes',
    'Group delegations',
    'Group moderation settings',
    'Mail Contacts',
    'Meeting room list',
    'Meeting room configurations',
    'Resource mailbox booking / calendar processing configuration',
    'SMTP addresses',
    'Email Forwarding (internal/external)',
    'Mailbox Auto reply',
    'Mail tips assigned to mailboxes',
    'Mailboxes hidden from GAL',
    'Mailbox rules',
    'Transport rules',
  ],
  'Share Point online': [
    'Site Collections Usage Report',
    'Site collections Ownership Report',
    'Checked out documents report',
    'WSP/App Catalog report',
    'Sharepoint Site User/Group high level Permission report',
    'Managed Metadata Termstore Report',
    'Content Search Query rules',
    'Custom Solution Report',
    'Custom Features Report',
    'Custom Event Receiver Information Report',
    'Lists with workflows',
    'Checked Out Files Report',
    'List Views Approaching Recommended Thresholds Report',
    'Lists without a major version limit',
    'Lookup Column Information Report',
    'Custom Master Pages and Page Layouts Report',
    'Custom Web Part Pages Report',
    'Deprecated Site Template Report',
    'Orphaned Users (disabled in Active Directory)',
    'Documents/list items with custom permissions',
    'Sites unchanged in the last 6 months',
    'Site Collections enabled with Site Collection App Catalog',
    'Site Collections with custom SPFx Apps',
    'Forms Report',
    'Tenant level PowerAutomate Flows Report',
    'Tenant level PowerApps Report',
    'Office 365 Groups usage and Expiration report',
    'Teams usage report',
    'SPO Tenant Config Data',
  ],
  'OneDrive for Business': [
    'Detailed Onedrive Usage report',
    'Unlicensed Onedrive user report',
    'Onedrive Configuration report',
  ],
  'Teams & Enterprise Voice': [
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
  ],
  'Cloud file shares': [
    'File Share Permissions Report',
    'File Share Size Report',
    'File Share Age Report',
    'Duplicate File Report',
  ],
};

const AssessmentOperationsDashboard = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const userEmail = sessionStorage.getItem('userEmail');
  const [assessments, setAssessments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedAssessment, setSelectedAssessment] = useState(null);
  const [reportJobs, setReportJobs] = useState([]);
  const [downloadUrls, setDownloadUrls] = useState({});

  useEffect(() => {
    if (!userEmail) {
      navigate('/login');
      return;
    }

    const queryParams = new URLSearchParams(location.search);
    const jobIdsParam = queryParams.get('jobIds');
    const reportNamesParam = queryParams.get('reportNames');
    const assessmentTypesParam = queryParams.get('assessmentTypes');
    const storageAccountNameParam = queryParams.get('storageAccountName');
    const containerNameParam = queryParams.get('containerName');

    if (jobIdsParam && reportNamesParam && assessmentTypesParam) {
      const jobIds = jobIdsParam.split(',');
      const reportNames = reportNamesParam.split(',');
      const assessmentTypes = assessmentTypesParam.split(',');

      const newJobs = [];
      for (let i = 0; i < jobIds.length; i++) {
        const jobId = jobIds[i];
        const reportName = decodeURIComponent(reportNames[i]);
        const assessmentType = decodeURIComponent(assessmentTypes[i]);

        newJobs.push({
          jobId,
          reportName,
          assessmentType,
          status: 'In Progress',
          date: new Date().toLocaleString(),
          output: null,
          storageAccountName: storageAccountNameParam,
          containerName: containerNameParam,
        });
      }

      setReportJobs((prevJobs) => {
        const uniqueNewJobs = newJobs.filter(
          (newJob) => !prevJobs.some((prevJob) => prevJob.jobId === newJob.jobId)
        );
        return [...prevJobs, ...uniqueNewJobs];
      });

      if (assessmentTypes.length > 0) {
        setSelectedAssessment(decodeURIComponent(assessmentTypes[0]));
      }
    }

    const fetchAssessments = async () => {
      try {
        const response = await fetch(`http://127.0.0.1:3001/users/assessments/${userEmail}`);
        if (response.ok) {
          const data = await response.json();
          setAssessments(data.assessments || []);
        } else {
          console.error('Failed to fetch assessments:', response.statusText);
          alert('Failed to load assessments.');
        }
      } catch (error) {
        console.error('Error fetching assessments:', error);
        alert('An error occurred while loading assessments.');
      } finally {
        setLoading(false);
      }
    };

    fetchAssessments();
  }, [userEmail, navigate, location.search]);

  useEffect(() => {
    const intervals = {};

    reportJobs.forEach((job) => {
      if (job.status === 'In Progress') {
        intervals[job.jobId] = setInterval(async () => {
          try {
            // Test call to new /test route
            try {
              const testResponse = await fetch('http://127.0.0.1:3001/test');
              const testData = await testResponse.json();
              console.log('TEST /test route response:', testData);
            } catch (testError) {
              console.error('TEST /test route error:', testError);
            }

            const response = await fetch(`http://127.0.0.1:3001/api/report-status/${job.jobId}`);
            if (response.ok) {
              const data = await response.json();
              const updatedJob = { ...job, status: data.status, output: data.output || job.output };

              setReportJobs((prevJobs) =>
                prevJobs.map((prevJob) =>
                  prevJob.jobId === job.jobId ? updatedJob : prevJob
                )
              );

              if (data.status === 'Completed' && updatedJob.output) {
                try {
                  const linkResponse = await fetch('http://127.0.0.1:3001/api/get-download-link', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                      storageAccountName: updatedJob.storageAccountName,
                      containerName: updatedJob.containerName,
                      blobName: updatedJob.output,
                    }),
                  });
                  if (linkResponse.ok) {
                    const { downloadUrl } = await linkResponse.json();
                    setDownloadUrls((prev) => ({ ...prev, [job.jobId]: downloadUrl }));
                  } else {
                    console.error('Failed to get download link');
                  }
                } catch (linkError) {
                  console.error('Error getting download link:', linkError);
                }
              }

              if (data.status !== 'In Progress') {
                clearInterval(intervals[job.jobId]);
              }
            } else {
              console.error(`Failed to fetch status for job ${job.jobId}:`, response.statusText);
              setReportJobs((prevJobs) =>
                prevJobs.map((prevJob) =>
                  prevJob.jobId === job.jobId ? { ...prevJob, status: 'Failed' } : prevJob
                )
              );
              clearInterval(intervals[job.jobId]);
            }
          } catch (error) {
            console.error(`Error polling for job ${job.jobId}:`, error);
            setReportJobs((prevJobs) =>
              prevJobs.map((prevJob) =>
                prevJob.jobId === job.jobId ? { ...prevJob, status: 'Failed' } : prevJob
              )
            );
            clearInterval(intervals[job.jobId]);
          }
        }, 3000);
      }
    });

    return () => {
      Object.values(intervals).forEach(clearInterval);
    };
  }, [reportJobs]);

  const getReportStatus = (assessmentType, reportName) => {
    const activeJob = reportJobs.find(
      (job) => job.assessmentType === assessmentType && job.reportName === reportName
    );

    if (activeJob) {
      return {
        jobId: activeJob.jobId,
        status: activeJob.status,
        date: activeJob.date,
        output: activeJob.output,
      };
    }

    const reports = assessments
      .filter(
        (assessment) =>
          assessment.type === assessmentType && assessment.reportName === reportName
      )
      .sort((a, b) => new Date(b.date) - new Date(a.date));

    if (reports.length > 0) {
      const latestReport = reports[0];
      return {
        status: latestReport.status,
        date: new Date(latestReport.date).toLocaleString(),
        output: null,
      };
    }

    return {
      status: 'Not Initiated',
      date: '-',
      output: null,
    };
  };

  const getStatusBadgeClass = (status) => {
    switch (status) {
      case 'Initiated':
      case 'In Progress':
        return 'bg-warning text-dark';
      case 'Completed':
        return 'bg-success';
      case 'Failed':
        return 'bg-danger';
      case 'Selected':
        return 'bg-info text-dark';
      default:
        return 'bg-secondary';
    }
  };

  if (loading) {
    return <div className="container mt-5 text-center">Loading assessments...</div>;
  }

  const userName = userEmail ? userEmail.split('@')[0] : 'Guest';

  return (
    <div className="container-fluid p-4" style={{ minHeight: '100vh', overflowY: 'auto' }}>
            <div className="d-flex justify-content-between align-items-center mb-3">
        <h1 className="h3 m-0">Assessment Operations Dashboard</h1>
        <button className="btn btn-primary" onClick={() => navigate('/configuration')}>
          Go to Configuration
        </button>
      </div>
      <h2 className="text-center mb-4" style={{ color: '#003366' }}>Welcome, {userName}!</h2>
      <div className="row">
        <div className="col-md-4">
          <div className="card">
            <div className="card-header">Assessment Types</div>
            <div className="list-group list-group-flush" style={{ maxHeight: '400px', overflowY: 'auto' }}>
              {Object.keys(allAssessmentReports).map((type) => (
                <button
                  key={type}
                  className={`list-group-item list-group-item-action ${
                    selectedAssessment === type ? 'active' : ''
                  }`}
                  onClick={() => setSelectedAssessment(type)}
                >
                  {type}
                </button>
              ))}
            </div>
          </div>
        </div>
        <div className="col-md-8">
          {selectedAssessment && allAssessmentReports[selectedAssessment] && Array.isArray(allAssessmentReports[selectedAssessment]) && (
            <div className="card">
              <div className="card-header">{selectedAssessment} Reports</div>
              <div className="card-body" style={{ maxHeight: '800px', overflowY: 'auto' }}>
                <table className="table table-striped">
                  <thead>
                    <tr>
                      <th scope="col">Report Name</th>
                      <th scope="col">Status</th>
                      <th scope="col">Execution Date</th>
                      <th scope="col">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {allAssessmentReports[selectedAssessment].map((reportName) => {
                      const { jobId, status, date, output } = getReportStatus(selectedAssessment, reportName);
                      const downloadUrl = downloadUrls[jobId];
                      const isJobCompleted = status === 'Completed';
                      const isJobFailed = status === 'Failed';
                      return (
                        <tr key={reportName}>
                          <td>{reportName}</td>
                          <td>
                            <span
                              className={`badge ${getStatusBadgeClass(status)}`}
                            >
                              {status}
                            </span>
                          </td>
                          <td>{date}</td>
                          <td>
                            {isJobCompleted && downloadUrl && (
                              <a
                                href={downloadUrl}
                                className="btn btn-sm btn-primary me-2"
                                target="_blank"
                                rel="noopener noreferrer"
                                download
                              >
                                Download
                              </a>
                            )}
                            {isJobCompleted && !downloadUrl && (
                               <button
                                className="btn btn-sm btn-primary me-2"
                                disabled
                              >
                                Processing...
                              </button>
                            )}
                            {isJobFailed && (
                              <button
                                className="btn btn-sm btn-danger"
                                onClick={() => alert(`Error Details:\n${output}`)}
                              >
                                View Error
                              </button>
                            )}
                            {!isJobCompleted && !isJobFailed && status !== 'Not Initiated' && (
                              <button
                                className="btn btn-sm btn-secondary"
                                disabled
                              >
                                Running...
                              </button>
                            )}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AssessmentOperationsDashboard