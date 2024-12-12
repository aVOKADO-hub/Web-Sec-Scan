import React from 'react';
import jsPDF from 'jspdf';
import { Document, Packer, Paragraph, TextRun } from 'docx';
import { saveAs } from 'file-saver';

function ExportButtons({ targetUrl, vulnerabilities }) {
  const generatePDF = () => {
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
    if (yPos + lineHeight * 6 > pageHeight) {
      doc.addPage();
      yPos = marginTop;
    }

    const sanitizeText = (text) =>  
      text ? text.replace(/[^\x20-\x7E]/g, '') : 'N/A'; // Remove non-ASCII characters

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
    yPos += wrappedDescription.length * lineHeight;

    const solutionText = `- Solution: ${sanitizeText(vuln.solution || 'No solution provided.')}`;
    const wrappedSolution = doc.splitTextToSize(solutionText, contentWidth);
    doc.text(wrappedSolution, marginLeft, yPos);
    yPos += wrappedSolution.length * lineHeight * 1.5;
  });

  // Save the file
  const filename = `${targetUrl.replace(/https?:\/\//, '').replace(/[^\w]/g, '_')}.pdf`;
  doc.save(filename);
};


  const generateWord = async () => {
  const sanitizeText = (text) =>  
    text ? text.replace(/[^\x20-\x7E]/g, '') : 'N/A'; // Remove non-ASCII characters

  const doc = new Document({
    sections: [
      {
        children: [
          // Заголовок
          new Paragraph({
            children: [
              new TextRun({
                text: 'Scan Report',
                bold: true,
                size: 28,
              }),
            ],
          }),
          new Paragraph({
            children: [
              new TextRun({
                text: `Target URL: ${targetUrl}`,
                size: 24,
              }),
            ],
          }),
          new Paragraph({
            children: [
              new TextRun({
                text: `Alert Count: ${vulnerabilities.length}`,
                size: 24,
              }),
            ],
          }),
          new Paragraph({ text: '' }), // Порожній рядок

          // Виведення вразливостей
          ...vulnerabilities.map((vuln, index) => [
            new Paragraph({
              children: [
                new TextRun({
                  text: `Alert ${index + 1}:`,
                  bold: true,
                  size: 24,
                }),
              ],
            }),
            new Paragraph({
              children: [
                new TextRun({
                  text: `- Type: ${sanitizeText(vuln.alert)}`,
                  size: 22,
                }),
              ],
            }),
            new Paragraph({
              children: [
                new TextRun({
                  text: `- Risk: ${sanitizeText(vuln.risk)}`,
                  size: 22,
                }),
              ],
            }),
            new Paragraph({
              children: [
                new TextRun({
                  text: `- Description: ${sanitizeText(vuln.description)}`,
                  size: 22,
                }),
              ],
            }),
            new Paragraph({
              children: [
                new TextRun({
                  text: `- Solution: ${sanitizeText(vuln.solution || 'No solution provided.')}`,
                  size: 22,
                }),
              ],
            }),
            new Paragraph({ text: '' }), // Порожній рядок між вразливостями
          ]).flat(),
        ],
      },
    ],
  });

  // Генерація та збереження файлу
  const buffer = await Packer.toBlob(doc);
  const filename = `${targetUrl.replace(/https?:\/\//, '').replace(/[^\w]/g, '_')}.docx`;
  saveAs(buffer, filename);
};


  return (
    <div>
      <button onClick={generatePDF}>Завантажити PDF</button>
      <button onClick={generateWord}>Завантажити Word</button>
    </div>
  );
}

export default ExportButtons;
