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
import AddIcon from '@mui/icons-material/Add';
import ClearIcon from '@mui/icons-material/Clear';
import { TransitionProps } from '@mui/material/transitions';
import CloseIcon from '@mui/icons-material/Close';
import { ChangeEvent, forwardRef, useCallback, useMemo, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import {
  clearRecentlyUsedFlavors,
  selectRecentlyUsedFlavors,
  setSelectedFlavor,
} from '../redux';
import {
  useCreateFlavorMutation,
  useGetFlavorsQuery,
  useLazyGetWastesQuery,
} from '../redux/waste.api.slice';
import { DateTime } from 'luxon';
import {
  DATE_STRING_FORMAT,
  convertWasteApiResponseToFormFieldValues,
} from '../misc';
import { useFormContext } from 'react-hook-form';
import { WasteFieldValues } from '../types';
import { FlavorAddDialog } from './FlavorAddDialog';
import { useSnackbar } from 'notistack';

export type FlavorSelectDialogProps = Omit<DialogProps, 'onClose'> & {
  onClose?: () => void;
};

const Transition = forwardRef(function Transition(
  props: TransitionProps & {
    children: React.ReactElement<unknown>;
  },
  ref: React.Ref<unknown>,
) {
  return <Slide direction="up" ref={ref} {...props} />;
});

export function FlavorSelectDialog(props: FlavorSelectDialogProps) {
  const dispatch = useDispatch();
  const { enqueueSnackbar } = useSnackbar();
  const [addDialogOpened, setAddDialogOpened] = useState(false);
  const [filter, setFilter] = useState('');
  const recentlyUsedFlavors = useSelector(selectRecentlyUsedFlavors);
  const { data: flavors } = useGetFlavorsQuery();
  const [createFlavor, { isLoading: isCreateFlavorLoading }] =
    useCreateFlavorMutation();
  const filteredFavours = useMemo(
    () =>
      flavors?.filter((flavor) =>
        flavor.name.toLowerCase().includes(filter.toLowerCase()),
      ),
    [filter, flavors],
  );
  const [getWastes] = useLazyGetWastesQuery();
  const { reset, getValues } = useFormContext<WasteFieldValues>();

  const existingRecentlyUsedFlavors = useMemo(
    () =>
      recentlyUsedFlavors.filter(
        (recentlyUsedFlavor) =>
          !!flavors?.find((flavor) => flavor._id === recentlyUsedFlavor._id),
      ),
    [recentlyUsedFlavors, flavors],
  );

  const sortedRecentlyUsedFlavors = useMemo(
    () =>
      [...existingRecentlyUsedFlavors].sort((a, b) =>
        a.name.localeCompare(b.name),
      ),
    [existingRecentlyUsedFlavors],
  );

  const handleDialogClose = useCallback(() => {
    setFilter('');
    props.onClose?.();
  }, [props]);

  const handleSearchInputChange = useCallback(
    (event: ChangeEvent<HTMLInputElement>) => {
      setFilter(event.target.value);
    },
    [],
  );

  const handleSearchInputClear = useCallback(() => {
    setFilter('');
  }, []);

  const handleFlavorSelect = useCallback(
    async (flavor: { _id: string; name: string }) => {
      const response = await getWastes({
        flavor: flavor._id,
        displayDate: DateTime.local().toFormat(DATE_STRING_FORMAT),
        page: 0,
        pageSize: 1,
      });

      if (!response.error && response.data) {
        if (response.data.data.length > 0) {
          const wastes = response.data.data;
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
    [dispatch, getValues, getWastes, handleDialogClose, reset],
  );

  return (
    <>
      <Dialog fullScreen slots={{ transition: Transition }} {...props}>
        <AppBar sx={{ position: 'relative' }}>
          <Toolbar>
            <Typography sx={{ ml: 2, flex: 1 }} variant="h6" component="div">
              Íz kiválasztása
            </Typography>
            <Button
              startIcon={<AddIcon />}
              sx={{ color: 'white' }}
              onClick={() => setAddDialogOpened(true)}
            >
              Új hozzáadása
            </Button>
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
                      key={flavor._id}
                      variant="contained"
                      color="secondary"
                      sx={{ textTransform: 'capitalize' }}
                      size="large"
                      onClick={() => handleFlavorSelect(flavor)}
                    >
                      {flavor.name}
                    </Button>
                  ))}
                  <Button
                    size="small"
                    startIcon={<ClearIcon color="error" />}
                    onClick={() => {
                      dispatch(clearRecentlyUsedFlavors());
                    }}
                  >
                    Lista törlése
                  </Button>
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
              {filteredFavours?.map((flavor) => (
                <Button
                  key={flavor._id}
                  variant="contained"
                  sx={{ textTransform: 'capitalize' }}
                  size="large"
                  onClick={() => handleFlavorSelect(flavor)}
                >
                  {flavor.name}
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
      <FlavorAddDialog
        open={addDialogOpened}
        loading={isCreateFlavorLoading}
        onConfirm={async (flavor) => {
          const response = await createFlavor({ name: flavor });
          if (response.error) {
            enqueueSnackbar(<Typography>Hiba történt.</Typography>, {
              variant: 'error',
            });
          } else {
            enqueueSnackbar(<Typography>Sikeres művelet.</Typography>, {
              variant: 'success',
            });
            setAddDialogOpened(false);
          }
        }}
        onClose={() => setAddDialogOpened(false)}
      />
    </>
  );
}
