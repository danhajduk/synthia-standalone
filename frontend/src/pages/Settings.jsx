// src/pages/Settings.jsx
import React, { useState } from 'react';
import Sidebar from '../components/Sidebar';
import Header from '../components/Header';
import SynthiaAvatar from '../components/SynthiaAvatar';

export default function Settings() {
  const [daysToFetch, setDaysToFetch] = useState(7);
  const [status, setStatus] = useState('');

  const handleRetrain = async () => {
    try {
      setStatus('🔄 Retraining classifier...');
      const res = await fetch('/api/gmail/train');
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const data = await res.json();
      setStatus(`✅ Retrained: ${data.samples_trained || 'done'}`);
    } catch (err) {
      console.error(err);
      setStatus('❌ Failed to retrain');
    }
  };

  const handleRecalculate = async () => {
    try {
      setStatus('🔄 Recalculating reputations...');
      const res = await fetch('/api/gmail/reputation/recalculate', { method: 'POST' });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const data = await res.json();
      setStatus(`✅ Reputations updated: ${data.senders_updated}`);
    } catch (err) {
      console.error(err);
      setStatus('❌ Failed to recalculate');
    }
  };

  return (
    <div style={{ display: 'flex', minHeight: '100vh' }}>
      <Sidebar />
      <main style={{ flex: 1, padding: '1.5rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '1rem' }}>
          <SynthiaAvatar />
          <Header />
        </div>

        <h2 style={{ marginBottom: '1rem' }}>Settings</h2>

        <div style={{ marginBottom: '2rem' }}>
          <label style={{ color: '#e5e7eb', marginRight: '0.5rem' }}>📅 Days to fetch emails:</label>
          <input
            type="number"
            value={daysToFetch}
            onChange={(e) => setDaysToFetch(e.target.value)}
            style={{ padding: '0.5rem', borderRadius: '0.375rem', width: '80px' }}
          />
        </div>

        <div style={{ display: 'flex', gap: '1rem', marginBottom: '2rem' }}>
          <button onClick={handleRetrain} style={btnStyle}>🧠 Retrain Classifier</button>
          <button onClick={handleRecalculate} style={btnStyle}>📈 Recalculate Reputation</button>
        </div>

        {status && <div style={{ color: '#10b981', marginTop: '1rem' }}>{status}</div>}

        <footer style={{ marginTop: '3rem', fontSize: '0.875rem', color: '#9ca3af' }}>
          Synthia v1.0.0
        </footer>
      </main>
    </div>
  );
}

const btnStyle = {
  padding: '0.5rem 1rem',
  background: '#2563eb',
  color: '#fff',
  border: 'none',
  borderRadius: '0.375rem',
  cursor: 'pointer'
};
