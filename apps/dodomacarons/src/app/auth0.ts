import { Auth0Client } from '@auth0/auth0-spa-js';

let auth0ClientInstance: Auth0Client | null = null;

export const getAuth0Client = (): Auth0Client => {
  if (!auth0ClientInstance) {
    auth0ClientInstance = new Auth0Client({
      domain: import.meta.env.VITE_AUTH0_DOMAIN,
      clientId: import.meta.env.VITE_AUTH0_CLIENT_ID,
      authorizationParams: {
        redirect_uri: window.location.origin,
        audience: import.meta.env.VITE_AUTH0_IDENTIFIER,
      },
      cacheLocation: 'memory',
    });
  }
  return auth0ClientInstance;
};

