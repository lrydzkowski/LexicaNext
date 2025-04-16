import { useState } from 'react';
import appConfig from './config/app-config';
import { GetAppStatusResponse } from './models/get-app-status-response';

import './App.css';

function App() {
  const [response, setResponse] = useState<GetAppStatusResponse>();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchStatus = async () => {
    setLoading(true);
    setError(null);

    try {
      const response = await fetch(`${appConfig.apiBasePath}/status`);

      if (!response.ok) {
        throw new Error(`Failed to fetch status: ${response.status} ${response.statusText}`);
      }

      const data = (await response.json()) as GetAppStatusResponse;
      setResponse(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An unknown error occurred');
      console.error('Error fetching status:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <h1>Lexica Next</h1>

      <div className="card">
        <button onClick={fetchStatus} disabled={loading}>
          {loading ? 'Loading...' : 'Fetch Status from API'}
        </button>

        {error && <div style={{ color: 'red', marginTop: '10px' }}>Error: {error}</div>}

        {response && (
          <div style={{ marginTop: '10px', textAlign: 'left' }}>
            <h3>Response Retrieved:</h3>
            <pre>{JSON.stringify(response, null, 2)}</pre>
          </div>
        )}
      </div>
    </>
  );
}

export default App;
