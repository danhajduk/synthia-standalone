// src/hooks/useBadgeStats.js
import { useState, useEffect, useCallback } from 'react';

export function useBadgeStats(url = '/api/gmail/stats') {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const refresh = useCallback(() => {
    setLoading(true);
    fetch(url)
      .then(res => {
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        return res.json();
      })
      .then(json => setData(json))
      .catch(err => setError(err))
      .finally(() => setLoading(false));
  }, [url]);

  useEffect(() => {
    refresh(); // initial fetch
  }, [refresh]);

  return { data, loading, error, refresh };
}
