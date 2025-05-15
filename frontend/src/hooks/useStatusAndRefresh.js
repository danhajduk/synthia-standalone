// src/hooks/useStatusAndRefresh.js
import { useState, useCallback } from 'react';

export function useStatusAndRefresh(statsUrl = '/api/gmail/stats', pollInterval = 3000, timeout = 30000) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const  trigger = useCallback(async (triggerUrl, onComplete) => {
    setLoading(true);
    setError(null);

    statsUrl = statsUrl+`?ts=${Date.now()}`;
    try {
      // Step 1: Trigger classification
      const triggerRes = await fetch(triggerUrl);
      if (!triggerRes.ok) throw new Error(`Trigger failed: ${triggerRes.status}`);
      const triggerJson = await triggerRes.json();
    
      // Optional: log or inspect result
      console.log("✅ Classification result:", triggerJson);
    
      // Step 2: Wait a bit for DB to settle
      setTimeout(() => {
        onComplete?.();  // Trigger badge refresh or UI update
      }, 2000); // 2 seconds delay
    } catch (err) {
      console.error("❌ Error in useStatusAndRefresh:", err);
      setError(err);
    } finally {
      setLoading(false);
    }
  }, [statsUrl, pollInterval, timeout]);

  return { trigger, loading, error };
}
