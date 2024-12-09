import React, { useState } from 'react';
import axios from 'axios';
import './App.css'

function App() {
  const [targetUrl, setTargetUrl] = useState('');
  const [scanId, setScanId] = useState('');
  const [status, setStatus] = useState('');
  const [scanType, setScanType] = useState('all'); // Добавляем состояние для выбора типа сканирования

  const startScan = async () => {
    try {
      const response = await axios.get(`http://localhost:5000/scan`, {
        params: { target: targetUrl, scanType }
      });
      setScanId(response.data.scanId);
      setStatus('Scan started, waiting for results...');
    } catch (error) {
      console.error('Error starting scan:', error);
      setStatus('Error starting scan');
    }
  };

  const checkStatus = async () => {
    if (!scanId) {
      setStatus('Scan ID is missing. Start a scan first.');
      return;
    }

    try {
      const response = await axios.get(`http://localhost:5000/scan-status`, {
        params: { scanId }
      });
      setStatus(`Scan status: ${response.data.status}`);
    } catch (error) {
      console.error('Error getting scan status:', error);
      setStatus('Error getting scan status');
    }
  };

  return (
    <div className="App">
      <h1>Web Security Scanner</h1>
      
      <input
        type="text"
        placeholder="Enter target URL"
        value={targetUrl}
        onChange={(e) => setTargetUrl(e.target.value)}
      />
      
      <label>
        Select scan type:
        <select value={scanType} onChange={(e) => setScanType(e.target.value)}>
          <option value="all">All Vulnerabilities</option>
          <option value="sql_injection">SQL Injection</option>
          <option value="xss">XSS (Cross-Site Scripting)</option>
          <option value="csrf">CSRF (Cross-Site Request Forgery)</option>
        </select>
      </label>
      
      <button onClick={startScan}>Start Scan</button>
      
      {scanId && <div>Scan ID: {scanId}</div>}
      <button onClick={checkStatus}>Check Scan Status</button>
      {status && <div>Status: {status}</div>}
    </div>
  );
}

export default App;
