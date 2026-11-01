import { useCallback, useState } from 'react';

export function useApi<TArgs extends unknown[], TResult>(operation: (...args: TArgs) => Promise<TResult>) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const execute = useCallback(async (...args: TArgs) => {
    setLoading(true);
    setError(null);
    try {
      return await operation(...args);
    } catch (cause) {
      const message = cause instanceof Error ? cause.message : 'Yêu cầu không thành công.';
      setError(message);
      throw cause;
    } finally {
      setLoading(false);
    }
  }, [operation]);
  return { execute, loading, error, clearError: () => setError(null) };
}
