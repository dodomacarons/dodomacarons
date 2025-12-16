import { Alert, Box, Button, Stack, Typography } from '@mui/material';
import { useCallback, useEffect, useState } from 'react';

const AUTO_RETRY_DELAY = 15; // in seconds;

export interface ErrorFallbackProps {
  error: unknown;
  resetError: () => void;
}

export function ErrorFallback({
  error,
  resetError: resetErrorBoundary,
}: ErrorFallbackProps) {
  const [counter, setCounter] = useState(AUTO_RETRY_DELAY);
  const [reloading, setReloading] = useState(false);

  const reload = useCallback(() => {
    setReloading(true);
    setTimeout(
      () => {
        resetErrorBoundary();
        setReloading(false);
        window.location.reload();
      },
      Math.floor(Math.random() * (2000 - 1000 + 1)) + 1000,
    ); // random number between 1000 and 2000
  }, [resetErrorBoundary]);

  useEffect(() => {
    if (counter <= 0) {
      reload();
      return;
    }

    const timer = setTimeout(() => {
      setCounter((c) => c - 1);
    }, 1000);

    return () => clearTimeout(timer);
  }, [counter, resetErrorBoundary, reload]);

  const errorMessage =
    error instanceof Error ? error.message : new Error(String(error)).message;

  return (
    <Alert severity="error" sx={{ m: 2 }}>
      <Stack gap={2}>
        <Typography>
          Nem várt hiba történt. Kérlek, próbáld újra egy kis idő elteltével.
        </Typography>

        <Typography variant="caption">{errorMessage}</Typography>

        <Box>
          <Button
            variant="contained"
            loading={reloading}
            loadingPosition="start"
            onClick={reload}
          >
            {!reloading ? <>Megpróbálom újra ({counter})</> : 'Újratöltés'}
          </Button>
        </Box>
      </Stack>
    </Alert>
  );
}
