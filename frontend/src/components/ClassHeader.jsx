import React from 'react';
import { getGreeting, getSummaryLine } from '../utils/greetingUtils';

const Header = ({ data }) => {
  // Ensure data is always an object with default values
  const { train_size = 'N/A', test_size = 'N/A', accuracy = 0 } = data || {};

  const now = new Date();
  const formattedTime = now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  const formattedDate = now.toLocaleDateString();

  return (
    <div className="flex flex-col justify-center">
        <h1 style={{ marginBottom: '.5rem' }}>Model Metrics</h1>
        <h2 style={{ marginBottom: '0.1' }}> See the Local model information below:</h2>
        <p>
          <strong>Train Size:</strong> {train_size} | 
          <strong>  Test Size:</strong> {test_size} | 
          <strong>  Accuracy:</strong> {(accuracy * 100).toFixed(2)}%
        </p>
    </div>
  );
};

export default Header;
