// File: src/components/badges/SyncBadge.jsx
import React, { useEffect, useState } from 'react';

export default function SyncBadge({
  label = 'Synced',
  icon = '🔄',
  endpoint = '/api/sync/status',
  timestampKey = 'last_synced',
  value = null,
  pollingInterval = 60000,
  fullWidth = false,
  className = ''
}) {
  const [lastSynced, setLastSynced] = useState(value ? new Date(value) : null);

  useEffect(() => {
    if (value || !endpoint) return;

    const fetchStatus = async () => {
      try {
        const res = await fetch(endpoint);
        const json = await res.json();
        const ts = timestampKey ? json[timestampKey] : json.last_synced;
        if (ts) setLastSynced(new Date(ts));
      } catch (err) {
        console.error(`❌ Failed to fetch ${label}:`, err);
      }
    };

    fetchStatus();
    const interval = setInterval(fetchStatus, pollingInterval);
    return () => clearInterval(interval);
  }, [value, endpoint, timestampKey, pollingInterval]);

  const getRelativeTime = (date) => {
    if (!date) return 'never';
    const diff = Math.floor((Date.now() - date.getTime()) / 1000);
    if (diff < 60) return `${diff}s ago`;
    if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
    if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
    return date.toLocaleDateString();
  };

  return (
    <div
      title={label}
      className={`flex items-center justify-between px-3 py-1 rounded-md text-gray-900 text-sm font-medium ${className}`}
      style={{
        backgroundColor: '#f59e0b', // amber-500
        borderRadius: '0.5rem',
        minHeight: '2rem',
        overflow: 'hidden',
        width: fullWidth ? '100%' : 'auto',
        marginBottom: '0.5rem'
      }}
    >   
      <span>{icon}</span>
      <span className="flex-1 text-left">
        {label}: {lastSynced ? getRelativeTime(lastSynced) : '...'}
      </span>
    </div>
  );
}
