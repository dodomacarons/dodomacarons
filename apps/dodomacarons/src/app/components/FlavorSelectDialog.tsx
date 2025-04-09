import {
  AppBar,
  Box,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogProps,
  IconButton,
  InputAdornment,
  Slide,
  Stack,
  TextField,
  Toolbar,
  Typography,
} from '@mui/material';
import { TransitionProps } from '@mui/material/transitions';
import CloseIcon from '@mui/icons-material/Close';
import { ChangeEvent, forwardRef, useCallback, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { selectRecentlyUsedFlavors, setSelectedFlavor } from '../redux';
import { flavors } from '../data';

export type FlavorSelectDialogProps = Omit<DialogProps, 'onClose'> & {
  onClose?: () => void;
};

const Transition = forwardRef(function Transition(
  props: TransitionProps & {
    children: React.ReactElement<unknown>;
  },
  ref: React.Ref<unknown>
) {
  return <Slide direction="up" ref={ref} {...props} />;
});

export function FlavorSelectDialog(props: FlavorSelectDialogProps) {
  const dispatch = useDispatch();
  const [filter, setFilter] = useState('');
  const recentlyUsedFlavors = useSelector(selectRecentlyUsedFlavors);
  const filteredFavours = flavors.filter((flavor) =>
    flavor.toLowerCase().includes(filter.toLowerCase())
  );

  const handleDialogClose = useCallback(() => {
    setFilter('');
    props.onClose?.();
  }, [props]);

  const handleSearchInputChange = useCallback(
    (event: ChangeEvent<HTMLInputElement>) => {
      setFilter(event.target.value);
    },
    []
  );

  const handleSearchInputClear = useCallback(() => {
    setFilter('');
  }, []);

  return (
    <Dialog fullScreen slots={{ transition: Transition }} {...props}>
      <AppBar sx={{ position: 'relative' }}>
        <Toolbar>
          <Typography sx={{ ml: 2, flex: 1 }} variant="h6" component="div">
            Íz kiválasztása
          </Typography>
          <IconButton
            edge="end"
            color="inherit"
            onClick={handleDialogClose}
            aria-label="close"
          >
            <CloseIcon />
          </IconButton>
        </Toolbar>
      </AppBar>
      <DialogContent>
        <Stack>
          {recentlyUsedFlavors.length > 0 && (
            <Stack gap={1}>
              <Typography>Utoljára kiválasztott ízek</Typography>
              <Stack direction="row" flexWrap="wrap" gap={2}>
                {recentlyUsedFlavors.map((flavor) => (
                  <Button
                    key={flavor}
                    variant="contained"
                    color="secondary"
                    sx={{ textTransform: 'capitalize' }}
                    size="large"
                    onClick={() => {
                      dispatch(setSelectedFlavor(flavor));
                      handleDialogClose();
                    }}
                  >
                    {flavor}
                  </Button>
                ))}
              </Stack>
            </Stack>
          )}
          <Box sx={{ mb: 2 }}>
            <TextField
              label="Keresés"
              variant="outlined"
              fullWidth
              value={filter}
              onChange={handleSearchInputChange}
              margin="normal"
              slotProps={{
                input: {
                  endAdornment: (
                    <InputAdornment position="end">
                      <IconButton
                        aria-label="clear filter"
                        onClick={handleSearchInputClear}
                        edge="end"
                        style={{
                          visibility: filter ? 'visible' : 'hidden',
                        }}
                      >
                        <CloseIcon />
                      </IconButton>
                    </InputAdornment>
                  ),
                },
              }}
            />
          </Box>
          <Stack direction="row" flexWrap="wrap" gap={2}>
            {filteredFavours.map((flavor) => (
              <Button
                key={flavor}
                variant="contained"
                sx={{ textTransform: 'capitalize' }}
                size="large"
                onClick={() => {
                  dispatch(setSelectedFlavor(flavor));
                  handleDialogClose();
                }}
              >
                {flavor}
              </Button>
            ))}
          </Stack>
        </Stack>
      </DialogContent>
      <DialogActions>
        <Button variant="contained" onClick={handleDialogClose}>
          Mégsem
        </Button>
      </DialogActions>
    </Dialog>
  );
}
