import React, { useEffect, useState } from 'react';
import BaseBadge from './BaseBadge';
const COLOR_THRESHOLDS = [
  { limit: 0, color: '#9ca3af' },   // Gray: None
  { limit: 1, color: '#22c55e' },   // Green: Low
  { limit: 10, color: '#facc15' },  // Yellow: Moderate
  { limit: 50, color: '#ef4444' }   // Red: High
];

function getColor(count) {
  if (count === null || count === undefined) return COLOR_THRESHOLDS[0].color;
  return (
    COLOR_THRESHOLDS.find(th => count >= th.limit)?.color || COLOR_THRESHOLDS[0].color
  );
}

export default function MailBadge({
  label = 'Unread',
  icon = '📬',
  value, // optional external value
  endpoint = '/api/gmail/stats',
  unreadKey = 'unread',
  pollingInterval = 60000,
  fullWidth = false,
  className = ''
}) {
  const [count, setCount] = useState(value ?? null);

  useEffect(() => {
    if (value !== undefined) {
      setCount(value); // use external value
      return;
    }

    const fetchMail = async () => {
      try {
        const res = await fetch(endpoint);
        const json = await res.json();
        setCount(json[unreadKey] ?? null);
      } catch (e) {
        console.error(`❌ Failed to fetch mail badge (${label}):`, e);
        setCount(null);
      }
    };

    fetchMail();
    const interval = setInterval(fetchMail, pollingInterval);
    return () => clearInterval(interval);
  }, [endpoint, unreadKey, pollingInterval, value, label]);

  const bg = getColor(count);

  return (
    <BaseBadge
      icon={icon}
      label={label}
      value={count !== null ? `${label} mails: ${count}` : '—'}
      backgroundColor={bg}
      fullWidth={fullWidth}
      className={className}
      tooltip={label}
    />
  );
  }
