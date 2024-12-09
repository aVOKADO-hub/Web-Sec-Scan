import React, { useState } from 'react';
import axios from 'axios';

const ScanForm = () => {
  const [url, setUrl] = useState('');
  const [testType, setTestType] = useState('sql');

  const handleScan = async () => {
    try {
      const response = await axios.post(`http://localhost:5000/api/${testType}`, { url });
      console.log(response.data);
    } catch (error) {
      console.error('Error running scan:', error.message);
    }
  };

  return (
    <div>
      <input
        type="text"
        placeholder="Enter URL"
        value={url}
        onChange={(e) => setUrl(e.target.value)}
      />
      <select value={testType} onChange={(e) => setTestType(e.target.value)}>
        <option value="sql">SQL Injection</option>
        <option value="xss">XSS</option>
        <option value="headers">HTTP Headers</option>
      </select>
      <button onClick={handleScan}>Run Scan</button>
    </div>
  );
};

export default ScanForm;
