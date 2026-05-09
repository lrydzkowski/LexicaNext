import { useCallback, useMemo } from 'react';
import { useNavigate, useSearchParams } from 'react-router';

function isSafeInternalPath(value: string | null): value is string {
  if (!value) {
    return false;
  }

  if (!value.startsWith('/')) {
    return false;
  }

  if (value.startsWith('//') || value.startsWith('/\\')) {
    return false;
  }

  return true;
}

function useReturnToUrl(defaultUrl: string): string {
  const [searchParams] = useSearchParams();

  return useMemo(() => {
    const value = searchParams.get('returnTo');
    return isSafeInternalPath(value) ? value : defaultUrl;
  }, [searchParams, defaultUrl]);
}

export function useReturnTo(defaultUrl: string): () => void {
  const navigate = useNavigate();
  const url = useReturnToUrl(defaultUrl);

  return useCallback(() => {
    navigate(url);
  }, [navigate, url]);
}
