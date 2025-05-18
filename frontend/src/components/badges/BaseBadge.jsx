// File: src/components/badges/BaseBadge.jsx
import React from 'react';

export default function BaseBadge({
  label,
  icon,
  value,
  backgroundColor = '#9ca3af',
  fullWidth = false,
  className = '',
  tooltip = null
}) {
  return (
    <div
      title={tooltip || label}
      className={`flex items-center gap-2 px-3 py-1 rounded-md text-gray-900 text-sm font-medium ${className}`}
      style={{
        backgroundColor,
        borderRadius: '0.5rem',
        overflow: 'hidden',
        minHeight: '2rem',
        width: fullWidth ? '90%' : 'auto',
        boxSizing: 'border-box',
        marginBottom: '0.5rem'
      }}
    >
      <span>{icon}</span>
      <span className="flex-1 text-left">{value ?? label}</span>
    </div>
  );
}
