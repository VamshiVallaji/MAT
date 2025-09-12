import React from 'react';

const HelpPage = () => {
  return (
    <div className="container mt-5">
      <h2 className="text-center" style={{ color: '#003366' }}>Help and Instructions</h2>
      <div className="card mx-auto mt-4" style={{ maxWidth: '800px' }}>
        <div className="card-body" style={{ maxHeight: 'calc(100vh - 150px)', overflowY: 'auto' }}>
          <p>Welcome to the Migration Acceleration Toolkit Help page. Here are point-to-point instructions on how to use the application:</p>

          <h4>1. Registration & Login:</h4>
          <ul>
            <li><strong>New User:</strong> Click on the 'New User' button on the Home page or navigate to <code>/register</code>. Fill in your email and password to create an account.</li>
            <li><strong>Existing User:</strong> Click on the 'Existing User' button on the Home page or navigate to <code>/login</code>. Enter your registered email and password to log in.</li>
            <li><strong>Show Password:</strong> On both Registration and Login pages, you can check the 'Show Password' box to view your typed password.</li>
            <li><strong>Login Redirect:</strong> After successful login, you will be automatically redirected to the Dashboard page.</li>
          </ul>

          <h4>2. Dashboard Overview:</h4>
          <ul>
            <li>The Dashboard displays a welcome message with your name (extracted from your email).</li>
            <li>You can see a list of all assessments you have initiated.</li>
            <li><strong>Go to Configuration:</strong> Click this button to navigate to the Configuration page.</li>
            <li><strong>View Assessment:</strong> Click 'View' next to an assessment to see its detailed report.</li>
            <li><strong>Delete Assessment:</strong> Click 'Delete' next to an assessment to permanently remove it from your records. You will be asked for confirmation.</li>
            <li><strong>Scrolling:</strong> If you have many assessments, the table will automatically scroll to show all entries.</li>
          </ul>

          <h4>3. Configuration Page:</h4>
          <ul>
            <li>Navigate to <code>/configure</code> from the Dashboard or directly.</li>
            <li><strong>Existing Configuration:</strong> If you have already saved a Tenant URL, it will be displayed, and you'll have an option to 'Proceed to Environment Selection' directly.</li>
            <li><strong>New/Update Configuration:</strong> Enter your Tenant URL or ID. Ensure you select 'Yes' for having a Client ID and secret.</li>
            <li><strong>Submit/Update:</strong> After submitting, a success message will appear on the same page, and you will only be redirected to Environment Selection if it's your first configuration.</li>
          </ul>

          <h4>4. Cloud Login (Client ID/Secret):</h4>
          <ul>
            <li>Navigate to <code>/cloud-login</code> (typically from Environment Selection).</li>
            <li>Enter your Client ID and Client Secret.</li>
            <li><strong>Show Secret:</strong> Check the 'Show Secret' box to view your typed client secret.</li>
            <li><strong>Proceed:</strong> Upon successful submission, you will be redirected to the Assessment Options page.</li>
          </ul>

          <h4>5. On-Premises Login:</h4>
          <ul>
            <li>Navigate to <code>/on-prem-login</code> (typically from Environment Selection).</li>
            <li>Enter your Account (Username) and Password.</li>
            <li><strong>Show Password:</strong> Check the 'Show Password' box to view your typed password.</li>
            <li><strong>Proceed:</strong> Upon successful submission, you will be redirected to the Assessment Options page.</li>
          </ul>

          <h4>6. Assessment Options:</h4>
          <ul>
            <li>Select the type of assessment you wish to initiate (e.g., 'Share Point online', 'Identity online').</li>
            <li>Initiating an assessment will save a record of it to your Dashboard. You can initiate multiple assessments of the same type; each will have a unique name based on the time of initiation.</li>
            <li>You will then be redirected to the specific assessment details page.</li>
          </ul>

          <h4>7. Providing Feedback:</h4>
          <ul>
            <li>Navigate to <code>/feedback</code> from the Navbar.</li>
            <li>Enter your feedback in the text area and click 'Submit Feedback'.</li>
            <li>Your feedback will be stored and associated with your account.</li>
          </ul>

          <p>For further assistance, please use the Feedback page or contact support.</p>
        </div>
      </div>
    </div>
  );
};

export default HelpPage;
