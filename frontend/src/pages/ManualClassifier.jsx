// src/pages/ManualClassifier.jsx
import React, { useState } from 'react';
import Sidebar from '../components/Sidebar';
import Header from '../components/Header';
import SynthiaAvatar from '../components/SynthiaAvatar';

export default function ManualClassifier() {
  const [tab, setTab] = useState('flagged');

  const placeholderEmails = [
    {
      id: 1,
      sender: "amazon@example.com",
      subject: "Your order has shipped!",
      snippet: "Track your package and get delivery updates.",
      suggested: "Receipts",
      confidence: 0.61
    },
    {
      id: 2,
      sender: "newsletter@news.com",
      subject: "Top headlines of the day",
      snippet: "Get your daily dose of current events...",
      suggested: "Suspected Spam",
      confidence: 0.48
    },
    {
      id: 3,
      sender: "boss@workplace.com",
      subject: "Team meeting follow-up",
      snippet: "Please review the attached notes and tasks.",
      suggested: "Work",
      confidence: 0.75
    }
  ];

  const labelOptions = [
    "Important",
    "Data",
    "Regular",
    "Work",
    "Personal",
    "Social",
    "Newsletters",
    "Notifications",
    "Receipts",
    "System Updates",
    "Flagged for Review",
    "Suspected Spam",
    "Phishing",
    "Blacklisted"
  ];

  const filteredEmails = tab === 'suspected'
    ? placeholderEmails.filter(email => email.suggested === 'Suspected Spam')
    : tab === 'reviewed'
    ? placeholderEmails.filter(email => email.suggested !== 'Suspected Spam' && email.suggested !== 'Flagged for Review')
    : placeholderEmails.filter(email => email.suggested === 'Flagged for Review');

  return (
    <div style={{ display: 'flex', minHeight: '100vh' }}>
      <Sidebar />
      <main style={{ flex: 1, padding: '1.5rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '1rem' }}>
          <SynthiaAvatar />
          <Header />
        </div>

        <h2 style={{ marginBottom: '1rem' }}>Manual Email Classification</h2>

        <div style={{ display: 'flex', gap: '1rem', marginBottom: '1.5rem' }}>
          <button onClick={() => setTab('flagged')} style={{ padding: '0.5rem 1rem', background: tab === 'flagged' ? '#2563eb' : '#4b5563', color: 'white', border: 'none', borderRadius: '0.375rem' }}>Flagged for Review</button>
          <button onClick={() => setTab('suspected')} style={{ padding: '0.5rem 1rem', background: tab === 'suspected' ? '#2563eb' : '#4b5563', color: 'white', border: 'none', borderRadius: '0.375rem' }}>Suspected Spam</button>
          <button onClick={() => setTab('reviewed')} style={{ padding: '0.5rem 1rem', background: tab === 'reviewed' ? '#2563eb' : '#4b5563', color: 'white', border: 'none', borderRadius: '0.375rem' }}>Reviewed by Classifier</button>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          {filteredEmails.map(email => (
            <div key={email.id} style={{ background: '#1f2937', color: '#fff', padding: '1rem', borderRadius: '0.5rem' }}>
              <div style={{ fontSize: '0.9rem', color: '#9ca3af' }}>{email.sender}</div>
              <div style={{ fontWeight: 'bold', marginTop: '0.25rem' }}>{email.subject}</div>
              <div style={{ fontSize: '0.875rem', marginTop: '0.25rem' }}>{email.snippet}</div>
              <div style={{ marginTop: '0.5rem', fontSize: '0.875rem' }}>
                <strong>Suggested Label:</strong> {email.suggested} | <strong>Confidence:</strong> {(email.confidence * 100).toFixed(1)}%
              </div>
              <div style={{ marginTop: '0.5rem' }}>
                <select style={{ padding: '0.25rem 0.5rem', marginRight: '0.5rem' }}>
                  <option>Choose label...</option>
                  {labelOptions.map(label => (
                    <option key={label} value={label}>{label}</option>
                  ))}
                </select>
                <button style={{ padding: '0.25rem 0.75rem', background: '#22c55e', color: 'white', border: 'none', borderRadius: '0.25rem' }}>Confirm</button>
              </div>
            </div>
          ))}
        </div>

        <footer style={{ marginTop: '3rem', fontSize: '0.875rem', color: '#9ca3af' }}>
          Synthia v1.0.0
        </footer>
      </main>
    </div>
  );
}
