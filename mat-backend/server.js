const express = require('express');
const cors = require('cors');
const fs = require('fs');
const path = require('path');
const axios = require('axios');
const { DefaultAzureCredential } = require('@azure/identity');
const { AutomationClient } = require('@azure/arm-automation');
const { BlobServiceClient, BlobSASPermissions, generateBlobSASQueryParameters } = require('@azure/storage-blob');
const https = require('https');

// --- Azure Configuration ---
const subscriptionId = process.env.AZURE_SUBSCRIPTION_ID || '3ee0b565-ffd5-4dd4-b32e-e1c958463387';
const resourceGroupName = process.env.AZURE_RESOURCE_GROUP || 'mat-automation-rg';
const automationAccountName = process.env.AZURE_AUTOMATION_ACCOUNT || 'mat-automation-account';
// -------------------------

const app = express();
const PORT = 3001;

app.use(cors());
app.use(express.json());

const dbPath = path.join(__dirname, 'db.json');

// Helper function to read the database
const readDB = () => {
  try {
    const data = fs.readFileSync(dbPath, 'utf8');
    const db = JSON.parse(data);
    if (!db.users) db.users = [];
    if (!db.feedback) db.feedback = [];
    return db;
  } catch (error) {
    // If the file doesn't exist or is empty, return a default structure
    return { users: [], feedback: [] };
  }
};

// Helper function to write to the database
const writeDB = (data) => {
  fs.writeFileSync(dbPath, JSON.stringify(data, null, 2));
};

// Migration function to ensure all users have the necessary fields
const migrateUsers = () => {
  const db = readDB();
  let updated = false;

  db.users.forEach(user => {
    if (!user.tenants) {
      user.tenants = [];
      updated = true;
    }
    if (!user.client_credentials) {
      user.client_credentials = [];
      updated = true;
    }
    if (!user.feedback) {
      user.feedback = [];
      updated = true;
    }
    if (!user.on_prem_credentials) {
      user.on_prem_credentials = [];
      updated = true;
    }
    if (!user.assessments) {
      user.assessments = [];
      updated = true;
    }
  });

  if (updated) {
    writeDB(db);
    console.log('User data migration completed.');
  }
};


// Registration endpoint
app.post('/register', (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ message: 'Email and password are required' });
  }

  const db = readDB();

  const userExists = db.users.some(user => user.email === email);
  if (userExists) {
    return res.status(400).json({ message: 'User with this email already exists' });
  }

  // Create a new user with the correct structure
  const newUser = {
    id: Date.now(),
    email,
    password,
    tenants: [],
    client_credentials: [],
    feedback: [], // Add feedback array to new user
    on_prem_credentials: [], // Add on-prem credentials array to new user
    assessments: [] // Add assessments array to new user
  };

  db.users.push(newUser);
  writeDB(db);

  res.status(201).json({ message: 'User registered successfully', user: newUser });
});

// Login endpoint
app.post('/login', (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ message: 'Email and password are required' });
  }

  const db = readDB();
  const user = db.users.find(user => user.email === email && user.password === password);

  if (user) {
    // Send back the user's email so the frontend can identify the user
    res.status(200).json({ message: 'Login successful', email: user.email });
  } else {
    res.status(401).json({ message: 'Invalid email or password' });
  }
});

// Endpoint to add a tenant to a specific user
app.post('/users/tenants', (req, res) => {
  try {
    const {
      email,
      hasAppId,
      clientId,
      clientSecret,
      certificateThumbprint,
      gaAccount,
      gaPassword,
      tenantId,
      tenantUrl,
      azureFileStorage,
      storageAccountKey,
      storageAccountCredential,
    } = req.body;

    if (!email || !tenantId) { // tenantId is still a core requirement
      return res.status(400).json({ message: 'Email and Tenant ID are required' });
    }

    const db = readDB();
    const user = db.users.find(u => u.email === email);

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    if (!user.tenants) user.tenants = []; // Ensure array exists

    // If tenants exist, clear them to ensure only one tenant is present
    if (user.tenants.length > 0) {
      user.tenants = [];
    }

    const newTenant = {
      id: Date.now(),
      hasAppId,
      clientId,
      clientSecret,
      certificateThumbprint,
      gaAccount,
      gaPassword,
      tenantId,
      tenantUrl,
      azureFileStorage,
      storageAccountKey,
      storageAccountCredential,
    };

    user.tenants.push(newTenant);
    writeDB(db);

    res.status(201).json({ message: 'Tenant saved successfully', user });
  } catch (error) {
    console.error('Error in /users/tenants endpoint:', error);
    res.status(500).json({ message: 'Internal Server Error', error: error.message });
  }
});

