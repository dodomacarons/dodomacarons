import { StrictMode } from 'react';
import * as ReactDOM from 'react-dom/client';
import { LocalizationProvider } from '@mui/x-date-pickers';
import { AdapterLuxon } from '@mui/x-date-pickers/AdapterLuxon';
import { Provider } from 'react-redux';
import { huHU as coreLocaleHU } from '@mui/material/locale';
import { huHU as datePickersLocaleHU } from '@mui/x-date-pickers/locales';
import { huHU as dataGridLocaleHU } from '@mui/x-data-grid/locales';
import { createTheme, ThemeProvider } from '@mui/material';
import { PersistGate } from 'redux-persist/es/integration/react';
import { persistStore } from 'redux-persist';
import { SnackbarProvider } from 'notistack';
import { Auth0Provider } from '@auth0/auth0-react';
import { store } from './app/redux';
import { App } from './app/app';
import { BrowserRouter } from 'react-router-dom';

const root = ReactDOM.createRoot(
  document.getElementById('root') as HTMLElement
);

const theme = createTheme(
  {},
  dataGridLocaleHU,
  datePickersLocaleHU,
  coreLocaleHU
);

root.render(
  <StrictMode>
    <Auth0Provider
      domain={import.meta.env.VITE_AUTH0_DOMAIN}
      clientId={import.meta.env.VITE_AUTH0_CLIENT_ID}
      authorizationParams={{
        redirect_uri: window.location.origin,
      }}
    >
      <ThemeProvider theme={theme}>
        <LocalizationProvider dateAdapter={AdapterLuxon} adapterLocale="hu">
          <Provider store={store}>
            <PersistGate persistor={persistStore(store)}>
              <SnackbarProvider>
                <BrowserRouter>
                  <App />
                </BrowserRouter>
              </SnackbarProvider>
            </PersistGate>
          </Provider>
        </LocalizationProvider>
      </ThemeProvider>
    </Auth0Provider>
  </StrictMode>
);
