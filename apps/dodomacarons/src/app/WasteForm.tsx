import { forwardRef, useEffect, useState } from 'react';
import { DateTime } from 'luxon';
import { Controller, FormProvider, useForm } from 'react-hook-form';
import { DatePicker } from '@mui/x-date-pickers';
import {
  Alert,
  AppBar,
  Button,
  Chip,
  Dialog,
  DialogActions,
  DialogContent,
  FormControl,
  FormHelperText,
  FormLabel,
  IconButton,
  InputAdornment,
  Slide,
  Stack,
  TextField,
  Toolbar,
  Typography,
  useTheme,
} from '@mui/material';
import { Box } from '@mui/system';
import AddIcon from '@mui/icons-material/Add';
import RemoveIcon from '@mui/icons-material/Remove';
import CloseIcon from '@mui/icons-material/Close';
import { TransitionProps } from '@mui/material/transitions';
import { setSelectedFlavor } from './flavor.slice';
import { useDispatch, useSelector } from 'react-redux';
import { RootState } from './store';
import { WasteFieldValues } from './types';
import { favors } from './favors';
import { addWaste } from './waste.slice';
import { DataGrid } from '@mui/x-data-grid';
import { v4 as uuid } from 'uuid';

const DATE_STRING_FORMAT = 'yyyy-MM-dd';
const REQUIRED_ERROR_TEXT = 'Mező kitöltése kötelező';

const defaultValues: WasteFieldValues = {
  manufacturingDate: '',
  releaseDate: DateTime.local().toFormat(DATE_STRING_FORMAT),
  displayDate: '',
  flavor: '',
  releasedQuantity: 0,
  manufacturingWasteQuantity: 0,
  manufacturingWasteReason: [],
  shippingWasteQuantity: 0,
};

const Transition = forwardRef(function Transition(
  props: TransitionProps & {
    children: React.ReactElement<unknown>;
  },
  ref: React.Ref<unknown>
) {
  return <Slide direction="up" ref={ref} {...props} />;
});

