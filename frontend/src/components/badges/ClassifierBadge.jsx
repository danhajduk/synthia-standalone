// File: src/components/badges/ClassifierBadge.jsx
import React, { useEffect, useState } from 'react';

export default function ClassifierBadge({
  label = 'Model',
  icon = '🧠',
  value = null,
  endpoint = '/api/classifier/status',
  statusKey = 'model_status',
  pollingInterval = 60000,
  fullWidth = false,
  className = ''
}) {
  const [status, setStatus] = useState(value || 'unknown');

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return isNaN(date) ? dateString : date.toLocaleDateString();
  };

  useEffect(() => {
    if (value || !endpoint) return;

    const fetchStatus = async () => {
      try {
        const res = await fetch(endpoint);
        const json = await res.json();
        const result = statusKey ? json[statusKey] : json.status;
        setStatus(formatDate(result || 'unknown'));
      } catch (err) {
        console.error(`❌ Failed to fetch ${label}:`, err);
        setStatus('error');
      }
    };

    fetchStatus();
    const interval = setInterval(fetchStatus, pollingInterval);
    return () => clearInterval(interval);
  }, [value, endpoint, statusKey, pollingInterval]);

  return (
    <div
      title={label}
      className={`flex items-center justify-between px-3 py-1 rounded-md text-gray-900 text-sm font-medium ${className}`}
      style={{
        backgroundColor: '#a78bfa', // violet-400
        borderRadius: '0.5rem',
        minHeight: '2rem',
        overflow: 'hidden',
        width: fullWidth ? '100%' : 'auto',
        marginBottom: '0.5rem'
      }}
    >
      <span>{icon}</span>
      <span className="flex-1 text-left">
        {label}: {status}
      </span>
    </div>
  );
}
