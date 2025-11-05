import { useState, useEffect } from 'react';
import { JerseyData } from '@/types';
import { loadJerseys as fetchJerseys } from '@/jerseys';

export const useJerseys = () => {
  const [jerseys, setJerseys] = useState<JerseyData[]>([]);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const load = async () => {
      try {
        const loadedJerseys = await fetchJerseys();
        setJerseys(loadedJerseys);
      } catch (err) {
        console.error('Error loading jerseys:', err);
        setError('Erro ao carregar as camisolas');
      }
    };
    load();
  }, []);

  return { jerseys, error };
};