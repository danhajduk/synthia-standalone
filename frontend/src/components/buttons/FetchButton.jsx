import React, { useState } from 'react';
import BaseButton from './BaseButton';

export default function FetchButton({
  label,
  icon,
  endpoint,
  method = 'GET',
  loadingLabel = 'Processing...',
  onSuccess,
  onError,
  toast,
  ...props
}) {
  const [loading, setLoading] = useState(false);

  const handleClick = async () => {
    try {
      setLoading(true);
      const res = await fetch(endpoint, { method });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || `HTTP ${res.status}`);
      onSuccess?.(data);
      toast?.success?.('✅ Done');
    } catch (err) {
      console.error(err);
      toast?.error?.('❌ Failed');
      onError?.(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <BaseButton
      icon={icon}
      label={label}
      loading={loading}
      loadingLabel={loadingLabel}
      onClick={handleClick}
      {...props}
    />
  );
}
