import { useEffect, useState, useCallback } from 'react';

// hooks/useApiFetch.js
export function useApiFetch(url) {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchData = useCallback(() => {
    setLoading(true);
    fetch(url)
      .then(res => {
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        return res.json();
      })
      .then(json => {
        setData(json);
        setError(null);
      })
      .catch(err => setError(err))
      .finally(() => setLoading(false));
  }, [url]);

  useEffect(() => {
    fetchData(); // on mount
  }, [fetchData]);

  return { data, loading, error, refresh: fetchData };
}

export function useBadgeStats(url) {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchStats = useCallback(() => {
    setLoading(true);
    fetch(url)
      .then((res) => {
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        return res.json();
      })
      .then((json) => {
        setStats(json);
        setError(null);
      })
      .catch((err) => setError(err))
      .finally(() => setLoading(false));
  }, [url]);

  useEffect(() => {
    fetchStats(); // auto-fetch on mount
  }, [fetchStats]);

  return { stats, loading, error, refresh: fetchStats };
}

export function useStatusAction(pollInterval = 3000, timeout = 20000) {
  const [loading, setLoading] = useState(false);

  const trigger = useCallback(async (url, onComplete) => {
    setLoading(true);
    try {
      const start = Date.now();

      while (Date.now() - start < timeout) {
        const res = await fetch(url);
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        const json = await res.json();

        if (json.status === 'completed' || json.status === 'failed') {
          onComplete?.(json);
          break;
        }

        // wait before next poll
        await new Promise(res => setTimeout(res, pollInterval));
      }
    } catch (err) {
      console.error("❌ useStatusAction error:", err);
    } finally {
      setLoading(false);
    }
  }, [pollInterval, timeout]);

  return { trigger, loading };
}
