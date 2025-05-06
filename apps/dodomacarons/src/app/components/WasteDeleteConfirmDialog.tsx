import {
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogProps,
  Typography,
} from '@mui/material';

export function WasteDeleteConfirmDialog({
  onConfirm,
  loading,
  ...props
}: DialogProps & {
  loading?: boolean;
  onConfirm: () => void;
}) {
  return (
    <Dialog {...props}>
      <DialogContent>
        <Typography>
          Biztosan szeretnéd törölni a kiválasztott elemet?
        </Typography>
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
          loading={loading}
          variant="contained"
          color="error"
          onClick={() => onConfirm()}
        >
          Törlés
        </Button>
      </DialogActions>
    </Dialog>
  );
}
