import { useAuth0 } from '@auth0/auth0-react';
import { useSelector } from 'react-redux';
import {
  Alert,
  AppBar,
  Button,
  CircularProgress,
  Stack,
  Toolbar,
  Typography,
} from '@mui/material';
import { Box } from '@mui/system';
import { Routes, Route } from 'react-router-dom';
import { Waste } from './components/Waste';
import { Statistics } from './components/Statistics';
import { NavBarMenu } from './components/NavBarMenu';
import { Statistics2 } from './components/Statistics2';
import { RootState } from './redux';

export function App() {
  const { isAuthenticated, isLoading, loginWithRedirect } = useAuth0();
  const token = useSelector((state: RootState) => state.auth.token);

  if (isLoading) {
    return (
      <Box sx={{ m: 3 }}>
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
    <>
      <AppBar position="static">
        <Toolbar>
          <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
            Dodo Macarons
          </Typography>
          <NavBarMenu />
        </Toolbar>
      </AppBar>
      <Routes>
        <Route path="/" element={<Waste />} />
        <Route path="/statistics" element={<Statistics />} />
        <Route path="/statistics2" element={<Statistics2 />} />
      </Routes>
    </>
  );
}
