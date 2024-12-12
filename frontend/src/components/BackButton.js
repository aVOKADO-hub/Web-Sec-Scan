import React from 'react';
import { useNavigate } from 'react-router-dom';
import '../style/style.css';

function BackButton() {
  const navigate = useNavigate();
  return <button className="back-button" onClick={() => navigate('/')}>Повернутися на головну</button>;
}

export default BackButton;
