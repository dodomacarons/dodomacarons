import { useAuth0 } from '@auth0/auth0-react';
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
import { Waste } from './components/Waste';

export function App() {
  const { isAuthenticated, isLoading, loginWithRedirect, logout } = useAuth0();

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

  return (
    <>
      <AppBar position="static">
        <Toolbar>
          <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
            Dodo Macarons
          </Typography>
          <Button
            color="inherit"
            onClick={() =>
              logout({ logoutParams: { returnTo: window.location.origin } })
            }
          >
            Kijelentkezés
          </Button>
        </Toolbar>
      </AppBar>
      <Waste />
      <Box sx={{ m: 3 }}></Box>
    </>
  );
}
