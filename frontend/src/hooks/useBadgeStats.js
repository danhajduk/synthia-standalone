import { useState, useCallback, useEffect } from 'react';

export function useBadgeStats(baseUrl = '/api/gmail/stats') {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const refresh = useCallback(() => {
    const fullUrl = `${baseUrl}?ts=${Date.now()}`;  // unique to bust cache
    setLoading(true);

    fetch(fullUrl)
      .then(res => {
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        return res.json();
      })
      .then(json => setData(json))
      .catch(err => setError(err))
      .finally(() => setLoading(false));
  }, [baseUrl]);

  useEffect(() => {
    refresh();
  }, [refresh]);

  return { data, loading, error, refresh };
}
