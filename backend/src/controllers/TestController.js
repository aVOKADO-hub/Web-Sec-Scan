import TestService from '../services/TestService.js';
import axios from 'axios';
class TestController {
    // SQL Injection Testing Logic
 testSQLInjection = async (req, res) => {
  const { url } = req.body;
  const payloads = ["' OR '1'='1", "'; DROP TABLE users;--", "admin'--"];
  const results = [];

  for (const payload of payloads) {
    try {
      const response = await axios.post(url, { input: payload });
      results.push({ payload, success: true, data: response.data });
    } catch (error) {
      results.push({ payload, success: false, error: error.message });
    }
  }

  res.json({ type: 'SQL Injection', url, results });
};

// XSS Testing Logic
testXSS = async (req, res) => {
  const { url } = req.body;
  const payload = `<script>alert('XSS Test')</script>`;
  
  try {
    const browser = await puppeteer.launch();
    const page = await browser.newPage();
    await page.goto(url);

    await page.evaluate((injection) => {
      document.body.innerHTML = injection;
    }, payload);

    res.json({ type: 'XSS', url, payload, success: true });
    await browser.close();
  } catch (error) {
    res.json({ type: 'XSS', url, payload, success: false, error: error.message });
  }
};

// HTTP Headers Testing Logic
checkHeaders = async (req, res) => {
  const { url } = req.body;

  try {
    const response = await axios.get(url);
    const headers = response.headers;
    const missingHeaders = [];

    if (!headers['content-security-policy']) missingHeaders.push('Content-Security-Policy');
    if (!headers['x-frame-options']) missingHeaders.push('X-Frame-Options');
    if (!headers['strict-transport-security']) missingHeaders.push('Strict-Transport-Security');

    res.json({ type: 'HTTP Headers', url, headers, missingHeaders });
  } catch (error) {
    res.json({ type: 'HTTP Headers', url, success: false, error: error.message });
  }
};
}

export default new TestController();
