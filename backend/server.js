import express from 'express';
import axios from 'axios';
import cors from 'cors';
import mongoose from 'mongoose';
import Scan from './src/models/scanSchema.js';
import Vulnerability from './src/models/vulnerabilitySchema.js';

const port = 5000;
const app = express();

mongoose.connect('mongodb://localhost:27017/web_security_scanner', {
  useNewUrlParser: true,
  useUnifiedTopology: true,
})
  .then(() => console.log('MongoDB connected'))
  .catch((err) => console.error('MongoDB connection error:', err));

const zapUrl = 'http://localhost:8081';
const apiKey = '2hn0shm52r1s0e8890kjoegp45';

app.use(cors({
  origin: 'http://localhost:3000',
}));

const addUrlToTree = async (targetUrl) => {
  try {
    const response = await axios.get(`${zapUrl}/JSON/spider/action/scan`, {
      params: {
        url: targetUrl,
        apikey: apiKey,
        maxChildren: 0,
      },
    });
    return response.data;
  } catch (error) {
    console.error('Error adding URL to ZAP tree:', error.response?.data || error.message);
    throw new Error('Failed to add URL to ZAP tree');
  }
};

const startScan = async (targetUrl, scanType = 'all') => {
  try {
    const response = await axios.get(`${zapUrl}/JSON/ascan/action/scan`, {
      params: {
        url: targetUrl,
        apikey: apiKey,
        scanType,
      },
    });
    return response.data;
  } catch (error) {
    console.error('Error starting active scan:', error.response?.data || error.message);
    throw new Error('Failed to start active scan');
  }
};

const getSpiderStatus = async () => {
  try {
    const response = await axios.get(`${zapUrl}/JSON/spider/view/status`, {
      params: { apikey: apiKey },
    });
    return response.data.status;
  } catch (error) {
    console.error('Error getting spider status:', error.message);
    throw new Error('Failed to get spider status');
  }
};

app.get('/scan', async (req, res) => {
  const { target, scanType } = req.query;

  if (!target) {
    return res.status(400).json({ error: 'Target URL is required' });
  }

  try {
    const spiderResponse = await addUrlToTree(target);

    let spiderStatus = 0;
    while (parseInt(spiderStatus, 10) !== 100) {
      spiderStatus = await getSpiderStatus();
      console.log(`Spider status: ${spiderStatus}`);
      await new Promise((resolve) => setTimeout(resolve, 5000));
    }

    const scanResponse = await startScan(target, scanType);

    const scanData = new Scan({
  targetUrl: target,
  scanId: scanResponse.scan,
  scanType,
  status: 'Running',
  alert: 'Sample Alert', // Перевірка передачі
  risk: 'High',          // Перевірка передачі
  description: 'Sample description', // Перевірка передачі
});
await scanData.save();


    res.json({ message: 'Scan started successfully', scanId: scanResponse.scan });
  } catch (error) {
    console.error('Error during scan process:', error.message);
    res.status(500).json({ error: 'Failed to start scan', details: error.message });
  }
});

app.get('/scan-status', async (req, res) => {
  const { scanId } = req.query;

  if (!scanId) {
    return res.status(400).json({ error: 'Scan ID is required' });
  }

  try {
    const response = await axios.get(`${zapUrl}/JSON/ascan/view/status`, {
      params: {
        scanId,
        apikey: apiKey,
      },
    });

    const scan = await Scan.findOne({ scanId });
    if (!scan) {
      return res.status(404).json({ error: 'Scan not found in the database' });
    }

    scan.status = response.data.status;
    if (response.data.status === '100') {
      scan.endTime = new Date();
    }
    await scan.save();

    res.json(response.data);
  } catch (error) {
    console.error('Error getting scan status:', error.message);
    res.status(500).json({ error: 'Failed to get scan status', details: error.message });
  }
});





app.get('/vulnerabilities', async (req, res) => {
  const { scanId } = req.query;

  console.log(`${typeof scanId} + ${scanId}`)

  if (!scanId) {
    return res.status(400).json({ error: 'Scan ID is required' });
  }

  try {
    const vulnerabilities = await Scan.find({ scanId: String(scanId) });

    console.log('Found vulnerabilities count:', vulnerabilities.length); // Кількість знайдених вразливостей

    if (!vulnerabilities.length) {
      return res.status(404).json({ error: 'No vulnerabilities found for the given scan ID' });
    }

    return res.json(vulnerabilities);
  } catch (error) {
    console.error('Error fetching vulnerabilities:', error.message);
    return res.status(500).json({ error: 'Failed to fetch vulnerabilities' });
  }
});



app.listen(port, () => {
  console.log(`Server running at http://localhost:${port}`);
});
