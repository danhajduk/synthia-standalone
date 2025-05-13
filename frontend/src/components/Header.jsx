import React from 'react';

const Header = () => {
  const now = new Date();
  const formattedTime = now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  const formattedDate = now.toLocaleDateString();

  return (
    <div style={{ display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
      <h2 style={{ fontSize: '1.5rem', fontWeight: 600, color: '#d1d5db' }}>Good evening, Dan.</h2>
      <p style={{ fontSize: '0.875rem', color: '#9ca3af' }}>
        I've prepared your assistant summary below.
      </p>
      <p style={{ fontSize: '0.75rem', color: '#6b7280', marginTop: '0.25rem' }}>
        Last synced: {formattedDate} at {formattedTime}
      </p>
    </div>
  );
};

export default Header;
