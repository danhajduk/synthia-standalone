import React from 'react';
import { useNavigate } from 'react-router-dom';
import SynthiaButton from '../components/SynthiaButton';

export default function ClassifierFetchControls() {
  const navigate = useNavigate();

  const buttons = [
    {
      type: 'loading',
      label: "Fetch Today's Emails",
      loadingLabel: "Fetching...",
      icon: "📥",
      endpoint: "/api/gmail/fetch",
      method: "GET"
    },
    {
      type: 'loading',
      label: "Fetch Last 14 Days",
      loadingLabel: "Fetching...",
      icon: "🗓️",
      endpoint: "/api/gmail/fetch14",
      method: "GET"
    },
    {
      type: 'loading',
      label: "Fetch Last 90 Days",
      loadingLabel: "Fetching...",
      icon: "📆",
      endpoint: "/api/gmail/fetch90",
      method: "GET"
    },
    {
      type: 'loading',
      label: "Reprocess All Emails",
      loadingLabel: "Reprocessing...",
      icon: "♻️",
      endpoint: "/api/gmail/reprocess",
      method: "POST"
    },
    {
      type: 'loading',
      label: "Export Labeled Dataset",
      loadingLabel: "Exporting...",
      icon: "📤",
      endpoint: "/api/gmail/export",
      method: "GET"
    },
    {
      type: 'loading',
      label: "Download Model Snapshot",
      loadingLabel: "Downloading...",
      icon: "💾",
      endpoint: "/api/gmail/download-model",
      method: "GET"
    },
    {
      type: 'link',
      label: "Manual Classification",
      icon: "🧠",
      to: "/classifier/manual-classifier"
    },
    {
      type: 'link',
      label: "View Sender Reputation",
      icon: "📊",
      to: "/classifier/reputation"
    }
  ];

  return (
    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.75rem', marginTop: '2rem' }}>
      {buttons.map((btn, idx) => (
        <SynthiaButton
          key={idx}
          type={btn.type}
          label={btn.label}
          loadingLabel={btn.loadingLabel}
          icon={btn.icon}
          endpoint={btn.endpoint}
          method={btn.method}
          navigateTo={btn.to}
          onSuccess={(data) => console.log("✅ Success", data)}
          onError={(err) => alert(`❌ Failed: ${err.message}`)}
        />
      ))}
    </div>
  );
}
