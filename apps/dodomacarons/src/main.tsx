import { StrictMode } from 'react';
import { BrowserRouter } from 'react-router-dom';
import * as ReactDOM from 'react-dom/client';
import { Provider } from 'react-redux';
import { PersistGate } from 'redux-persist/es/integration/react';
import { persistStore } from 'redux-persist';
import { SnackbarProvider } from 'notistack';
import { Auth0Provider } from '@auth0/auth0-react';
import { store } from './app/redux';
import { App } from './app/app';
import { Authentication } from './auth';

const root = ReactDOM.createRoot(
  document.getElementById('root') as HTMLElement,
);

root.render(
  <StrictMode>
    <Provider store={store}>
      <Auth0Provider
        domain={import.meta.env.VITE_AUTH0_DOMAIN}
        clientId={import.meta.env.VITE_AUTH0_CLIENT_ID}
        authorizationParams={{
          redirect_uri: window.location.origin,
          audience: import.meta.env.VITE_AUTH0_IDENTIFIER,
          // prompt: 'consent',
        }}
        cacheLocation="localstorage"
      >
        <Authentication>
          <PersistGate persistor={persistStore(store)}>
            <SnackbarProvider>
              <BrowserRouter>
                <App />
              </BrowserRouter>
            </SnackbarProvider>
          </PersistGate>
        </Authentication>
      </Auth0Provider>
    </Provider>
  </StrictMode>,
);
