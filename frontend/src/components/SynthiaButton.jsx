import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

export default function SynthiaButton({
  label,
  icon,
  type = 'action', // 'loading', 'link', or 'action'
  endpoint,        // used if type === 'loading'
  method = 'GET',  // HTTP method for fetch
  navigateTo,      // used if type === 'link'
  onClick,         // optional override handler
  onSuccess,
  onError,
  loadingLabel = 'Processing...',
  toast,
  style = {}
}) {
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const defaultStyle = {
    padding: '0.5rem 1rem',
    background: '#4b5563',
    color: '#fff',
    border: 'none',
    borderRadius: '0.375rem',
    cursor: 'pointer',
    fontSize: '0.875rem',
    opacity: loading ? 0.6 : 1,
    display: 'inline-flex',
    alignItems: 'center',
    gap: '0.5rem',
    ...style
  };

  const handleClick = async () => {
    try {
      setLoading(true);

      if (type === 'link' && navigateTo) {
        navigate(navigateTo);
        return;
      }

      if (type === 'loading' && endpoint) {
        const res = await fetch(endpoint, { method });
        const data = await res.json();
        if (!res.ok) throw new Error(data.error || `HTTP ${res.status}`);
        onSuccess?.(data);
        toast?.success?.("✅ Action completed");
        return;
      }

      if (type === 'action' && onClick) {
        await onClick();
        toast?.success?.("✅ Action completed");
        return;
      }
    } catch (err) {
      console.error(err);
      onError?.(err);
      toast?.error?.("❌ Action failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <button onClick={handleClick} disabled={loading} style={defaultStyle}>
      {icon && <span>{icon}</span>}
      {loading ? loadingLabel : label}
    </button>
  );
}
