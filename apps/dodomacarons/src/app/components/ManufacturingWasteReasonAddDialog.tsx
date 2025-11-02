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
import { useGetReasonsQuery } from '../redux/waste.api.slice';

export function ManufacturingWasteReasonAddDialog({
  onConfirm,
  loading,
  productType = '',
  ...props
}: DialogProps & {
  loading?: boolean;
  productType?: string;
  onConfirm: (reason: string) => void;
}) {
  const [reason, setReason] = useState('');
  const [doesExist, setDoesExist] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const { data: reasons } = useGetReasonsQuery({ productType });

  const setFocus = useCallback(() => {
    setTimeout(() => {
      if (inputRef.current) {
        inputRef.current.focus();
      }
    });
  }, [inputRef]);

  const doesReasonExistAlready = useCallback(
    () =>
      !!reasons?.find(
        ({ name }) => name.toLowerCase() === reason.trim().toLowerCase(),
      ),
    [reason, reasons],
  );

  useEffect(() => {
    if (props.open) {
      setFocus();
    } else {
      setReason('');
      setDoesExist(false);
    }
  }, [props.open, setFocus]);

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
            error={doesExist}
            helperText={doesExist ? 'Ez a probléma már létezik' : undefined}
            disabled={loading}
            onChange={(e) => {
              setReason(e.target.value);
              setDoesExist(false);
            }}
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                e.preventDefault();
                if (reason) {
                  if (doesReasonExistAlready()) {
                    setDoesExist(true);
                    setFocus();
                  } else {
                    onConfirm?.(reason.trim());
                    setReason('');
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
            if (reason) {
              if (doesReasonExistAlready()) {
                setDoesExist(true);
                setFocus();
              } else {
                onConfirm(reason.trim());
                setReason('');
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
