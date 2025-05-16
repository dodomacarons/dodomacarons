import { useCallback, useEffect, useRef, useState } from 'react';
import {
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogProps,
  DialogTitle,
  FormControl,
  TextField,
} from '@mui/material';
import { useGetFlavorsQuery } from '../redux/waste.api.slice';

export function FlavorAddDialog({
  onConfirm,
  loading,
  value,
  ...props
}: DialogProps & {
  value?: string;
  loading?: boolean;
  onConfirm: (reason: string) => void;
}) {
  const [flavor, setFlavor] = useState(value || '');
  const [doesExist, setDoesExist] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const { data: flavors } = useGetFlavorsQuery();

  const setFocus = useCallback(() => {
    setTimeout(() => {
      if (inputRef.current) {
        inputRef.current.focus();
      }
    });
  }, [inputRef]);

  const doesFlavorExistAlready = useCallback(
    () =>
      !!flavors?.find(
        ({ name }) => name.toLowerCase() === flavor.trim().toLowerCase(),
      ),
    [flavor, flavors],
  );

  useEffect(() => {
    if (props.open) {
      setFocus();
    } else {
      setDoesExist(false);
    }
  }, [props.open, setFocus]);

  useEffect(() => {
    setFlavor(value || '');
  }, [value]);

  return (
    <Dialog {...props} className="flavor-add-dialog">
      <DialogTitle>Új íz hozzáadása</DialogTitle>
      <DialogContent>
        <FormControl fullWidth>
          <TextField
            placeholder="Íz megnevezése"
            sx={{ minWidth: '300px' }}
            value={flavor}
            autoComplete="off"
            inputRef={inputRef}
            error={doesExist}
            helperText={doesExist ? 'Ez az íz már létezik' : undefined}
            disabled={loading}
            onChange={(e) => {
              setDoesExist(false);
              setFlavor(e.target.value);
            }}
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                e.preventDefault();
                if (flavor) {
                  if (doesFlavorExistAlready()) {
                    setDoesExist(true);
                    setFocus();
                  } else {
                    onConfirm?.(flavor.trim());
                    setFlavor('');
                  }
                }
              }
            }}
          />
        </FormControl>
      </DialogContent>
      <DialogActions>
        <Button
          onClick={(e) => {
            props.onClose?.(e, 'backdropClick');
          }}
        >
          Mégsem
        </Button>
        <Button
          loadingPosition="start"
          loading={loading}
          variant="contained"
          onClick={() => {
            if (flavor) {
              if (doesFlavorExistAlready()) {
                setDoesExist(true);
                setFocus();
              } else {
                onConfirm(flavor.trim());
                setFlavor('');
              }
            }
          }}
        >
          Mentés
        </Button>
      </DialogActions>
    </Dialog>
  );
}
