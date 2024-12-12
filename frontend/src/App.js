import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import ScanForm from './components/ScanForm';
import ScanResults from './components/ScanResults';

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<ScanForm />} />
        <Route path="/results" element={<ScanResults />} />
      </Routes>
    </Router>
  );
}

export default App;
