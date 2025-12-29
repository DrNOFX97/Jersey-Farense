import { useState, useEffect } from 'react';
import { JerseyData } from '@/types';
import { loadJerseys as fetchJerseys } from '@/jerseys';

export const useJerseys = () => {
  const [jerseys, setJerseys] = useState<JerseyData[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;
    const controller = new AbortController();

    const load = async () => {
      try {
        setLoading(true);
        const loadedJerseys = await fetchJerseys();

        // Only update state if component is still mounted
        if (isMounted) {
          setJerseys(loadedJerseys);
          setError(null);
        }
      } catch (err) {
        // Only update state if component is still mounted
        if (isMounted) {
          console.error('Erro ao carregar as camisolas:', err);
          setError('Erro ao carregar as camisolas');
          setJerseys([]);
        }
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    };

    load();

    // Cleanup function
    return () => {
      isMounted = false;
      controller.abort();
    };
  }, []);

  return { jerseys, error, loading };
};