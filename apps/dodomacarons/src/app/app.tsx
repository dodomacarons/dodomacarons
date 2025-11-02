import { useAuth0 } from '@auth0/auth0-react';
import { useSelector } from 'react-redux';
import { LocalizationProvider } from '@mui/x-date-pickers';
import { AdapterLuxon } from '@mui/x-date-pickers/AdapterLuxon';
import { huHU as coreLocaleHU } from '@mui/material/locale';
import { huHU as datePickersLocaleHU } from '@mui/x-date-pickers/locales';
import { huHU as dataGridLocaleHU } from '@mui/x-data-grid/locales';
import {
  Alert,
  AppBar,
  Button,
  CircularProgress,
  Stack,
  Switch,
  Toolbar,
  Typography,
  Box,
  ThemeProvider,
  createTheme
} from '@mui/material';
import { blue, green } from '@mui/material/colors';
import { Routes, Route, Navigate, useNavigate, Link } from 'react-router-dom';
import { Waste } from './components/Waste';
import { Statistics } from './components/Statistics';
import { NavBarMenu } from './components/NavBarMenu';
import { selectToken } from './redux/auth.slice';
import { ErrorBoundary } from './components/ErrorBoundary';
import { ErrorFallback } from './components/ErrorFallback';
import { selectSelectedProductType } from './redux/productType.slice';
import { EProductType } from './types';
import { useMemo } from 'react';

export function App() {
  const { isAuthenticated, isLoading, loginWithRedirect } = useAuth0();
  const token = useSelector(selectToken);
  const navigate = useNavigate();
  const productType = useSelector(selectSelectedProductType);

  const theme = useMemo(() => createTheme(
    {
      palette: {
        primary: {
          main: productType === EProductType.MACARON ? blue[600] : green[600],
        },
        secondary: {
          main: productType === EProductType.MACARON ? blue[900] : green[900],
        },
      }
    },
    dataGridLocaleHU,
    datePickersLocaleHU,
    coreLocaleHU,
  ), [productType]);

  if (isLoading) {
    return (
      <Box
        sx={{
          p: 4,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        <CircularProgress />
      </Box>
    );
  }

  if (!isAuthenticated) {
    return (
      <Stack sx={{ m: 3 }} gap={2}>
        <Box>
          <Alert severity="error">
            Az oldal megtekintéséhez azonosítás szükséges
          </Alert>
        </Box>
        <Box>
          <Button
            variant="contained"
            onClick={() => {
              loginWithRedirect();
            }}
          >
            Bejelentkezés
          </Button>
        </Box>
      </Stack>
    );
  }

  if (!token) {
    return null;
  }

  return (
    <ErrorBoundary fallback={(props) => <ErrorFallback {...props} />}>
      <ThemeProvider theme={theme}>
        <LocalizationProvider dateAdapter={AdapterLuxon} adapterLocale="hu">
          <AppBar position="static">
            <Toolbar>
              <Typography
                variant="h6"
                component="div"
                sx={{ flexGrow: 1, a: { color: 'white', textDecoration: 'none' } }}
              >
                <Link to="/">Dodo {productType === EProductType.MIGNON ? 'Mignons' : 'Macarons'}</Link>
              </Typography>

              <Box>
                <Stack
                  direction="row"
                  gap={0.5}
                  sx={{
                    px: 4, py: 2, alignItems: 'center',
                  }}
                >
                  <Typography
                    sx={{ opacity: productType === EProductType.MACARON ? 1 : 0.3 }}
                  >
                    Macarons
                  </Typography>
                  <Switch
                    size='medium'
                    color='default'
                    checked={productType === EProductType.MIGNON}
                    onChange={(e, isChecked) => {
                      if (isChecked) {
                        navigate(`/${EProductType.MIGNON}`);
                      } else {
                        navigate(`/${EProductType.MACARON}`);
                      }
                    }}
                  />
                  <Typography
                    sx={{
                      opacity: productType === EProductType.MIGNON ? 1 : 0.3,
                    }}
                  >
                    Mignons
                  </Typography>
                </Stack>
              </Box>
              <NavBarMenu />
            </Toolbar>
          </AppBar>
          <Routes>
            <Route path="/" element={<Navigate to={`/${productType || EProductType.MACARON}`} replace />} />
            <Route path="/:productType" element={<Waste />} />
            <Route path="/statistics" element={<Navigate to={`/statistics/${productType || EProductType.MACARON}`} replace />} />
            <Route path="/statistics/:productType" element={<Statistics />} />
          </Routes>
        </LocalizationProvider>
      </ThemeProvider>
    </ErrorBoundary>
  );
}
