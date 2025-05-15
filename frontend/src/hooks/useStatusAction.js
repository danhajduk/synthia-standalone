import { useState, useCallback } from 'react';

export function useStatusAction() {
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState(null);

  const trigger = useCallback(async (url, onComplete) => {
    setLoading(true);
    setError(null);

    try {
      const res = await fetch(url);
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const json = await res.json();
      setResult(json);

      if (json.status === 'completed' || json.status === 'failed') {
        // Delay before triggering completion callback
        setTimeout(() => {
          onComplete?.(json);
        }, 2000); // 2 seconds
      } else {
        // Immediate callback (if needed)
        onComplete?.(json);
      }

    } catch (err) {
      setError(err);
    } finally {
      setLoading(false);
    }
  }, []);

  return { trigger, loading, result, error };
}
