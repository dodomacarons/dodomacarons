import {
  createContext,
  ReactNode,
  useCallback,
  useContext,
  useEffect,
  useState,
} from 'react';
import { getAuth0Client } from '../auth0';
import { isAuth0Redirecting } from '../utils/auth';

interface AuthContextType {
  isAuthenticated: boolean;
  isLoading: boolean;
  loginWithRedirect: () => Promise<void>;
  logout: (options?: { returnTo?: string }) => Promise<void>;
  getAccessTokenSilently: () => Promise<string>;
}

const AuthContext = createContext<AuthContextType | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const isRedirecting = isAuth0Redirecting();

  useEffect(() => {
    const initAuth = async () => {
      try {
        const auth0Client = getAuth0Client();

        if (isRedirecting) {
          await auth0Client.handleRedirectCallback();
          window.history.replaceState(
            {},
            document.title,
            window.location.pathname,
          );
        }

        await auth0Client.getTokenSilently();
        setIsAuthenticated(true);
      } catch {
        setIsAuthenticated(false);
      } finally {
        setIsLoading(false);
      }
    };

    initAuth();
  }, [isRedirecting]);

  const loginWithRedirect = useCallback(async () => {
    await getAuth0Client().loginWithRedirect();
  }, []);

  const logout = useCallback(async (options?: { returnTo?: string }) => {
    await getAuth0Client().logout({
      logoutParams: {
        returnTo: options?.returnTo || window.location.origin,
      },
    });
  }, []);

  const getAccessTokenSilently = useCallback(async () => {
    return getAuth0Client().getTokenSilently();
  }, []);

  return (
    <AuthContext.Provider
      value={{
        isAuthenticated,
        isLoading,
        loginWithRedirect,
        logout,
        getAccessTokenSilently,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
}
