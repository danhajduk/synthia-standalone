// File: src/pages/CalendarPage.jsx
import React from 'react';
import Sidebar from '../components/Sidebar';
import SynthiaAvatar from '../components/SynthiaAvatar';
import Header from '../components/Header';


export default function Notifications() {
  return (
    <div style={{ display: 'flex', minHeight: '100vh' }}>
      <Sidebar />
      <main style={{ flex: 1, padding: '1.5rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '1rem' }}>
          <SynthiaAvatar />
          <Header />
        </div>

        <div
          style={{
            marginTop: '2rem',
            fontSize: '1.125rem',
            fontWeight: '500',
            color: '#9ca3af'
          }}
        >
          Notifications page - Coming Soon...
        </div>
      </main>
    </div>
  );
}
