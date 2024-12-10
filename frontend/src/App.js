import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './App.css';

function App() {
  const [targetUrl, setTargetUrl] = useState('');
  const [scanId, setScanId] = useState('');
  const [status, setStatus] = useState('');
  const [progress, setProgress] = useState(0); // Прогрес сканування
  const [vulnerabilities, setVulnerabilities] = useState([]);
  const [scanType, setScanType] = useState('all');

  const startScan = async () => {
    try {
      const response = await axios.get('http://localhost:5000/scan', {
        params: { target: targetUrl, scanType },
      });
      setScanId(response.data.scanId);
      setStatus('Сканування розпочато...');
      setProgress(0); // Обнулити прогрес перед початком нового сканування
    } catch (error) {
      setStatus('Помилка при запуску сканування');
    }
  };

  // Функція для автоматичного перевірки статусу сканування
  useEffect(() => {
    if (scanId && progress < 100) {
      const interval = setInterval(async () => {
        try {
          const response = await axios.get('http://localhost:5000/scan-status', {
            params: { scanId },
          });

          const scanStatus = parseInt(response.data.status, 10);
          setProgress(scanStatus);
          setStatus(`Сканування: ${scanStatus}% завершено`);

          if (scanStatus === 100) {
            clearInterval(interval);
            fetchVulnerabilities(); // Отримати вразливості після завершення
          }
        } catch (error) {
          setStatus('Помилка при отриманні статусу');
          clearInterval(interval);
        }
      }, 5000); // Перевіряти статус кожні 5 секунд

      return () => clearInterval(interval); // Очищення таймера
    }
  }, [scanId, progress]);

  const fetchVulnerabilities = async () => {
    try {
      const response = await axios.get('http://localhost:5000/vulnerabilities', {
        params: { scanId },
      });
      setVulnerabilities(response.data);
    } catch (error) {
      console.error('Помилка при отриманні вразливостей:', error.message);
    }
  };

  return (
    <div className="App">
      <h1>Web Security Scanner</h1>

      <input
        type="text"
        placeholder="Введіть URL"
        value={targetUrl}
        onChange={(e) => setTargetUrl(e.target.value)}
      />

      <label>
        Оберіть тип сканування:
        <select value={scanType} onChange={(e) => setScanType(e.target.value)}>
          <option value="all">Усі вразливості</option>
          <option value="sql_injection">SQL Injection</option>
          <option value="xss">XSS (Cross-Site Scripting)</option>
          <option value="csrf">CSRF (Cross-Site Request Forgery)</option>
        </select>
      </label>

      <button onClick={startScan}>Розпочати сканування</button>

      {scanId && <div>Scan ID: {scanId}</div>}

      {status && <div>Status: {status}</div>}

      {progress > 0 && (
        <div style={{ width: '100%', backgroundColor: '#e0e0e0', borderRadius: '5px', margin: '20px 0' }}>
          <div
            style={{
              width: `${progress}%`,
              backgroundColor: '#4caf50',
              height: '20px',
              borderRadius: '5px',
              transition: 'width 0.5s ease-in-out',
            }}
          />
        </div>
      )}

      {vulnerabilities.length > 0 && (
        <div>
          <h2>Знайдені вразливості:</h2>
          <ul>
            {vulnerabilities.map((vuln, index) => (
              <li key={index}>
                <strong>Оповіщення: {vuln.alert}</strong> Ризик: {vuln.risk}
                <p>Опис: {vuln.description}</p>
                <p><strong>URL:</strong> {vuln.targetUrl}</p>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}

export default App;
