import { StrictMode } from 'react';
import * as ReactDOM from 'react-dom/client';
import { LocalizationProvider } from '@mui/x-date-pickers';
import { AdapterLuxon } from '@mui/x-date-pickers/AdapterLuxon';
import { App } from './app/app';
import { Provider } from 'react-redux';
import { store } from './app/store';
import { huHU as coreLocaleHU } from '@mui/material/locale';
import { huHU as datePickersLocaleHU } from '@mui/x-date-pickers/locales';
import { huHU as dataGridLocaleHU } from '@mui/x-data-grid/locales';
import { createTheme, ThemeProvider } from '@mui/material';
import { PersistGate } from 'redux-persist/es/integration/react';
import { persistStore } from 'redux-persist';
import { SnackbarProvider } from 'notistack';
import { Auth0Provider } from '@auth0/auth0-react';

const root = ReactDOM.createRoot(
  document.getElementById('root') as HTMLElement
);

const theme = createTheme(
  {},
  dataGridLocaleHU,
  datePickersLocaleHU,
  coreLocaleHU
);

const auth0Domain = import.meta.env.VITE_AUTH0_DOMAIN;
const auth0ClientId = import.meta.env.VITE_AUTH0_CLIENT_ID;

root.render(
  <Auth0Provider
    domain={auth0Domain as string}
    clientId={auth0ClientId as string}
    authorizationParams={{
      redirect_uri: window.location.origin,
    }}
  >
    <StrictMode>
      <ThemeProvider theme={theme}>
        <LocalizationProvider dateAdapter={AdapterLuxon} adapterLocale="hu">
          <Provider store={store}>
            <PersistGate persistor={persistStore(store)}>
              <SnackbarProvider>
                <App />
              </SnackbarProvider>
            </PersistGate>
          </Provider>
        </LocalizationProvider>
      </ThemeProvider>
    </StrictMode>
  </Auth0Provider>
);
