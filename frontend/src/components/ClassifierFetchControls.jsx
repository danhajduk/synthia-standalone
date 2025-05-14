import React from 'react';
import { useNavigate } from 'react-router-dom';

export default function ClassifierFetchControls() {
  const navigate = useNavigate();
  const buttons = [
    { label: "Fetch Today's Mail", onClick: () => console.log("Fetch today") },
    { label: "Fetch Last 14 Days", onClick: () => console.log("Fetch 14 days") },
    { label: "Fetch Last 90 Days", onClick: () => console.log("Fetch 90 days") },
    { label: "Manual Classification", onClick: () => navigate("/classifier/manual-classifier") },
    { label: "View Sender Reputation", onClick: () => navigate("/classifier/reputation") },
    { label: "Reprocess All Emails", onClick: () => console.log("Reprocess all") },
    { label: "Export Labeled Dataset", onClick: () => console.log("Export dataset") },
    { label: "Download Model Snapshot", onClick: () => console.log("Download snapshot") }
  ];

  return (
    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.75rem', marginTop: '2rem' }}>
      {buttons.map((btn, idx) => (
        <button
          key={idx}
          onClick={btn.onClick}
          style={{
            padding: '0.5rem 1rem',
            background: '#2563eb',
            color: '#fff',
            border: 'none',
            borderRadius: '0.375rem',
            cursor: 'pointer',
            fontSize: '0.875rem'
          }}
        >
          {btn.label}
        </button>
      ))}
    </div>
  );
}
