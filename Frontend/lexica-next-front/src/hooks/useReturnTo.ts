import { useCallback } from 'react';
import { useNavigate, useSearchParams } from 'react-router';

export function useReturnTo(defaultUrl: string): () => void {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  return useCallback(() => {
    const value = searchParams.get('returnTo');
    if (value && value.startsWith('/')) {
      navigate(value);
      return;
    }

    navigate(defaultUrl);
  }, [navigate, searchParams, defaultUrl]);
}
