import { useCallback, useEffect, useState } from 'react';
import api from '../services/api';

export default function useRemote(url) {
  const [data, setData] = useState(null);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);
  const reload = useCallback(async () => {
    setLoading(true);
    try { const response = await api.get(url); setData(response.data); setError(''); } catch (requestError) { setError(requestError.response?.data?.message || 'Unable to load data.'); } finally { setLoading(false); }
  }, [url]);
  useEffect(() => { reload(); }, [reload]);
  return { data, error, loading, reload, setData };
}
