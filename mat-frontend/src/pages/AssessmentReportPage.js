import React from 'react';
import { useLocation } from 'react-router-dom';

const AssessmentReportPage = () => {
  const location = useLocation();
  // In a real application, you would fetch the assessment data based on the ID from the URL
  // For now, we'll use mock data.
  const assessment = {
    id: 1,
    name: 'Security Assessment',
    status: 'Completed',
    date: '2025-08-15',
    summary: 'This assessment evaluated the security posture of the web application. The assessment identified 5 vulnerabilities, 2 of which are critical. It is recommended to patch the critical vulnerabilities within 48 hours.',
    details: [
      { id: 'VULN-001', severity: 'Critical', description: 'SQL Injection vulnerability in the login form.', recommendation: 'Use parameterized queries to prevent SQL injection.' },
      { id: 'VULN-002', severity: 'Critical', description: 'Cross-Site Scripting (XSS) in the search results page.', recommendation: 'Sanitize user input before rendering it in the browser.' },
      { id: 'VULN-003', severity: 'High', description: 'Insecure direct object reference in the user profile page.', recommendation: 'Implement proper access control checks.' },
      { id: 'VULN-004', severity: 'Medium', description: 'Outdated version of a third-party library.', recommendation: 'Update the library to the latest version.' },
      { id: 'VULN-005', severity: 'Low', description: 'Missing security headers.', recommendation: 'Add appropriate security headers to the web server configuration.' },
    ]
  };

  return (
    <div className="container mt-5" style={{ maxHeight: 'calc(100vh - 150px)', overflowY: 'auto' }}>
      <h1 className="mb-4">Assessment Report</h1>
      <div className="card mb-4">
        <div className="card-header">
          Assessment Summary
        </div>
        <div className="card-body">
          <h5 className="card-title">{assessment.name}</h5>
          <p className="card-text"><strong>Status:</strong> {assessment.status}</p>
          <p className="card-text"><strong>Date:</strong> {assessment.date}</p>
          <p className="card-text">{assessment.summary}</p>
        </div>
      </div>

      <div className="card">
        <div className="card-header">
          Vulnerability Details
        </div>
        <div className="card-body">
          <div className="table-responsive">
            <table className="table">
              <thead>
                <tr>
                  <th scope="col">ID</th>
                  <th scope="col">Severity</th>
                  <th scope="col">Description</th>
                  <th scope="col">Recommendation</th>
                </tr>
              </thead>
              <tbody>
                {assessment.details.map(vulnerability => (
                  <tr key={vulnerability.id}>
                    <td>{vulnerability.id}</td>
                    <td>{vulnerability.severity}</td>
                    <td>{vulnerability.description}</td>
                    <td>{vulnerability.recommendation}</td>
                  </tr>
                ))}
            </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AssessmentReportPage;
