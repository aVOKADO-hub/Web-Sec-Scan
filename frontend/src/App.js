import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './App.css';

function App() {
  const [targetUrl, setTargetUrl] = useState('');
  const [scanId, setScanId] = useState('');
  const [status, setStatus] = useState('');
  const [vulnerabilities, setVulnerabilities] = useState([]);
  const [scanType, setScanType] = useState('all');

  const startScan = async () => {
    try {
      const response = await axios.get('http://localhost:5000/scan', {
        params: { target: targetUrl, scanType },
      });
      setScanId(response.data.scanId);
      setStatus('Scan started, waiting for results...');
    } catch (error) {
      setStatus('Error starting scan');
    }
  };

  const checkStatus = async () => {
    try {
      const response = await axios.get('http://localhost:5000/scan-status', {
        params: { scanId },
      });
      const scanStatus = response.data.status;
      setStatus(`Scan status: ${scanStatus}`);
      
      if (scanStatus === '100') {
        fetchVulnerabilities(); // Отримуємо вразливості після завершення
      }
    } catch (error) {
      setStatus('Error getting scan status');
    }
  };

  const fetchVulnerabilities = async () => {
    try {
      const response = await axios.get('http://localhost:5000/vulnerabilities', {
        params: { scanId },
      });
      setVulnerabilities(response.data);
      alert('vulner'+response.data)
    } catch (error) {
      console.error('Error fetching vulnerabilities:', error.message);
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

      {vulnerabilities.length > 0 && (
        <div>
          <h2>Vulnerabilities Found: </h2>
          <ul>
            {vulnerabilities.map((vuln, index) => (
              <li key={index}>
                <strong>{vuln.alert}</strong> ({vuln.risk})  
                <p>{vuln.description}</p>
                <p><strong>URL:</strong> {vuln.targetUrl}</p>
                <p><strong>Solution:</strong> {vuln.endTime}</p>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}

export default App;
