/**
 * StatusBadge Component Props
 *
 * @param {string} label - Display label shown inside the badge (e.g., "Backend").
 * @param {string} [value] - Optional initial status value (e.g., "ok", "warning", "error", "unknown").
 * @param {string} [endpoint] - Optional API endpoint to fetch status dynamically.
 * @param {string} [statusKey] - Optional key to extract status from the JSON response (e.g., "openai" from { openai: "ok" }).
 * @param {number} [pollingInterval=60000] - Optional refresh interval in milliseconds (default is 1 minute).
 */

// File: src/components/badges/StatusBadge.jsx

// Updated: src/components/badges/StatusBadge.jsx
import React, { useEffect, useState } from 'react';
import BaseBadge from './BaseBadge';

const STATUS_COLORS = {
  ok: '#22c55e',
  warning: '#facc15',
  error: '#ef4444',
  unknown: '#9ca3af'
};

const STATUS_ICONS = {
  ok: '✅',
  warning: '⚠️',
  error: '❌',
  unknown: '❓'
};

export default function StatusBadge({ label, value, endpoint, statusKey, pollingInterval = 60000, ...props }) {
  const [status, setStatus] = useState(value || 'unknown');

  useEffect(() => {
    if (!endpoint) return;

    const fetchStatus = async () => {
      try {
        const res = await fetch(endpoint);
        const json = await res.json();
        const resolved = statusKey ? json[statusKey] : json.status;
        setStatus(resolved || 'unknown');
      } catch (e) {
        console.error(`❌ Failed to fetch status for ${label}:`, e);
        setStatus('error');
      }
    };

    fetchStatus();
    const interval = setInterval(fetchStatus, pollingInterval);
    return () => clearInterval(interval);
  }, [endpoint, statusKey, pollingInterval]);

  return (
    <BaseBadge
      label={label}
      icon={STATUS_ICONS[status] || STATUS_ICONS.unknown}
      value={label}
      backgroundColor={STATUS_COLORS[status] || STATUS_COLORS.unknown}
      {...props}
    />
  );
}
