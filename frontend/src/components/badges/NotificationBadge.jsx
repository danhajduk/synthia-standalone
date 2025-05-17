import React, { useEffect, useState } from 'react';

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
    <div
      title={label}
      className={`flex items-center justify-between px-3 py-1 rounded-md text-gray-900 text-sm font-medium ${className}`}
      style={{
        backgroundColor: '#f59e0b', // amber-500
        borderRadius: '0.5rem',
        minHeight: '2rem',
        overflow: 'hidden',
        width: fullWidth ? '100%' : 'auto',
        marginBottom: '0.5rem'  // 👈 Add margin between badges
      }}
    >
      <span>{icon}</span>
      <span className="flex-1 text-left">{`${label}${count > 0 ? `: ${count}` : ''}`}</span>
    </div>
  );
}
