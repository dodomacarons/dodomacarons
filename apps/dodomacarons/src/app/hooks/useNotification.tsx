import { useSnackbar } from 'notistack';
import { useCallback } from 'react';
import { Typography } from '@mui/material';
import { isMongoDuplicateKeyError } from '../misc';

export function useNotification() {
  const { enqueueSnackbar } = useSnackbar();

  const showError = useCallback(
    (error: unknown) => {
      if (isMongoDuplicateKeyError(error)) {
        enqueueSnackbar(<Typography>Már van ilyen.</Typography>, {
          variant: 'error',
        });
      } else {
        enqueueSnackbar(<Typography>Hiba történt.</Typography>, {
          variant: 'error',
        });
      }
    },
    [enqueueSnackbar],
  );

  const showSuccess = useCallback(
    (message?: string) => {
      enqueueSnackbar(
        <Typography>{message || 'Sikeres művelet.'}</Typography>,
        {
          variant: 'success',
        },
      );
    },
    [enqueueSnackbar],
  );

  return {
    showError,
    showSuccess,
  };
}
