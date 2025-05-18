// File: src/components/badges/SyncBadge.jsx
import React, { useEffect, useState } from 'react';
import BaseBadge from './BaseBadge';

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
    if (!date || isNaN(date.getTime())) return 'never'; // Handle invalid dates
    const diff = Math.floor((Date.now() - date.getTime()) / 1000);
    if (diff < 60) return `${diff}s ago`;
    if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
    if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
    return date.toLocaleDateString();
  };

  return (
    <BaseBadge
    icon={icon}
    label={label}
    value={`${label}: ${lastSynced ? getRelativeTime(lastSynced) : 'never'}`}
    backgroundColor="#f59e0b"
    fullWidth={fullWidth}
    className={className}
    tooltip={label}
  />
  );
}
