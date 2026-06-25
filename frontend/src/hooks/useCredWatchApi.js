import { useState, useCallback } from 'react';

/**
 * Custom hook to abstract fetch logic for CredWatch API queries.
 * Provides independent state management for active API sessions.
 */
export const useCredWatchApi = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [data, setData] = useState(null);

  const execute = useCallback(async (endpoint, body = null) => {
    setLoading(true);
    setError(null);
    setData(null);
    
    try {
      const headers = {};
      if (body) {
        headers['Content-Type'] = 'application/json';
      }
      
      const response = await fetch(endpoint, {
        method: body ? 'POST' : 'GET',
        headers,
        body: body ? JSON.stringify(body) : null,
      });

      const result = await response.json().catch(() => {
        throw new Error("Invalid response structure from backend.");
      });

      if (!response.ok || result.success === false) {
        throw new Error(result.error || `Server returned error status ${response.status}`);
      }

      // If it's a direct health check or success-only endpoint, it might not contain a structured data key.
      // E.g., GET /api/health returns {"status": "ok"}
      const payload = result.data !== undefined ? result.data : result;
      setData(payload);
      return payload;
      
    } catch (err) {
      // Ensure we display clean, user-friendly messages and never echo passwords in errors.
      const userMessage = err.message || "Failed to reach the database validation server.";
      setError(userMessage);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const clear = useCallback(() => {
    setLoading(false);
    setError(null);
    setData(null);
  }, []);

  return { loading, error, data, execute, clear };
};
