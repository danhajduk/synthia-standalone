import React, { useState } from 'react';
import Sidebar from '../components/Sidebar';
import Header from '../components/Header';
import SynthiaAvatar from '../components/SynthiaAvatar';
import { useManualEmails } from '../hooks/useManualEmails';

export default function ManualClassifier() {
  const [tab, setTab] = useState('flagged');
  const [selectedLabels, setSelectedLabels] = useState({});
  const [senderFilter, setSenderFilter] = useState('');
  const { emails, loading, error } = useManualEmails(tab);

  const labelOptions = [
    "Important", "Data", "Regular", "Work", "Personal", "Social", "Newsletters",
    "Notifications", "Receipts", "System Updates", "Flagged for Review",
    "Suspected Spam", "Phishing", "Blacklisted"
  ];

  const handleLabelChange = (id, value) => {
    setSelectedLabels(prev => ({ ...prev, [id]: value }));
  };

  const handleConfirm = async (id) => {
    const label = selectedLabels[id];
    if (!label) return alert("Please select a label.");

    try {
      const res = await fetch('/api/gmail/manual-review/update-label', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id, new_label: label })
      });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      alert("✅ Label updated!");
    } catch (err) {
      console.error(err);
      alert("❌ Failed to update.");
    }
  };

  const baseFiltered = tab === 'suspected'
    ? emails.filter(email => email.suggested === 'Suspected Spam')
    : tab === 'reviewed'
    ? emails.filter(email => email.predicted_by && email.suggested !== 'Suspected Spam' && email.suggested !== 'Flagged For Review')
    : tab === 'local'
    ? emails.filter(email => email.predicted_by === 'local')
    : emails.filter(email => email.suggested === 'Flagged For Review');

  const filteredEmails = senderFilter
    ? baseFiltered.filter(email => email.sender === senderFilter)
    : baseFiltered;

  const allSenders = [...new Set(baseFiltered.map(e => e.sender))];

  const th = { padding: '0.75rem', textAlign: 'left' };
  const td = { padding: '0.75rem' };

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
          <button onClick={() => setTab('flagged')} style={tabBtn(tab === 'flagged')}>Flagged for Review</button>
          <button onClick={() => setTab('suspected')} style={tabBtn(tab === 'suspected')}>Suspected Spam</button>
          <button onClick={() => setTab('reviewed')} style={tabBtn(tab === 'reviewed')}>Reviewed by Classifier</button>
          <button onClick={() => setTab('local')} style={tabBtn(tab === 'local')}>Local Classifier</button>
        </div>

        {allSenders.length > 0 && (
          <div style={{ marginBottom: '1.5rem' }}>
            <label style={{ marginRight: '0.5rem', color: '#e5e7eb' }}>Filter by sender:</label>
            <select
              value={senderFilter}
              onChange={e => setSenderFilter(e.target.value)}
              style={{ padding: '0.4rem 0.75rem', borderRadius: '0.375rem', background: '#111827', color: '#fff' }}
            >
              <option value="">All Senders</option>
              {allSenders.map(sender => (
                <option key={sender} value={sender}>{sender}</option>
              ))}
            </select>
          </div>
        )}

        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          {tab === 'flagged' ? (
            <table style={{ width: '100%', borderCollapse: 'collapse', background: '#1f2937', color: '#fff', borderRadius: '0.5rem', overflow: 'hidden' }}>
              <thead>
                <tr style={{ background: '#374151' }}>
                  <th style={th}>Sender</th>
                  <th style={th}>Subject</th>
                  <th style={th}>Suggested</th>
                  <th style={th}>Confidence</th>
                  <th style={th}>Label</th>
                  <th style={th}></th>
                </tr>
              </thead>
              <tbody>
                {filteredEmails.map(email => (
                  <React.Fragment key={email.id}>
                    <tr style={{ borderBottom: '1px solid #4b5563' }}>
                      <td style={td}>{email.sender}</td>
                      <td style={td}>{email.subject}</td>
                      <td style={td}>{email.suggested}</td>
                      <td style={td}>{(email.confidence * 100).toFixed(1)}%</td>
                      <td style={td}>
                        <select
                          value={selectedLabels[email.id] || ""}
                          onChange={(e) => handleLabelChange(email.id, e.target.value)}
                          style={{ padding: '0.25rem', borderRadius: '0.25rem', background: '#111827', color: '#fff' }}
                        >
                          <option value="">Choose...</option>
                          {labelOptions.map(label => (
                            <option key={label} value={label}>{label}</option>
                          ))}
                        </select>
                      </td>
                      <td style={td}>
                        <button onClick={() => handleConfirm(email.id)} style={{ padding: '0.25rem 0.75rem', background: '#22c55e', color: '#fff', border: 'none', borderRadius: '0.25rem' }}>
                          Confirm
                        </button>
                      </td>
                    </tr>
                    <tr>
                      <td colSpan={6} style={{ ...td, background: '#111827', fontSize: '0.875rem', color: '#d1d5db' }}>
                        {email.body || <em>No content available.</em>}
                      </td>
                    </tr>
                  </React.Fragment>
                ))}
              </tbody>
            </table>
          ) : (
            filteredEmails.map(email => (
              <div key={email.id} style={{ background: '#1f2937', color: '#fff', padding: '1rem', borderRadius: '0.5rem' }}>
                <div style={{ fontSize: '0.9rem', color: '#9ca3af' }}>{email.sender}</div>
                <div style={{ fontWeight: 'bold', marginTop: '0.25rem' }}>{email.subject}</div>
                <div style={{ fontSize: '0.875rem', marginTop: '0.25rem' }}>{email.snippet}</div>
                <div style={{ fontSize: '0.875rem', marginTop: '0.5rem', color: '#d1d5db' }}>
                  <strong>Body:</strong> {email.body || <em>No content available.</em>}
                </div>
                <div style={{ marginTop: '0.5rem', fontSize: '0.875rem' }}>
                  <strong>Suggested Label:</strong> {email.suggested} | <strong>Confidence:</strong> {(email.confidence * 100).toFixed(1)}%
                </div>
                <div style={{ marginTop: '0.5rem' }}>
                  <select
                    value={selectedLabels[email.id] || ""}
                    onChange={(e) => handleLabelChange(email.id, e.target.value)}
                    style={{ padding: '0.25rem 0.5rem', marginRight: '0.5rem' }}
                  >
                    <option value="">Choose label...</option>
                    {labelOptions.map(label => (
                      <option key={label} value={label}>{label}</option>
                    ))}
                  </select>
                  <button onClick={() => handleConfirm(email.id)} style={{ padding: '0.25rem 0.75rem', background: '#22c55e', color: 'white', border: 'none', borderRadius: '0.25rem' }}>Confirm</button>
                </div>
              </div>
            ))
          )}
        </div>

        <footer style={{ marginTop: '3rem', fontSize: '0.875rem', color: '#9ca3af' }}>
          Synthia v1.0.0
        </footer>
      </main>
    </div>
  );
}

const tabBtn = (active) => ({
  padding: '0.5rem 1rem',
  background: active ? '#2563eb' : '#4b5563',
  color: 'white',
  border: 'none',
  borderRadius: '0.375rem'
});
