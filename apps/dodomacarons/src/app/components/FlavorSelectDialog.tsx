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
import { ChangeEvent, forwardRef, useCallback, useMemo, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { selectRecentlyUsedFlavors, setSelectedFlavor } from '../redux';
import { flavors } from '../data';
import { useLazyGetWastesQuery } from '../redux/waste.api.slice';
import { DateTime } from 'luxon';
import {
  DATE_STRING_FORMAT,
  convertWasteApiResponseToFormFieldValues,
} from '../misc';
import { useFormContext } from 'react-hook-form';
import { WasteFieldValues } from '../types';

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
  const [getWastes] = useLazyGetWastesQuery();
  const { reset, getValues } = useFormContext<WasteFieldValues>();

  const sortedRecentlyUsedFlavors = useMemo(
    () => [...recentlyUsedFlavors].sort((a, b) => a.localeCompare(b)),
    [recentlyUsedFlavors]
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

  const handleFlavorSelect = useCallback(
    async (flavor: string) => {
      const response = await getWastes({
        flavor,
        displayDate: DateTime.local().toFormat(DATE_STRING_FORMAT),
      });

      if (!response.error && response.data) {
        console.log(response.data);

        if (response.data.length > 0) {
          const wastes = response.data;
          const sameFlavorToday = wastes[wastes.length - 1];
          const converted =
            convertWasteApiResponseToFormFieldValues(sameFlavorToday);

          reset({
            ...getValues(),
            releaseDate: converted.releaseDate,
            manufacturingDate: converted.manufacturingDate,
          });
        }

        dispatch(setSelectedFlavor(flavor));
        handleDialogClose();
      }
    },
    [dispatch, getValues, getWastes, handleDialogClose, reset]
  );

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
          {sortedRecentlyUsedFlavors.length > 0 && (
            <Stack gap={1}>
              <Typography>Utoljára kiválasztott ízek</Typography>
              <Stack direction="row" flexWrap="wrap" gap={2}>
                {sortedRecentlyUsedFlavors.map((flavor) => (
                  <Button
                    key={flavor}
                    variant="contained"
                    color="secondary"
                    sx={{ textTransform: 'capitalize' }}
                    size="large"
                    onClick={() => handleFlavorSelect(flavor)}
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
                onClick={() => handleFlavorSelect(flavor)}
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