export function WasteForm() {
  const theme = useTheme();
  const dispatch = useDispatch();

  const [flavorDialogOpened, setFlavorDialogOpened] = useState(false);
  const [filter, setFilter] = useState('');

  const methods = useForm<WasteFieldValues>({
    defaultValues,
    reValidateMode: 'onChange',
  });

  const { handleSubmit, formState } = methods;

  const onSubmit = (data: WasteFieldValues) => {
    dispatch(
      addWaste({
        id: uuid(),
        createdAt: DateTime.local().toString(),
        ...data,
      })
    );
  };

  const handleIncrement = (field: any, value: number) => {
    field.onChange(value + 1);
  };

  const handleDecrement = (field: any, value: number) => {
    field.onChange(Math.max(0, value - 1));
  };

  const handleChange = (event: any) => {
    setFilter(event.target.value || '');
  };

  const filteredFavours = favors.filter((favor) =>
    favor.toLowerCase().includes(filter.toLowerCase())
  );

  const handleClear = () => {
    setFilter('');
  };

  const handleDialogClose = () => {
    handleClear();
    setFlavorDialogOpened(false);
  };

  const toggleDialogOpened = () => {
    setFlavorDialogOpened((prev) => !prev);
  };

  const selectedFlavor = useSelector<RootState, string | null>(
    (state) => state.flavor.selectedFlavor
  );

  const recentlyUsedFlavors = useSelector<RootState, string[]>(
    (state) => state.flavor.recentlyUsedFlavors
  );

  const wasteList = useSelector<RootState, WasteFieldValues[]>(
    (state) => state.waste.list
  );

  useEffect(() => {
    if (selectedFlavor !== methods.getValues('flavor')) {
      methods.setValue('flavor', selectedFlavor || '', {
        shouldValidate: !!selectedFlavor,
      });
    }
  }, [methods, selectedFlavor]);

  return (
    <FormProvider {...methods}>
      <form onSubmit={handleSubmit(onSubmit)}>
        <Stack
          gap={6}
          sx={{
            py: 4,
            px: 6,
            minHeight: '100vh',
            overflow: 'hidden',
            boxSizing: 'border-box',
            '& .MuiFormHelperText-root': {
              p: 0,
              m: 0,
              mt: 1,
              width: '100%',
            },
          }}
        >
          <Box>
            <FormControl fullWidth>
              <FormLabel sx={{ mb: 2 }}>
                <Typography variant="h5">Kitárolás dátuma</Typography>
              </FormLabel>
              <Controller
                name="releaseDate"
                control={methods.control}
                rules={{
                  required: REQUIRED_ERROR_TEXT,
                }}
                render={({ field, fieldState }) => (
                  <DatePicker
                    {...field}
                    value={
                      field.value
                        ? DateTime.fromFormat(field.value, 'yyyy-MM-dd')
                        : null
                    }
                    onChange={(date) => {
                      if (date) {
                        field.onChange(date.toFormat(DATE_STRING_FORMAT));
                      } else {
                        field.onChange(null);
                      }
                    }}
                    closeOnSelect
                    slotProps={{
                      textField: {
                        error: !!fieldState?.error,
                        helperText: fieldState.error?.message && (
                          <Alert severity="error">
                            {fieldState.error.message}
                          </Alert>
                        ),
                      },
                    }}
                  />
                )}
              />
            </FormControl>
          </Box>

          <Box>
            <Stack direction="row" gap={3}>
              <Button
                variant="contained"
                color="secondary"
                onClick={toggleDialogOpened}
              >
                Íz kiválasztása
              </Button>
              {!selectedFlavor && (
                <Alert severity="warning">Nincs íz kiválasztva</Alert>
              )}
              {selectedFlavor && (
                <Alert severity="info">
                  <strong>Kiválasztott íz:</strong>{' '}
                  <Chip
                    size="small"
                    label={selectedFlavor}
                    color="primary"
                    onClick={toggleDialogOpened}
                    sx={{ ml: 1 }}
                  />
                </Alert>
              )}
            </Stack>

            <Controller
              name="flavor"
              control={methods.control}
              rules={{
                required: REQUIRED_ERROR_TEXT,
              }}
              render={({ field, fieldState }) => (
                <FormControl error={!!fieldState.error} fullWidth>
                  <input
                    {...field}
                    type="hidden"
                    value={selectedFlavor || ''}
                  />
                  <FormHelperText>
                    {fieldState.error?.message && (
                      <Alert severity="error">{fieldState.error.message}</Alert>
                    )}
                  </FormHelperText>
                </FormControl>
              )}
            />
          </Box>

          <Box>
            <FormControl fullWidth>
              <FormLabel sx={{ mb: 2 }}>
                <Typography variant="h5">Gyártás dátuma</Typography>
              </FormLabel>
              <Controller
                name="manufacturingDate"
                control={methods.control}
                rules={{
                  required: REQUIRED_ERROR_TEXT,
                }}
                render={({ field, fieldState }) => (
                  <DatePicker
                    {...field}
                    value={
                      field.value
                        ? DateTime.fromFormat(field.value, 'yyyy-MM-dd')
                        : null
                    }
                    onChange={(date) => {
                      if (date) {
                        field.onChange(date.toFormat(DATE_STRING_FORMAT));
                      } else {
                        field.onChange(null);
                      }
                    }}
                    closeOnSelect
                    slotProps={{
                      textField: {
                        error: !!fieldState?.error,
                        helperText: fieldState.error?.message && (
                          <Alert severity="error">
                            {fieldState.error.message}
                          </Alert>
                        ),
                      },
                    }}
                  />
                )}
              />
            </FormControl>
          </Box>

          <Box>
            <FormControl fullWidth>
              <FormLabel sx={{ mb: 2 }}>
                <Typography variant="h5">Pultba kerülés dátuma</Typography>
              </FormLabel>
              <Controller
                name="displayDate"
                control={methods.control}
                rules={{
                  required: REQUIRED_ERROR_TEXT,
                }}
                render={({ field, fieldState }) => (
                  <DatePicker
                    {...field}
                    value={
                      field.value
                        ? DateTime.fromFormat(field.value, 'yyyy-MM-dd')
                        : null
                    }
                    onChange={(date) => {
                      if (date) {
                        field.onChange(date.toFormat(DATE_STRING_FORMAT));
                      } else {
                        field.onChange(null);
                      }
                    }}
                    closeOnSelect
                    slotProps={{
                      textField: {
                        error: !!fieldState.error,
                        helperText: fieldState.error?.message && (
                          <Alert severity="error">
                            {fieldState.error.message}
                          </Alert>
                        ),
                      },
                    }}
                  />
                )}
              />
            </FormControl>
          </Box>

          <Box>
            <FormControl fullWidth>
              <FormLabel sx={{ mb: 2 }}>
                <Typography variant="h5">Kitárolt mennyiség</Typography>
              </FormLabel>
              <Controller
                name="releasedQuantity"
                control={methods.control}
                rules={{
                  required: REQUIRED_ERROR_TEXT,
                }}
                render={({ field, fieldState }) => (
                  <TextField
                    {...field}
                    value={parseInt(field.value.toString(), 10) || 0}
                    onChange={(e) => {
                      field.onChange?.(parseInt(e.target.value, 10) || 0);
                    }}
                    error={!!fieldState?.error}
                    helperText={
                      fieldState.error?.message && (
                        <Alert severity="error">
                          {fieldState.error.message}
                        </Alert>
                      )
                    }
                    slotProps={{
                      input: {
                        startAdornment: (
                          <InputAdornment position="start" sx={{ mr: 2 }}>
                            <IconButton
                              onClick={() =>
                                handleDecrement(field, field.value)
                              }
                              sx={{
                                '&, &:hover': {
                                  background: theme.palette.primary.main,
                                },
                                color: 'white',
                              }}
                            >
                              <RemoveIcon />
                            </IconButton>
                          </InputAdornment>
                        ),
                        endAdornment: (
                          <InputAdornment position="end" sx={{ ml: 2 }}>
                            <IconButton
                              onClick={() =>
                                handleIncrement(field, field.value)
                              }
                              color="primary"
                              sx={{
                                '&, &:hover': {
                                  background: theme.palette.primary.main,
                                },
                                color: 'white',
                              }}
                            >
                              <AddIcon />
                            </IconButton>
                          </InputAdornment>
                        ),
                      },
                    }}
                  />
                )}
              />
            </FormControl>
          </Box>

          <Box>
            <FormControl fullWidth>
              <FormLabel sx={{ mb: 2 }}>
                <Typography variant="h5">Gyártási selejt mennyiség</Typography>
              </FormLabel>
              <Controller
                name="manufacturingWasteQuantity"
                control={methods.control}
                rules={{
                  required: REQUIRED_ERROR_TEXT,
                }}
                render={({ field, fieldState }) => (
                  <TextField
                    {...field}
                    value={parseInt(field.value.toString(), 10) || 0}
                    onChange={(e) => {
                      field.onChange?.(parseInt(e.target.value, 10) || 0);
                    }}
                    error={!!fieldState?.error}
                    helperText={
                      fieldState.error?.message && (
                        <Alert severity="error">
                          {fieldState.error.message}
                        </Alert>
                      )
                    }
                    slotProps={{
                      input: {
                        startAdornment: (
                          <InputAdornment position="start" sx={{ mr: 2 }}>
                            <IconButton
                              onClick={() =>
                                handleDecrement(field, field.value)
                              }
                              sx={{
                                '&, &:hover': {
                                  background: theme.palette.primary.main,
                                },
                                color: 'white',
                              }}
                            >
                              <RemoveIcon />
                            </IconButton>
                          </InputAdornment>
                        ),
                        endAdornment: (
                          <InputAdornment position="end" sx={{ ml: 2 }}>
                            <IconButton
                              onClick={() =>
                                handleIncrement(field, field.value)
                              }
                              color="primary"
                              sx={{
                                '&, &:hover': {
                                  background: theme.palette.primary.main,
                                },
                                color: 'white',
                              }}
                            >
                              <AddIcon />
                            </IconButton>
                          </InputAdornment>
                        ),
                      },
                    }}
                  />
                )}
              />
            </FormControl>
          </Box>

          <Box>
            <FormControl fullWidth>
              <FormLabel sx={{ mb: 2 }}>
                <Typography variant="h5">
                  Szállítási selejt mennyiség
                </Typography>
              </FormLabel>
              <Controller
                name="shippingWasteQuantity"
                control={methods.control}
                rules={{
                  required: REQUIRED_ERROR_TEXT,
                }}
                render={({ field, fieldState }) => (
                  <TextField
                    {...field}
                    value={parseInt(field.value.toString(), 10) || 0}
                    onChange={(e) => {
                      field.onChange?.(parseInt(e.target.value, 10) || 0);
                    }}
                    error={!!fieldState?.error}
                    helperText={
                      fieldState.error?.message && (
                        <Alert severity="error">
                          {fieldState.error.message}
                        </Alert>
                      )
                    }
                    slotProps={{
                      input: {
                        startAdornment: (
                          <InputAdornment position="start" sx={{ mr: 2 }}>
                            <IconButton
                              onClick={() =>
                                handleDecrement(field, field.value)
                              }
                              sx={{
                                '&, &:hover': {
                                  background: theme.palette.primary.main,
                                },
                                color: 'white',
                              }}
                            >
                              <RemoveIcon />
                            </IconButton>
                          </InputAdornment>
                        ),
                        endAdornment: (
                          <InputAdornment position="end" sx={{ ml: 2 }}>
                            <IconButton
                              onClick={() =>
                                handleIncrement(field, field.value)
                              }
                              color="primary"
                              sx={{
                                '&, &:hover': {
                                  background: theme.palette.primary.main,
                                },
                                color: 'white',
                              }}
                            >
                              <AddIcon />
                            </IconButton>
                          </InputAdornment>
                        ),
                      },
                    }}
                  />
                )}
              />
            </FormControl>
          </Box>

          <Box>
            <Button type="submit" variant="contained">
              Mentés
            </Button>
          </Box>

          <DataGrid<WasteFieldValues>
            rows={wasteList}
            columns={[
              { field: 'flavor', headerName: 'Macaron íz', width: 150 },
              {
                field: 'releasedQuantity',
                headerName: 'Darab',
                type: 'number',
                width: 110,
              },
              {
                field: 'manufacturingDate',
                headerName: 'Gyártás dátuma',
                width: 175,
                valueFormatter(value: string) {
                  return DateTime.fromISO(value).toFormat('yyyy. MM. dd.');
                },
              },
              {
                field: 'releaseDate',
                headerName: 'Kitárolás dátuma',
                width: 180,
                valueFormatter(value: string) {
                  return DateTime.fromISO(value).toFormat('yyyy. MM. dd.');
                },
              },
              {
                field: 'displayDate',
                headerName: 'Pultba kerülés',
                width: 165,
                valueFormatter(value: string) {
                  return DateTime.fromISO(value).toFormat('yyyy. MM. dd.');
                },
              },

              {
                field: 'manufacturingWasteQuantity',
                headerName: 'Gyártási selejt',
                type: 'number',
                width: 165,
              },
              {
                field: 'shippingWasteQuantity',
                headerName: 'Szállítási selejt',
                type: 'number',
                width: 170,
              },
              {
                field: 'manufacturingWasteReason',
                headerName: 'Problémák',
                width: 200,
              },
              {
                field: 'createdAt',
                headerName: 'Rögzítés dátuma',
                width: 200,
                valueFormatter(value: string) {
                  return DateTime.fromISO(value).toFormat('yyyy. MM. dd.');
                },
              },
            ]}
            initialState={{
              sorting: {
                sortModel: [{ field: 'createdAt', sort: 'desc' }],
              },
            }}
          ></DataGrid>
        </Stack>

        <Dialog
          open={flavorDialogOpened}
          fullScreen
          slots={{ transition: Transition }}
        >
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
                  onChange={handleChange}
                  margin="normal"
                  slotProps={{
                    input: {
                      endAdornment: (
                        <InputAdornment position="end">
                          <IconButton
                            aria-label="clear filter"
                            onClick={handleClear}
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
      </form>
    </FormProvider>
  );
}

export default WasteForm;
