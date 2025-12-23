import * as Sentry from '@sentry/react';
import { StrictMode } from 'react';
import { BrowserRouter } from 'react-router-dom';
import * as ReactDOM from 'react-dom/client';
import { Provider } from 'react-redux';
import { PersistGate } from 'redux-persist/es/integration/react';
import { persistStore } from 'redux-persist';
import { SnackbarProvider } from 'notistack';
import { AuthProvider } from './app/hooks/useAuth';
import { store } from './app/redux';
import { App } from './app/app';

if (import.meta.env.MODE !== 'development') {
  Sentry.init({
    dsn: import.meta.env.VITE_SENTRY_DSN,
    sendDefaultPii: true,
  });
  console.log('Sentry initialized successfully');
}

const root = ReactDOM.createRoot(
  document.getElementById('root') as HTMLElement,
);

root.render(
  <StrictMode>
    <Provider store={store}>
      <AuthProvider>
        <PersistGate persistor={persistStore(store)}>
          <SnackbarProvider>
            <BrowserRouter>
              <App />
            </BrowserRouter>
          </SnackbarProvider>
        </PersistGate>
      </AuthProvider>
    </Provider>
  </StrictMode>,
);
