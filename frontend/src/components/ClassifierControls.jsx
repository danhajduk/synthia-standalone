import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useStatusAction } from '../hooks/useStatusAction';

export default function ClassifierControls({ onBadgeUpdate }) {
  const [threshold, setThreshold] = useState(0.5);
  const navigate = useNavigate();
  const { trigger } = useStatusAction();

  const localButtons = [
    { label: "Retrain Model", action: () => console.log("Retrain Model") },
    { label: "Re-evaluate Now", action: () => console.log("Re-evaluate Now") },
    { label: "Export Report", action: () => console.log("Export Report") },
    { label: "Reset Threshold", action: () => setThreshold(0.5) },
    { label: "Clear DB Labels", action: () => console.log("Clear DB Labels") },
    { label: "Sync with Gmail", action: () => console.log("Sync with Gmail") },
    { label: "Manual Classification", action: () => navigate("/classifier/manual-classifier") },
    { label: "Sender Reputation", action: () => navigate("/classifier/reputation") }
  ];

  const remoteButtons = [
    {
      label: "Classify One Batch",
      action: () => trigger('/api/gmail/debug/classify-one-batch', () => {
        setTimeout(() => {
          onBadgeUpdate(); // refresh stats after delay
        }, 2000);
      })
   },
    {
      label: "Classify All",
      action: () => trigger('/api/gmail/debug/classify-all', () => {
        setTimeout(() => {
          onBadgeUpdate(); // refresh stats after delay
        }, 2000);
      })
    }
  ];
  
  return (
    <div style={{ minWidth: '220px', marginTop: '2rem', display: 'flex', flexDirection: 'column', gap: '2rem' }}>
      
      {/* 🧠 Local Model Controls */}
      <div>
        <h3 style={{ marginBottom: '1rem' }}>Classifier Controls</h3>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
          {localButtons.map((btn, idx) => (
            <button
              key={idx}
              onClick={btn.action}
              style={{
                padding: '0.5rem 1rem',
                background: '#4b5563',
                color: '#fff',
                border: 'none',
                borderRadius: '0.375rem',
                cursor: 'pointer'
              }}
            >
              {btn.label}
            </button>
          ))}
        </div>
        <div style={{ marginTop: '1rem' }}>
          <label style={{ color: '#e5e7eb', fontSize: '0.875rem' }}>Model Threshold:</label>
          <input
            type="number"
            min="0"
            max="1"
            step="0.01"
            value={threshold}
            onChange={(e) => setThreshold(parseFloat(e.target.value))}
            style={{
              width: '100%',
              padding: '0.5rem',
              marginTop: '0.25rem',
              borderRadius: '0.375rem',
              border: '1px solid #4b5563',
              background: '#1f2937',
              color: '#fff'
            }}
          />
        </div>
      </div>

      {/* ☁️ Remote AI Classification */}
      <div>
        <h3 style={{ marginBottom: '1rem' }}>Remote Classification</h3>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
          {remoteButtons.map((btn, idx) => (
            <button
              key={idx}
              onClick={btn.action}
              style={{
                padding: '0.5rem 1rem',
                background: '#6b21a8',
                color: 'white',
                border: 'none',
                borderRadius: '0.375rem',
                cursor: 'pointer'
              }}
            >
              {btn.label}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
