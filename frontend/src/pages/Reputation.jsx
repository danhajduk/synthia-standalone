// src/pages/Reputation.jsx
import React, { useEffect, useState } from 'react';
import Sidebar from '../components/Sidebar';
import Header from '../components/Header';
import SynthiaAvatar from '../components/SynthiaAvatar';

const th = { padding: '0.75rem', textAlign: 'left' };
const td = { padding: '0.75rem' };

export default function Reputation() {
  const [senders, setSenders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetch('/api/gmail/reputation')
      .then(res => {
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        return res.json();
      })
      .then(data => {
        setSenders(data.senders || []);
        setLoading(false);
      })
      .catch(err => {
        console.error('Failed to load reputation data:', err);
        setError(err.message);
        setLoading(false);
      });
  }, []);

  return (
    <div style={{ display: 'flex', minHeight: '100vh' }}>
      <Sidebar />
      <main style={{ flex: 1, padding: '1.5rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '1rem' }}>
          <SynthiaAvatar />
          <Header />
        </div>

        <h2 style={{ marginBottom: '1.5rem' }}>Sender Reputation Overview</h2>

        {loading ? (
          <p>Loading reputation data...</p>
        ) : error ? (
          <p style={{ color: 'red' }}>Error: {error}</p>
        ) : (
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ background: '#374151', color: '#fff' }}>
                <th style={th}>Sender Email</th>
                <th style={th}>Name</th>
                <th style={th}>Reputation</th>
                <th style={th}>Top Label</th>
                <th style={th}>Email Count</th>
                <th style={th}>Last Updated</th>
              </tr>
            </thead>
            <tbody>
              {senders.map((sender, idx) => {
                const labelCounts = sender.counts || {};
                const [topLabel, count] = Object.entries(labelCounts).sort((a, b) => b[1] - a[1])[0] || ["—", 0];

                return (
                  <tr key={idx} style={{ borderBottom: '1px solid #4b5563', color: '#e5e7eb' }}>
                    <td style={td}>{sender.email}</td>
                    <td style={td}>{sender.name}</td>
                    <td style={td}>{sender.state} ({(sender.score * 100).toFixed(0)}%)</td>
                    <td style={td}>{topLabel}</td>
                    <td style={td}>{count}</td>
                    <td style={td}>{new Date(sender.updated).toLocaleString()}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        )}

        <footer style={{ marginTop: '3rem', fontSize: '0.875rem', color: '#9ca3af' }}>
          Synthia v1.0.0
        </footer>
      </main>
    </div>
  );
}
