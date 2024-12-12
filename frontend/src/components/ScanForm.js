import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import '../style/style.css';

function ScanForm() {
  const [targetUrl, setTargetUrl] = useState('');
  const [scanType, setScanType] = useState('all');
  const [isLoading, setIsLoading] = useState(false); // Додано стан для завантаження
  const navigate = useNavigate();

  const startScan = async () => {
    setIsLoading(true); // Вмикаємо індикатор завантаження
    try {
      const response = await axios.get('http://localhost:5000/scan', {
        params: { target: targetUrl, scanType },
      });

      const scanId = response.data.scanId;
      setIsLoading(false); // Вимикаємо індикатор завантаження перед навігацією
      navigate('/results', { state: { targetUrl, scanType, scanId } });
    } catch (error) {
      setIsLoading(false); // Вимикаємо індикатор завантаження у разі помилки
      alert('Помилка при запуску сканування');
    }
  };

  return (
    <div className="container">
      {!isLoading && (
        <div>
          <h1>Web Security Scanner</h1>
      <input
        type="text"
        placeholder="Введіть URL"
        value={targetUrl}
        onChange={(e) => setTargetUrl(e.target.value)}
        disabled={isLoading} // Заборона введення під час завантаження
      />
      <select
        value={scanType}
        onChange={(e) => setScanType(e.target.value)}
        disabled={isLoading} // Заборона зміни типу сканування під час завантаження
      >
        <option value="all">Усі вразливості</option>
        <option value="sql_injection">SQL Injection</option>
        <option value="xss">XSS</option>
        <option value="csrf">CSRF</option>
          </select>
          <button onClick={startScan} disabled={isLoading}>
        {isLoading ? 'Сканування...' : 'Розпочати сканування'}
      </button>
        </div>
      ) }
      

    
      {isLoading && (
        <div className="loading-indicator">
          <div className="spinner"></div>
          <p>Сканування розпочато, зачекайте...</p>
        </div>
      )}
    </div>
  );
}

export default ScanForm;
