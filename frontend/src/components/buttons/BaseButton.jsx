// File: BaseButton.jsx
import React from 'react';

export default function BaseButton({
  icon,
  label,
  loading,
  loadingLabel = 'Processing...',
  onClick,
  fullWidth = false,
  disabled = false,
  className = '',
  style = {}
}) {
  return (
    <button
    className={`synthia-button ${fullWidth ? 'full-width' : ''} ${className}`}
      onClick={onClick}
      disabled={disabled || loading}
      style={style}
    >
      {icon && <span>{icon}</span>}
      <span>{loading ? loadingLabel : label}</span>
    </button>
  );
}
