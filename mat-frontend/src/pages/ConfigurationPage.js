import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

const ConfigurationPage = () => {
  const [hasAppId, setHasAppId] = useState(false);
  const [clientId, setClientId] = useState('');
  const [clientSecret, setClientSecret] = useState('');
  const [certificateThumbprint, setCertificateThumbprint] = useState('');
  const [gaAccount, setGaAccount] = useState('');
  const [gaPassword, setGaPassword] = useState('');
  const [tenantId, setTenantId] = useState('');
  const [tenantUrl, setTenantUrl] = useState('');
  const [azureFileStorage, setAzureFileStorage] = useState('');
  const [storageAccountKey, setStorageAccountKey] = useState('');
  const [storageAccountCredential, setStorageAccountCredential] = useState('');

  const [existingTenant, setExistingTenant] = useState(null);
  const [loading, setLoading] = useState(true);
  const [successMessage, setSuccessMessage] = useState('');
  const [forceReload, setForceReload] = useState(false); // Added for re-fetching
  const navigate = useNavigate();

  useEffect(() => {
    const userEmail = sessionStorage.getItem('userEmail');
    if (!userEmail) {
      navigate('/login');
      return;
    }

    const fetchTenant = async () => {
      setLoading(true);
      try {
        const response = await fetch(`http://localhost:3001/users/tenants/${userEmail}`);
        if (response.ok) {
          const data = await response.json();
          if (data.tenants && data.tenants.length > 0) {
            const tenantData = data.tenants[0];
            setExistingTenant(tenantData);
            setHasAppId(tenantData.hasAppId || false);
            setClientId(tenantData.clientId || '');
            setClientSecret(tenantData.clientSecret || '');
            setCertificateThumbprint(tenantData.certificateThumbprint || '');
            setGaAccount(tenantData.gaAccount || '');
            setGaPassword(tenantData.gaPassword || '');
            setTenantId(tenantData.tenantId || '');
            setTenantUrl(tenantData.tenantUrl || '');
            setAzureFileStorage(tenantData.azureFileStorage || '');
            setStorageAccountKey(tenantData.storageAccountKey || '');
            setStorageAccountCredential(tenantData.storageAccountCredential || '');
          } else {
            // If no tenant is found, reset the state
            setExistingTenant(null);
            setHasAppId(false);
            setClientId('');
            setClientSecret('');
            setCertificateThumbprint('');
            setGaAccount('');
            setGaPassword('');
            setTenantId('');
            setTenantUrl('');
            setAzureFileStorage('');
            setStorageAccountKey('');
            setStorageAccountCredential('');
          }
        } else {
          console.error('Failed to fetch existing tenant:', response.statusText);
        }
      } catch (error) {
        console.error('Error fetching existing tenant:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchTenant();
  }, [navigate, forceReload]); // Dependency array includes forceReload

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSuccessMessage(''); // Clear any previous success message

    if (hasAppId) {
      const userEmail = sessionStorage.getItem('userEmail'); // Get user email from session storage
      if (!userEmail) {
        alert('User not logged in. Please log in again.');
        navigate('/login');
        return;
      }

      try {
        const response = await fetch('http://localhost:3001/users/tenants', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            email: userEmail,
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
          }),
        });

        const data = await response.json();

        if (response.ok) {
          setSuccessMessage('Configuration saved successfully!');
          setForceReload(prev => !prev); // Trigger re-fetch
          // Only navigate if it was an initial submission (no existing tenant before this submit)
          if (!existingTenant) {
            navigate('/environment-selection');
          }
        } else {
          alert(data.message || 'Failed to save configuration.');
        }
      } catch (error) {
        console.error('Configuration submission error:', error);
        alert('An error occurred while saving the configuration.');
      }
    } else {
      alert('You must have an App ID and secret to proceed.');
    }
  };

  const handleProceed = () => {
    navigate('/environment-selection');
  };

  if (loading) {
    return <div className="container mt-5 text-center">Loading configuration...</div>;
  }

  return (
    <div style={{ maxHeight: 'calc(100vh - 120px)', overflowY: 'auto', padding: '20px' }}>
      <div className="container mt-5">
        <div className="alert alert-info" role="alert">
          Please check if you are all set to use this migrate tool.
        </div>
        <h1 className="mb-4">Configuration</h1>
        {successMessage && (
          <div className="alert alert-success" role="alert">
            {successMessage}
          </div>
        )}
        {existingTenant ? (
          <div className="card p-4 shadow-sm">
            <p>You already have a configured tenant:</p>
            <p><strong>Tenant URL/ID:</strong> {existingTenant.tenantId}</p>
            <button className="btn btn-primary" onClick={handleProceed}>Proceed to Environment Selection</button>
            <hr />
            <p>Or, if you wish to update it, use the form below:</p>
            <form onSubmit={handleSubmit}>
              <div className="mb-3">
                <p>Do you have an Client ID and secret with elevated access?</p>
                <div className="form-check">
                  <input
                    className="form-check-input"
                    type="radio"
                    name="hasAppId"
                    id="yes"
                    checked={hasAppId}
                    onChange={() => setHasAppId(true)}
                  />
                  <label className="form-check-label" htmlFor="yes">
                    Yes
                  </label>
                </div>
                <div className="form-check">
                  <input
                    className="form-check-input"
                    type="radio"
                    name="hasAppId"
                    id="no"
                    checked={!hasAppId}
                    onChange={() => setHasAppId(false)}
                  />
                  <label className="form-check-label" htmlFor="no">
                    No
                  </label>
                </div>
              </div>

              {hasAppId && (
                <>
                  <div className="mb-3">
                    <label htmlFor="clientId" className="form-label">Client ID:</label>
                    <input
                      type="text"
                      className="form-control"
                      id="clientId"
                      value={clientId}
                      onChange={(e) => setClientId(e.target.value)}
                      placeholder="Enter Client ID"
                      required
                    />
                  </div>
                  <div className="mb-3">
                    <label htmlFor="clientSecret" className="form-label">Client Secret:</label>
                    <input
                      type="text"
                      className="form-control"
                      id="clientSecret"
                      value={clientSecret}
                      onChange={(e) => setClientSecret(e.target.value)}
                      placeholder="Enter Client Secret"
                      required
                    />
                  </div>
                  <div className="mb-3">
                    <label htmlFor="certificateThumbprint" className="form-label">Certificate Thumbprint:</label>
                    <input
                      type="text"
                      className="form-control"
                      id="certificateThumbprint"
                      value={certificateThumbprint}
                      onChange={(e) => setCertificateThumbprint(e.target.value)}
                      placeholder="Enter Certificate Thumbprint"
                    />
                  </div>
                  <div className="mb-3">
                    <label htmlFor="gaAccount" className="form-label">GA Account:</label>
                    <input
                      type="text"
                      className="form-control"
                      id="gaAccount"
                      value={gaAccount}
                      onChange={(e) => setGaAccount(e.target.value)}
                    />
                  </div>
                  <div className="mb-3">
                    <label htmlFor="gaPassword" className="form-label">GA Password:</label>
                    <input
                      type="password"
                      className="form-control"
                      id="gaPassword"
                      value={gaPassword}
                      onChange={(e) => setGaPassword(e.target.value)}
                      placeholder="Enter Global Admin Password"
                    />
                  </div>
                  <div className="mb-3">
                    <label htmlFor="tenantId" className="form-label">Tenant ID:</label>
                    <input
                      type="text"
                      className="form-control"
                      id="tenantId"
                      value={tenantId}
                      onChange={(e) => setTenantId(e.target.value)}
                      required
                    />
                  </div>
                  <div className="mb-3">
                    <label htmlFor="tenantUrl" className="form-label">Tenant URL:</label>
                    <input
                      type="text"
                      className="form-control"
                      id="tenantUrl"
                      placeholder="e.g., https://yourtenant.sharepoint.com"
                      value={tenantUrl}
                      onChange={(e) => setTenantUrl(e.target.value)}
                      required
                    />
                  </div>
                  <div className="mb-3">
                    <label htmlFor="azureFileStorage" className="form-label">Azure File Storage:</label>
                    <input
                      type="text"
                      className="form-control"
                      id="azureFileStorage"
                      value={azureFileStorage}
                      onChange={(e) => setAzureFileStorage(e.target.value)}
                      placeholder="Enter Azure File Storage"
                    />
                  </div>
                  <div className="mb-3">
                    <label htmlFor="storageAccountKey" className="form-label">Storage Account Key:</label>
                    <input
                      type="text"
                      className="form-control"
                      id="storageAccountKey"
                      value={storageAccountKey}
                      onChange={(e) => setStorageAccountKey(e.target.value)}
                    />
                  </div>
                  <div className="mb-3">
                    <label htmlFor="storageAccountCredential" className="form-label">Storage Account Credential:</label>
                    <input
                      type="text"
                      className="form-control"
                      id="storageAccountCredential"
                      value={storageAccountCredential}
                      onChange={(e) => setStorageAccountCredential(e.target.value)}
                      placeholder="Enter Storage Account Credential"
                    />
                  </div>
                </>
              )}
              <button type="submit" className="btn btn-primary" disabled={!hasAppId}>Update Configuration</button>
            </form>
          </div>
        ) : (
          <form onSubmit={handleSubmit}>
            <div className="mb-3">
              <p>Do you have an Client ID and secret with elevated access?</p>
              <div className="form-check">
                <input
                  className="form-check-input"
                  type="radio"
                  name="hasAppId"
                  id="yes"
                  onChange={() => setHasAppId(true)}
                />
                <label className="form-check-label" htmlFor="yes">
                  Yes
                </label>
              </div>
              <div className="form-check">
                <input
                  className="form-check-input"
                  type="radio"
                  name="hasAppId"
                  id="no"
                  defaultChecked
                  onChange={() => setHasAppId(false)}
                />
                <label className="form-check-label" htmlFor="no">
                  No
                </label>
              </div>
            </div>

            {hasAppId && (
              <>
                <div className="mb-3">
                  <label htmlFor="clientId" className="form-label">Client ID:</label>
                  <input
                    type="text"
                    className="form-control"
                    id="clientId"
                    value={clientId}
                    onChange={(e) => setClientId(e.target.value)}
                    required
                  />
                </div>
                <div className="mb-3">
                  <label htmlFor="clientSecret" className="form-label">Client Secret:</label>
                  <input
                    type="text"
                    className="form-control"
                    id="clientSecret"
                    value={clientSecret}
                    onChange={(e) => setClientSecret(e.target.value)}
                    placeholder="Enter Client Secret"
                    required
                  />
                </div>
                <div className="mb-3">
                  <label htmlFor="certificateThumbprint" className="form-label">Certificate Thumbprint:</label>
                  <input
                    type="text"
                    className="form-control"
                    id="certificateThumbprint"
                    value={certificateThumbprint}
                    onChange={(e) => setCertificateThumbprint(e.target.value)}
                    placeholder="Enter Certificate Thumbprint"
                  />
                </div>
                <div className="mb-3">
                  <label htmlFor="gaAccount" className="form-label">GA Account:</label>
                  <input
                    type="text"
                    className="form-control"
                    id="gaAccount"
                    value={gaAccount}
                    onChange={(e) => setGaAccount(e.target.value)}
                    placeholder="Enter Global Admin Account"
                  />
                </div>
                <div className="mb-3">
                  <label htmlFor="gaPassword" className="form-label">GA Password:</label>
                  <input
                    type="password"
                    className="form-control"
                    id="gaPassword"
                    value={gaPassword}
                    onChange={(e) => setGaPassword(e.target.value)}
                    placeholder="Enter Global Admin Password"
                  />
                </div>
                <div className="mb-3">
                  <label htmlFor="tenantId" className="form-label">Tenant ID:</label>
                  <input
                    type="text"
                    className="form-control"
                    id="tenantId"
                    value={tenantId}
                    onChange={(e) => setTenantId(e.target.value)}
                    placeholder="Enter Tenant ID"
                    required
                  />
                </div>
                <div className="mb-3">
                  <label htmlFor="tenantUrl" className="form-label">Tenant URL:</label>
                  <input
                    type="text"
                    className="form-control"
                    id="tenantUrl"
                    placeholder="e.g., https://yourtenant.sharepoint.com"
                    value={tenantUrl}
                    onChange={(e) => setTenantUrl(e.target.value)}
                    required
                  />
                </div>
                <div className="mb-3">
                  <label htmlFor="azureFileStorage" className="form-label">Azure File Storage:</label>
                  <input
                    type="text"
                    className="form-control"
                    id="azureFileStorage"
                    value={azureFileStorage}
                    onChange={(e) => setAzureFileStorage(e.target.value)}
                    placeholder="Enter Azure File Storage"
                  />
                </div>
                <div className="mb-3">
                  <label htmlFor="storageAccountKey" className="form-label">Storage Account Key:</label>
                  <input
                    type="text"
                    className="form-control"
                    id="storageAccountKey"
                    value={storageAccountKey}
                    onChange={(e) => setStorageAccountKey(e.target.value)}
                    placeholder="Enter Storage Account Key"
                  />
                </div>
                <div className="mb-3">
                  <label htmlFor="storageAccountCredential" className="form-label">Storage Account Credential:</label>
                  <input
                    type="text"
                    className="form-control"
                    id="storageAccountCredential"
                    value={storageAccountCredential}
                    onChange={(e) => setStorageAccountCredential(e.target.value)}
                    placeholder="Enter Storage Account Credential"
                  />
                </div>
              </>
            )}
            <button type="submit" className="btn btn-primary" disabled={!hasAppId}>Submit</button>
          </form>
        )}
      </div>
    </div>
  );
};

export default ConfigurationPage;
