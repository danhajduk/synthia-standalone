// src/pages/Reputation.jsx
import React from 'react';
import Sidebar from '../components/Sidebar';
import Header from '../components/Header';
import SynthiaAvatar from '../components/SynthiaAvatar';

const mockSenders = [
  {
    email: 'promo@dealsnow.com',
    reputation: 'Low',
    label: 'Suspected Spam',
    emailsReceived: 47,
    lastSeen: '2025-05-12 14:32'
  },
  {
    email: 'boss@workplace.com',
    reputation: 'High',
    label: 'Work',
    emailsReceived: 189,
    lastSeen: '2025-05-13 09:10'
  },
  {
    email: 'unknown@phishy.net',
    reputation: 'Dangerous',
    label: 'Phishing',
    emailsReceived: 3,
    lastSeen: '2025-05-12 08:45'
  }
];

export default function Reputation() {
  return (
    <div style={{ display: 'flex', minHeight: '100vh' }}>
      <Sidebar />
      <main style={{ flex: 1, padding: '1.5rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '1rem' }}>
          <SynthiaAvatar />
          <Header />
        </div>

        <h2 style={{ marginBottom: '1.5rem' }}>Sender Reputation Overview</h2>

        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead>
            <tr style={{ background: '#374151', color: '#fff' }}>
              <th style={th}>Sender Email</th>
              <th style={th}>Reputation</th>
              <th style={th}>Current Label</th>
              <th style={th}>Emails Received</th>
              <th style={th}>Last Seen</th>
              <th style={th}></th>
            </tr>
          </thead>
          <tbody>
            {mockSenders.map((sender, idx) => (
              <tr key={idx} style={{ borderBottom: '1px solid #4b5563', color: '#e5e7eb' }}>
                <td style={td}>{sender.email}</td>
                <td style={td}>{sender.reputation}</td>
                <td style={td}>{sender.label}</td>
                <td style={td}>{sender.emailsReceived}</td>
                <td style={td}>{sender.lastSeen}</td>
                <td style={td}>
                  <button style={{ padding: '0.25rem 0.75rem', background: '#22c55e', color: 'white', border: 'none', borderRadius: '0.25rem' }}>
                    Reclassify
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        <footer style={{ marginTop: '3rem', fontSize: '0.875rem', color: '#9ca3af' }}>
          Synthia v1.0.0
        </footer>
      </main>
    </div>
  );
}

const th = {
  padding: '0.75rem',
  textAlign: 'left'
};

const td = {
  padding: '0.75rem'
};
