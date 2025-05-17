// src/components/LoadingButton.jsx
import React, { useState } from 'react';

export default function LoadingButton({
  label,
  icon = null,
  loadingLabel = "Processing...",
  endpoint,
  method = "GET",
  onSuccess = () => {},
  onError = () => {}
}) {
  const [loading, setLoading] = useState(false);

  const handleClick = async () => {
    setLoading(true);
    try {
      const res = await fetch(endpoint, { method });
      const json = await res.json();

      if (!res.ok) throw new Error(json?.error || `HTTP ${res.status}`);
      onSuccess(json);
    } catch (err) {
      console.error("❌ Request failed:", err);
      onError(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <button
      onClick={handleClick}
      disabled={loading}
      style={{
        padding: '0.5rem 1rem',
        background: loading ? '#4b5563' : '#2563eb',
        color: 'white',
        border: 'none',
        borderRadius: '0.375rem',
        cursor: loading ? 'not-allowed' : 'pointer',
        display: 'flex',
        alignItems: 'center',
        gap: '0.5rem'
      }}
    >
      {loading ? '⏳ ' + loadingLabel : (icon ? `${icon} ${label}` : label)}
    </button>
  );
}
