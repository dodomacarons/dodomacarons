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

export function ManufacturingWasteReasonAddDialog({
  onConfirm,
  loading,
  ...props
}: DialogProps & {
  loading?: boolean;
  onConfirm: (reason: string) => void;
}) {
  const [reason, setReason] = useState('');
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
      <DialogTitle>Új probléma hozzáadása</DialogTitle>
      <DialogContent>
        <FormControl fullWidth>
          <TextField
            placeholder="Probléma megnevezése"
            sx={{ minWidth: '300px' }}
            value={reason}
            autoComplete="off"
            inputRef={inputRef}
            onChange={(e) => setReason(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                e.preventDefault();
                if (reason) {
                  onConfirm?.(reason.trim());
                  setReason('');
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
            setReason('');
          }}
        >
          Mégsem
        </Button>
        <Button
          loading={loading}
          variant="contained"
          onClick={() => {
            if (reason) {
              onConfirm(reason.trim());
              setReason('');
            }
          }}
        >
          Mentés
        </Button>
      </DialogActions>
    </Dialog>
  );
}
