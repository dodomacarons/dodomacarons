import { useAuth0 } from '@auth0/auth0-react';
import { ReactNode, useEffect } from 'react';
import { setGetAccessTokenSilently } from './app/authTokenProvider';

export function Authentication({ children }: { children: ReactNode }) {
  const { isAuthenticated, isLoading, getAccessTokenSilently } = useAuth0();

  useEffect(() => {
    if (!isAuthenticated || isLoading) return;

    setGetAccessTokenSilently(getAccessTokenSilently);

    return () => setGetAccessTokenSilently(null);
  }, [getAccessTokenSilently, isLoading, isAuthenticated]);

  if (isLoading) {
    return null;
  }

  return children;
}