// Endpoint to get a user's tenants
app.get('/users/tenants/:email', (req, res) => {
  try {
    const { email } = req.params;
    const db = readDB();
    const user = db.users.find(u => u.email === email);

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    res.status(200).json({ tenants: user.tenants || [] });
  } catch (error) {
    console.error('Error in GET /users/tenants/:email endpoint:', error);
    res.status(500).json({ message: 'Internal Server Error', error: error.message });
  }
});

// Endpoint to add client credentials to a specific user
app.post('/users/client-credentials', (req, res) => {
  try {
    const { email, clientId, clientSecret } = req.body;
    if (!email || !clientId || !clientSecret) {
      return res.status(400).json({ message: 'Email, Client ID, and Client Secret are required' });
    }

    const db = readDB();
    const user = db.users.find(u => u.email === email);

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // SECURITY WARNING: Storing secrets in plain text is highly insecure.
    if (!user.client_credentials) user.client_credentials = []; // Ensure array exists
    // Check for duplicate credentials
    const credExists = user.client_credentials.some(c => c.clientId === clientId && c.clientSecret === clientSecret);
    if (credExists) {
      return res.status(400).json({ message: 'These credentials already exist for this user' });
    }

    user.client_credentials.push({ id: Date.now(), clientId, clientSecret });
    writeDB(db);

    res.status(201).json({ message: 'Credentials saved successfully', user });
  } catch (error) {
    console.error('Error in /users/client-credentials endpoint:', error);
    res.status(500).json({ message: 'Internal Server Error', error: error.message });
  }
});

// Endpoint to add feedback to a specific user
app.post('/users/feedback', (req, res) => {
  try {
    const { email, feedback } = req.body;
    if (!email || !feedback) {
      return res.status(400).json({ message: 'Email and feedback content are required' });
    }

    const db = readDB();
    const user = db.users.find(u => u.email === email);

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    if (!user.feedback) user.feedback = []; // Ensure array exists
    // Check for duplicate feedback
    const feedbackExists = user.feedback.some(f => f.feedback === feedback);
    if (feedbackExists) {
      return res.status(400).json({ message: 'This feedback has already been submitted' });
    }

    user.feedback.push({ id: Date.now(), feedback });
    writeDB(db);

    res.status(201).json({ message: 'Feedback submitted successfully', user });
  } catch (error) {
    console.error('Error in /users/feedback endpoint:', error);
    res.status(500).json({ message: 'Internal Server Error', error: error.message });
  }
});

// Endpoint to add on-prem credentials to a specific user
app.post('/users/on-prem-credentials', (req, res) => {
  try {
    const { email, username, password, domain } = req.body;
    if (!email || !username || !password) {
      return res.status(400).json({ message: 'Email, username, and password are required' });
    }

    const db = readDB();
    const user = db.users.find(u => u.email === email);

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // SECURITY WARNING: Storing passwords in plain text is highly insecure.
    if (!user.on_prem_credentials) user.on_prem_credentials = []; // Ensure array exists
    // Check for duplicate on-prem credentials
    const onPremCredExists = user.on_prem_credentials.some(c => c.username === username && c.password === password);
    if (onPremCredExists) {
      return res.status(400).json({ message: 'These on-prem credentials already exist for this user' });
    }

    user.on_prem_credentials.push({ id: Date.now(), username, password, domain });
    writeDB(db);

    res.status(201).json({ message: 'On-prem credentials saved successfully', user });
  } catch (error) {
    console.error('Error in /users/on-prem-credentials endpoint:', error);
    res.status(500).json({ message: 'Internal Server Error', error: error.message });
  }
});

