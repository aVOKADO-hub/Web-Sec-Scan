import React, { useEffect } from 'react';
import axios from 'axios';
import '../style/style.css';

function ScanStatus({ scanId, progress, setProgress, setStatus }) {
  useEffect(() => {
    if (scanId && progress < 100) {
      const interval = setInterval(async () => {
        try {
          const response = await axios.get('http://localhost:5000/scan-status', {
            params: { scanId },
          });

          const scanProgress = parseInt(response.data.status, 10);
          setProgress(scanProgress);
          setStatus(`Сканування: ${scanProgress}% завершено`);

          if (scanProgress === 100) {
            clearInterval(interval);
          }
        } catch (error) {
          setStatus('Помилка при отриманні статусу');
          clearInterval(interval);
        }
      }, 1000);

      return () => clearInterval(interval);
    }
  }, [scanId, progress]);

  return (
    <div className="progress-bar">
      <div style={{ width: `${progress}%` }} />
    </div>
  );
}

export default ScanStatus;
