import React, { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import axios from 'axios';
import ExportButtons from './ExportButtons';
import BackButton from './BackButton';
import ScanStatus from './ScanStatus';
import newsList from './InfoString';
import '../style/style.css';

function ScanResults() {
  const location = useLocation();
  const { targetUrl, scanId } = location.state;
  const [progress, setProgress] = useState(0);
  const [status, setStatus] = useState('');
  const [vulnerabilities, setVulnerabilities] = useState([]);
  const [currentNews, setCurrentNews] = useState('');
  const [fadeState, setFadeState] = useState('fade-in');

  useEffect(() => {
    // Змінювати новини кожні 5 секунд з анімацією
    const interval = setInterval(() => {
      setFadeState('fade-out'); // Початок анімації зникнення
      
      setTimeout(() => {
        const randomNews = newsList[Math.floor(Math.random() * newsList.length)];
        setCurrentNews(randomNews); // Оновити новину
        setFadeState('fade-in'); // Початок анімації появи
      }, 500); // Час має збігатися з тривалістю анімації у CSS
    }, 5000);

    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    if (progress === 100) {
      fetchVulnerabilities();
    }
  }, [progress]);

  const fetchVulnerabilities = async () => {
    try {
      const response = await axios.get('http://localhost:5000/scan-status', {
        params: { scanId },
      });
      setVulnerabilities(response.data.alerts || []);
    } catch (error) {
      setStatus('Помилка при отриманні вразливостей.');
    }
  };

  return (
    <div className="container">
      <h1>Результати сканування</h1>
      <ScanStatus scanId={scanId} progress={progress} setProgress={setProgress} setStatus={setStatus} />
      <p>{status}</p>

      {progress < 100 && progress>0&& (
        <div className="news-section">
          <h4>Цікаві факти про безпеку:</h4>
          <p className={`news-text ${fadeState}`}>{currentNews}</p>
        </div>
      )}

      {vulnerabilities.length > 0 && (
        <div>
          <p><strong>Кількість вразливостей:</strong> {vulnerabilities.length}</p>
          <ExportButtons targetUrl={targetUrl} vulnerabilities={vulnerabilities} />
        </div>
      )}
      <BackButton />
    </div>
  );
}

export default ScanResults;

