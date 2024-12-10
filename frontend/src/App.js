import React, { useState, useEffect } from 'react';
import { Document, Packer, Paragraph, TextRun } from 'docx';
import { saveAs } from 'file-saver';
import jsPDF from 'jspdf';
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
    const response = await axios.get('http://localhost:5000/scan-status', {
      params: { scanId },
    });

    if (response.data.alerts) {
      setVulnerabilities(response.data.alerts);
      setStatus('Сканування завершено. Вразливості завантажено.');
    } else {
      setStatus('Сканування завершено, але вразливостей не знайдено.');
    }
  } catch (error) {
    console.error('Помилка при отриманні вразливостей:', error.message);
    setStatus('Помилка при отриманні вразливостей.');
  }
};
const sanitizeText = (text) => {
  return text
    .toString() // Переконайтесь, що це рядок
    .replace(/[^\x20-\x7E\u0400-\u04FF]/g, ''); // Допускаємо тільки стандартні ASCII та кирилицю
};

// Очищення даних
const sanitizedVulnerabilities = vulnerabilities.map((vuln) => ({
  alert: sanitizeText(vuln.alert),
  risk: sanitizeText(vuln.risk),
  description: sanitizeText(vuln.description),
}));


const generateReport = () => {
  const doc = new jsPDF();
  const pageWidth = doc.internal.pageSize.width; // Page width
  const pageHeight = doc.internal.pageSize.height; // Page height
  const marginLeft = 10;
  const marginRight = 10;
  const contentWidth = pageWidth - marginLeft - marginRight; // Width for text
  const marginTop = 10;
  const lineHeight = 10;
  let yPos = marginTop;

  // Set font
  doc.setFont('helvetica', 'normal');

  // Title
  doc.setFontSize(16);
  doc.text('Scan Report', marginLeft, yPos);
  yPos += lineHeight * 2;

  // Scan information
  doc.setFontSize(12);
  doc.text(`Target URL: ${targetUrl}`, marginLeft, yPos, { maxWidth: contentWidth });
  yPos += lineHeight;
  doc.text(`Alert Count: ${vulnerabilities.length}`, marginLeft, yPos, { maxWidth: contentWidth });
  yPos += lineHeight * 2;

  // Output vulnerabilities
  vulnerabilities.forEach((vuln, index) => {
    if (yPos + lineHeight * 5 > pageHeight) {
      doc.addPage();
      yPos = marginTop;
    }

    const sanitizeText = (text) => {  
      return text
        ? text.replace(/[^\x20-\x7E]/g, '') // Remove non-ASCII characters
        : 'N/A';
    }
      

    doc.text(`Alert ${index + 1}:`, marginLeft, yPos, { maxWidth: contentWidth });
    yPos += lineHeight;

    const alertText = `- Type: ${sanitizeText(vuln.alert)}`;
    const wrappedAlert = doc.splitTextToSize(alertText, contentWidth);
    doc.text(wrappedAlert, marginLeft, yPos);
    yPos += wrappedAlert.length * lineHeight;

    const riskText = `- Risk: ${sanitizeText(vuln.risk)}`;
    const wrappedRisk = doc.splitTextToSize(riskText, contentWidth);
    doc.text(wrappedRisk, marginLeft, yPos);
    yPos += wrappedRisk.length * lineHeight;

    const descriptionText = `- Description: ${sanitizeText(vuln.description)}`;
    const wrappedDescription = doc.splitTextToSize(descriptionText, contentWidth);
    doc.text(wrappedDescription, marginLeft, yPos);
    yPos += wrappedDescription.length * lineHeight * 1.5;
  });

  // Save the file
  const filename = `${targetUrl.replace(/https?:\/\//, '').replace(/[^\w]/g, '_')}.pdf`;
  doc.save(filename);
};



const generateWordReport = async () => {
  // Створення документа
  const doc = new Document({
    creator: 'Web Scanner',
    title: 'Scan Report',
    sections: [
      {
        properties: {},
        children: [
          // Заголовок
          new Paragraph({
            children: [
              new TextRun({ text: 'Scan Report', bold: true, size: 28 }),
            ],
          }),
          // Цільовий URL та кількість вразливостей
          new Paragraph({ text: `Target URL: ${targetUrl}` }),
          new Paragraph({ text: `Alert Count: ${vulnerabilities.length}` }),
          // Секція з вразливостями
          ...vulnerabilities.map((vuln, index) => [
            // Оповіщення (тип, ризик, опис, URL)
            new Paragraph({
              children: [
                new TextRun({ text: `Alert ${index + 1}:`, bold: true }),
              ],
            }),
            new Paragraph({
              children: [
                new TextRun({ text: `Type: ${vuln.alert}` }),
              ],
            }),
            new Paragraph({
              children: [
                new TextRun({ text: `Risk: ${vuln.risk}` }),
              ],
            }),
            new Paragraph({
              children: [
                new TextRun({ text: `Description: ${vuln.description}` }),
              ],
            }),
            new Paragraph({
              children: [
                new TextRun({ text: `URL: ${vuln.url}` }),
              ],
            }),
          ]).flat(), // Використовуємо .flat(), щоб всі абзаци були в одному масиві
        ],
      },
    ],
  });

  // Перетворення документа в blob і збереження як .docx
  const buffer = await Packer.toBlob(doc);
  saveAs(buffer, `${targetUrl.replace(/https?:\/\//, '').replace(/[^\w]/g, '_')}.docx`);
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
        <h2>Загальна інформація:</h2>
        <p><strong>URL:</strong> {targetUrl}</p>
        <p><strong>Кількість знайдених вразливостей:</strong> {vulnerabilities.length}</p>

        <div>
          <button onClick={generateReport}>Завантажити звіт (PDF)</button>
          <button onClick={generateWordReport}>Завантажити звіт (Word)</button>
        </div>
      </div>
    )}
  </div>
);

}

export default App;
