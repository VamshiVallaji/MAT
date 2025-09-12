import React from 'react';
import { BrowserRouter as Router, Route, Routes, useLocation } from 'react-router-dom';
import HomePage from './pages/HomePage';
import RegistrationPage from './pages/RegistrationPage';
import LoginPage from './pages/LoginPage';
import ConfigurationPage from './pages/ConfigurationPage';
import AssessmentOperationsSelectionPage from './pages/AssessmentOperationsSelectionPage';
import AssessmentOperationsDashboard from './pages/AssessmentOperationsDashboard';
import AssessmentReportPage from './pages/AssessmentReportPage';
import CloudLoginPage from './pages/CloudLoginPage';
import OnPremLoginPage from './pages/OnPremLoginPage';
import HelpPage from './pages/HelpPage';
import FeedbackPage from './pages/FeedbackPage';
import AssessmentOptionsPage from './pages/AssessmentOptionsPage';
import SharePointAssessmentPage from './pages/SharePointAssessmentPage';
import IdentityAssessmentPage from './pages/IdentityAssessmentPage';
import ExchangeAssessmentPage from './pages/ExchangeAssessmentPage';
import OneDriveAssessmentPage from './pages/OneDriveAssessmentPage';
import TeamsAssessmentPage from './pages/TeamsAssessmentPage';
import CloudFileSharesAssessmentPage from './pages/CloudFileSharesAssessmentPage';
import EnvironmentSelectionPage from './pages/EnvironmentSelectionPage';
import Navbar from './components/Navbar';
import AssessmentDetailsPage from './pages/AssessmentDetailsPage'; // Import the new page

function AppContent() {
  const location = useLocation();

  return (
    <div style={{ minHeight: '100vh', overflowY: 'auto' }}>
      <Navbar />
      <main className="container mt-4">
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/register" element={<RegistrationPage />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/configuration" element={<ConfigurationPage />} />
          <Route path="/environment-selection" element={<EnvironmentSelectionPage />} />
          <Route path="/assessment-operations-selection" element={<AssessmentOperationsSelectionPage />} />
          <Route path="/dashboard" element={<AssessmentOperationsDashboard />} />
          <Route path="/report" element={<AssessmentReportPage />} />
          <Route path="/cloud-login" element={<CloudLoginPage />} />
          <Route path="/on-prem-login" element={<OnPremLoginPage />} />
          <Route path="/help" element={<HelpPage />} />
          <Route path="/feedback" element={<FeedbackPage />} />
          <Route path="/assessment-options" element={<AssessmentOptionsPage />} />
          <Route path="/assessment-details" element={<AssessmentDetailsPage />} /> 
          <Route path="/assessment-details/sharepoint-online" element={<SharePointAssessmentPage />} />
          <Route path="/assessment-details/identity-online" element={<IdentityAssessmentPage />} />
          <Route path="/assessment-details/exchange-online" element={<ExchangeAssessmentPage />} />
          <Route path="/assessment-details/onedrive-for-business" element={<OneDriveAssessmentPage />} />
          <Route path="/assessment-details/teams-enterprise-voice" element={<TeamsAssessmentPage />} />
          <Route path="/assessment-details/cloud-file-shares" element={<CloudFileSharesAssessmentPage />} />
        </Routes>
      </main>
    </div>
  );
}

function App() {
  return (
    <Router>
      <AppContent />
    </Router>
  );
}

export default App;
