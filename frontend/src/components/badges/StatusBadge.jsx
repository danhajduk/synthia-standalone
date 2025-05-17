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

import React, { useEffect, useState } from 'react';

const STATUS_COLORS = {
  ok: '#22c55e',        // Green
  warning: '#facc15',   // Yellow
  error: '#ef4444',     // Red
  unknown: '#9ca3af'    // Gray
};

const STATUS_ICONS = {
  ok: '✅',
  warning: '⚠️',
  error: '❌',
  unknown: '❓'
};

export default function StatusBadge({
  label,
  value,
  endpoint,
  statusKey,
  pollingInterval = 60000,
  fullWidth = false,
  className = ''
}) {
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
  }, [endpoint, statusKey, pollingInterval, label]);

  const bg = STATUS_COLORS[status] || STATUS_COLORS.unknown;
  const icon = STATUS_ICONS[status] || STATUS_ICONS.unknown;

  return (
    <div
      title={label}
      className={`flex items-center gap-2 px-3 py-1 rounded-md text-gray-900 text-sm font-medium ${className}`}
      style={{
        backgroundColor: bg,
        borderRadius: '0.5rem',
        overflow: 'hidden',
        minHeight: '2rem',
        width: fullWidth ? '100%' : 'auto',
        boxSizing: 'border-box',
        marginBottom: '0.5rem'  // 👈 Add margin between badges
      }}
    >
      <span>{icon}</span>
      <span className="flex-1 text-left">  {label}</span>
    </div>
  );
}
