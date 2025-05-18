// File: src/components/badges/ClassifierBadge.jsx
import React, { useEffect, useState } from 'react';
import BaseBadge from './BaseBadge';

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

  const trimValue = (str) => (str ? str.toString().substring(0, 10) : 'unknown');

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    const formattedDate = isNaN(date) ? dateString : date.toLocaleDateString();
    return trimValue(formattedDate);
  };

  useEffect(() => {
    if (value || !endpoint) {
      setStatus(trimValue(value || 'unknown')); // Trim the "value" variable
      return;
    }

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
    <BaseBadge
      icon={icon}
      label={label}
      value={`${label}: ${status}`}
      backgroundColor="#a78bfa"
      fullWidth={fullWidth}
      className={className}
      tooltip={label}
    />
  );
}
