import React, { useEffect, useState } from 'react';
import BaseBadge from './BaseBadge';

export default function NotificationBadge({
  label = 'Alerts',
  icon = '🔔',
  value,
  endpoint = '/api/system/alerts',
  countKey = 'count',
  pollingInterval = 60000,
  fullWidth = false,
  className = ''
}) {
  const [count, setCount] = useState(value ?? 0);

  useEffect(() => {
    if (!endpoint) return;

    const fetchAlerts = async () => {
      try {
        const res = await fetch(endpoint);
        const json = await res.json();
        const resolved = countKey ? json[countKey] : json.count;
        if (typeof resolved === 'number') setCount(resolved);
      } catch (err) {
        console.error(`❌ Failed to fetch ${label} count:`, err);
      }
    };

    fetchAlerts();
    const interval = setInterval(fetchAlerts, pollingInterval);
    return () => clearInterval(interval);
  }, [endpoint, countKey, pollingInterval, label]);

  return (
    <BaseBadge
    icon={icon}
    label={label}
    value={`${label}${count > 0 ? `: ${count}` : ''}`}
    backgroundColor="#f59e0b"
    fullWidth={fullWidth}
    className={className}
    tooltip={label}
  />
  );
}