// Endpoint to add an assessment to a specific user
app.post('/users/assessments', (req, res) => {
  try {
    const { email, type, reportName, status, date } = req.body;
    if (!email || !type || !reportName || !status || !date) {
      return res.status(400).json({ message: 'Email, type, report name, status, and date are required' });
    }

    const db = readDB();
    const user = db.users.find(u => u.email === email);

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    if (!user.assessments) user.assessments = []; // Ensure array exists
    const assessmentExists = user.assessments.some(a => a.type === type && a.reportName === reportName);
    if (!assessmentExists) {
      user.assessments.push({ id: Date.now(), type, reportName, status, date });
    }
    writeDB(db);
    res.status(201).json({ message: 'Assessment saved successfully', user });

  } catch (error) {
    console.error('Error in /users/assessments endpoint:', error);
    res.status(500).json({ message: 'Internal Server Error', error: error.message });
  }
});

// Endpoint to add multiple assessments to a specific user
app.post('/users/assessments/bulk', (req, res) => {
  try {
    const { email, assessments } = req.body;
    console.log('Received request to bulk add assessments for email:', email);
    console.log('Assessments received:', assessments);

    if (!email || !assessments || !Array.isArray(assessments)) {
      return res.status(400).json({ message: 'Email and assessments array are required' });
    }

    const db = readDB();
    const user = db.users.find(u => u.email === email);

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    console.log('User found:', user.email);
    if (!user.assessments) user.assessments = []; // Ensure array exists
    console.log('Existing assessments:', user.assessments);

    for (const assessment of assessments) {
      const { type, reportName, status, date } = assessment;
      if (!type || !reportName || !status || !date) {
        console.error('Invalid assessment object:', assessment);
        continue; // Skip invalid assessment objects
      }
      const assessmentExists = user.assessments.some(a => a.type === type && a.reportName === reportName);
      if (!assessmentExists) {
        console.log('Adding assessment:', assessment);
        user.assessments.push({ id: Date.now(), ...assessment });
      }
    }

    console.log('Updated assessments:', user.assessments);
    writeDB(db);
    res.status(201).json({ message: 'Assessments saved successfully', user });

  } catch (error) {
    console.error('Error in /users/assessments/bulk endpoint:', error);
    res.status(500).json({ message: 'Internal Server Error', error: error.message });
  }
});


// Endpoint to get a user's assessments
app.get('/users/assessments/:email', (req, res) => {
  try {
    const { email } = req.params;
    const db = readDB();
    const user = db.users.find(u => u.email === email);

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    res.status(200).json({ assessments: user.assessments || [] });
  } catch (error) {
    console.error('Error in GET /users/assessments/:email endpoint:', error);
    res.status(500).json({ message: 'Internal Server Error', error: error.message });
  }
});

// Endpoint to get a single assessment by ID
app.get('/users/assessments/:email/:id', (req, res) => {
  try {
    const { email, id } = req.params;
    const db = readDB();
    const user = db.users.find(u => u.email === email);

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    const assessment = user.assessments.find(a => a.id === parseInt(id));

    if (!assessment) {
      return res.status(404).json({ message: 'Assessment not found' });
    }

    res.status(200).json({ assessment });
  } catch (error) {
    console.error('Error in GET /users/assessments/:email/:id endpoint:', error);
    res.status(500).json({ message: 'Internal Server Error', error: error.message });
  }
});

// Endpoint to delete an assessment for a specific user
app.delete('/users/assessments/:email/:id', (req, res) => {
  try {
    const { email, id } = req.params;
    const db = readDB();
    const user = db.users.find(u => u.email === email);

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    if (!user.assessments) user.assessments = [];

    const initialLength = user.assessments.length;
    user.assessments = user.assessments.filter(a => a.id !== parseInt(id));

    if (user.assessments.length === initialLength) {
      return res.status(404).json({ message: 'Assessment not found for this user' });
    }

    writeDB(db);

    res.status(200).json({ message: 'Assessment deleted successfully' });
  } catch (error) {
    console.error('Error in DELETE /users/assessments/:email/:id endpoint:', error);
    res.status(500).json({ message: 'Internal Server Error', error: error.message });
  }
});

