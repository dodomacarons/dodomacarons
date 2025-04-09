import { useAuth0 } from '@auth0/auth0-react';
import { Waste } from './Waste';
import { Alert, Button, CircularProgress, Stack } from '@mui/material';
import { Box } from '@mui/system';

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
      <Waste />
      <Box sx={{ m: 3 }}>
        <Button
          variant="contained"
          onClick={() =>
            logout({ logoutParams: { returnTo: window.location.origin } })
          }
        >
          Kijelentkezés
        </Button>
      </Box>
    </>
  );
}
