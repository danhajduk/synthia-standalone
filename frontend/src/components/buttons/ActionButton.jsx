import React, { useState } from 'react';
import BaseButton from './BaseButton';

export default function ActionButton({
  label,
  icon,
  onClick,
  loadingLabel = 'Processing...',
  toast,
  onSuccess,
  onError,
  ...props
}) {
  const [loading, setLoading] = useState(false);

  const handleWrappedClick = async () => {
    try {
      setLoading(true);
      await onClick?.();
      onSuccess?.();
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
      onClick={handleWrappedClick}
      {...props}
    />
  );
}