// New endpoint to trigger report execution
app.post('/api/execute-report', async (req, res) => {
  const {
    TenantId,
    ClientId,
    CertificateName,
    StorageAccountName,
    StorageAccountKey,
    ContainerName,
  } = req.body;
  const webhookUrl = 'https://19661c3c-af38-4d3d-adad-aaa5eafbbf0a.webhook.eus.azure-automation.net/webhooks?token=ePD08ioGsU9PdhLHz60yJjUIHUByWlmgJQkveXzpiF8%3d';

  // Create an agent to bypass SSL verification
  const agent = new https.Agent({
    rejectUnauthorized: false,
  });

  try {
    console.log('Triggering Azure Automation runbook...');
    const response = await axios.post(
      webhookUrl,
      {
        TenantId,
        ClientId,
        CertificateName,
        StorageAccountName,
        StorageAccountKey,
        ContainerName,
      },
      {
        headers: { 'Content-Type': 'application/json' },
        httpsAgent: agent, // Add this line
      }
    );

    // Azure Automation webhook returns an object with a JobIds array
    if (response.data && response.data.JobIds && response.data.JobIds.length > 0) {
      const jobId = response.data.JobIds[0];
      console.log('Runbook triggered successfully. Job ID:', jobId);
      res.json({ jobId });
    } else {
      console.error('Failed to get Job ID from Azure response:', response.data);
      res.status(500).json({ error: 'Failed to get Job ID from Azure.' });
    }
  } catch (error) {
    console.error('Error executing runbook:', error.response ? error.response.data : error.message);
    res.status(500).json({
      error: 'Failed to start the report generation.',
      details: error.response ? error.response.data : error.message,
    });
  }
});

app.get('/test', (req, res) => {
  console.log('TEST: /test route hit!');
  res.json({ message: 'Test route successful!' });
});

// New endpoint to get report status and output
app.get('/api/report-status/:jobId', async (req, res) => {
  const { jobId } = req.params;
  try {
    const credential = new DefaultAzureCredential();
    console.log('Credential:', credential);
    console.log('Subscription ID:', subscriptionId);
    const automationClient = new AutomationClient(credential, subscriptionId);

    const job = await automationClient.job.get(resourceGroupName, automationAccountName, jobId);

    res.json({ status: job.status });

  } catch (error) {
    console.error('Error getting job status:', error);
    res.status(500).json({
      error: 'Failed to get job status.',
      details: error.message,
    });
  }
});

// New endpoint to generate a SAS token for downloading a report
app.post('/api/get-download-link', async (req, res) => {
  const { storageAccountName, containerName, blobName } = req.body;

  if (!storageAccountName || !containerName || !blobName) {
    return res.status(400).json({ error: 'storageAccountName, containerName, and blobName are required.' });
  }

  try {
    const blobServiceUrl = `https://s${storageAccountName}.blob.core.windows.net`;
    const credential = new DefaultAzureCredential();
    const blobServiceClient = new BlobServiceClient(blobServiceUrl, credential);

    const userDelegationKey = await blobServiceClient.getUserDelegationKey(
      new Date(),
      new Date(new Date().valueOf() + 3600 * 1000) // Key valid for 1 hour
    );

    const sasOptions = {
      containerName,
      blobName,
      permissions: BlobSASPermissions.parse("r"), // Read permissions
      startsOn: new Date(),
      expiresOn: new Date(new Date().valueOf() + 3600 * 1000), // URL valid for 1 hour
      protocol: 'https'
    };

    const sasToken = generateBlobSASQueryParameters(sasOptions, userDelegationKey, storageAccountName).toString();
    const sasUrl = `${blobServiceUrl}/${containerName}/${blobName}?${sasToken}`;

    res.json({ downloadUrl: sasUrl });

  } catch (error) {
    console.error('Error generating SAS URL:', error);
    res.status(500).json({
      error: 'Failed to generate download link.',
      details: error.message,
    });
  }
});

app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
  migrateUsers(); // Run migration on startup
});

// Generic 404 handler - MUST be the last route
app.use((req, res, next) => {
  console.log(`404 Handler: No route matched for ${req.method} ${req.originalUrl}`);
  res.status(404).json({ message: 'API Endpoint Not Found' });
});