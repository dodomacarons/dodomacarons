import { useAuth0 } from '@auth0/auth0-react';
import { ReactNode, useEffect } from 'react';
import { useDispatch } from 'react-redux';
import { setToken } from './app/redux/auth.slice';

export function Authentication({ children }: { children: ReactNode }) {
  const dispatch = useDispatch();
  const { isAuthenticated, getAccessTokenSilently } = useAuth0();

  useEffect(() => {
    const getToken = async () => {
      if (isAuthenticated) {
        try {
          const token = await getAccessTokenSilently();
          dispatch(setToken(token));
        } catch (e) {
          console.error('Failed to get token', e);
        }
      }
    };

    getToken();
  }, [isAuthenticated, getAccessTokenSilently, dispatch]);

  return children;
}
