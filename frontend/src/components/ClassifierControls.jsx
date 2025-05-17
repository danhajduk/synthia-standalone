import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useStatusAndRefresh } from '../hooks/useStatusAndRefresh';
import SynthiaButton from '../components/SynthiaButton';

export default function ClassifierControls({ onBadgeUpdate }) {
  const [threshold, setThreshold] = useState(0.5);
  const navigate = useNavigate();
  const { trigger, loading } = useStatusAndRefresh();

  const localButtons = [
    { type: 'action', label: "Retrain Model", icon: "🧠", onClick: () => console.log("Retrain Model") },
    { type: 'action', label: "Re-evaluate Now", icon: "🔁", onClick: () => console.log("Re-evaluate Now") },
    { type: 'action', label: "Export Report", icon: "📄", onClick: () => console.log("Export Report") },
    { type: 'action', label: "Reset Threshold", icon: "🎯", onClick: () => setThreshold(0.5) },
    { type: 'action', label: "Clear DB Labels", icon: "🗑️", onClick: () => console.log("Clear DB Labels") },
    { type: 'action', label: "Sync with Gmail", icon: "🔄", onClick: () => console.log("Sync with Gmail") },
    { type: 'link', label: "Manual Classification", icon: "📝", to: "/classifier/manual-classifier" },
    { type: 'link', label: "Sender Reputation", icon: "📊", to: "/classifier/reputation" }
  ];

  const remoteButtons = [
    {
      type: 'loading',
      label: "Classify One Batch",
      loadingLabel: "Classifying...",
      icon: "🔬",
      endpoint: "/api/gmail/debug/classify-one-batch",
      method: "GET",
      onSuccess: onBadgeUpdate
    },
    {
      type: 'loading',
      label: "Classify All",
      loadingLabel: "Classifying...",
      icon: "🧪",
      endpoint: "/api/gmail/debug/classify-all",
      method: "GET",
      onSuccess: onBadgeUpdate
    }
  ];

  return (
    <div style={{ minWidth: '220px', marginTop: '2rem', display: 'flex', flexDirection: 'column', gap: '2rem' }}>
      
      {/* 🧠 Local Model Controls */}
      <div>
        <h3 style={{ marginBottom: '1rem' }}>Classifier Controls</h3>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
          {localButtons.map((btn, idx) => (
            <SynthiaButton
              key={idx}
              type={btn.type}
              label={btn.label}
              icon={btn.icon}
              navigateTo={btn.to}
              onClick={btn.onClick}
              style={{ background: '#4b5563' }}
            />
          ))}
        </div>

        <div>
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
            <SynthiaButton
              key={idx}
              type="loading"
              label={btn.label}
              loadingLabel={btn.loadingLabel}
              icon={btn.icon}
              endpoint={btn.endpoint}
              method={btn.method}
              disabled={loading}
              onSuccess={btn.onSuccess}
              onError={(err) => alert(`❌ ${err.message}`)}
              style={{ background: '#6b21a8' }}
            />
          ))}
        </div>
      </div>
    </div>
  );
}
