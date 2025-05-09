import { useEffect, useRef, useState } from 'react';
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

export function FlavorAddDialog({
  onConfirm,
  loading,
  ...props
}: DialogProps & {
  loading?: boolean;
  onConfirm: (reason: string) => void;
}) {
  const [flavor, setFlavor] = useState('');
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (props.open) {
      setTimeout(() => {
        if (inputRef.current) {
          inputRef.current.focus();
        }
      });
    }
  }, [props.open]);

  return (
    <Dialog {...props}>
      <DialogTitle>Új íz hozzáadása</DialogTitle>
      <DialogContent>
        <FormControl fullWidth>
          <TextField
            placeholder="Íz megnevezése"
            sx={{ minWidth: '300px' }}
            value={flavor}
            autoComplete="off"
            inputRef={inputRef}
            onChange={(e) => setFlavor(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                e.preventDefault();
                if (flavor) {
                  onConfirm?.(flavor.trim());
                  setFlavor('');
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
            setFlavor('');
          }}
        >
          Mégsem
        </Button>
        <Button
          loading={loading}
          variant="contained"
          onClick={() => {
            if (flavor) {
              onConfirm(flavor.trim());
              setFlavor('');
            }
          }}
        >
          Mentés
        </Button>
      </DialogActions>
    </Dialog>
  );
}
