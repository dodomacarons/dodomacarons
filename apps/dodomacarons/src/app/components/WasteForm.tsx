import { useCallback, useEffect, useMemo, useState } from 'react';
import { DateTime } from 'luxon';
import { Controller, FormProvider, useForm } from 'react-hook-form';
import {
  Alert,
  Button,
  FormControl,
  FormHelperText,
  FormLabel,
  Grid2 as Grid,
  Stack,
  Typography,
} from '@mui/material';
import { Box } from '@mui/system';
import { useDispatch, useSelector } from 'react-redux';
import { useSnackbar } from 'notistack';

import {
  RootState,
  selectWasteBeingEdited,
  selectWasteIdBeingEdited,
  setSelectedFlavor,
  setWasteBeingEdited,
  setWasteIdBeingEdited,
} from '../redux';
import { WasteFieldValues } from '../types';
import { FlavorSelectDialog } from './FlavorSelectDialog';
import { NumberInput } from './NumberInput';
import { DateSelect } from './DateSelect';
import { DATE_STRING_FORMAT, REQUIRED_ERROR_TEXT } from '../misc';
import { ManufacturingWasteReasons } from './ManufacturingWasteReasons';
import {
  useCreateWasteMutation,
  useUpdateWasteMutation,
} from '../redux/waste.api.slice';

const defaultValues: WasteFieldValues = {
  manufacturingDate: '',
  releaseDate: DateTime.local().minus({ day: 1 }).toFormat(DATE_STRING_FORMAT),
  displayDate: DateTime.local().toFormat(DATE_STRING_FORMAT),
  flavor: '',
  displayedQuantity: 40,
  manufacturingWasteQuantity: 0,
  manufacturingWasteReason: [],
  shippingWasteQuantity: 0,
};

export function WasteForm() {
  const { enqueueSnackbar } = useSnackbar();
  const dispatch = useDispatch();
  const [createWaste, { isLoading: isCreateWasteLoading }] =
    useCreateWasteMutation();
  const [updateWaste, { isLoading: isUpdateWasteLoading }] =
    useUpdateWasteMutation();

  const [flavorDialogOpened, setFlavorDialogOpened] = useState(false);

  const methods = useForm<WasteFieldValues>({
    defaultValues,
    reValidateMode: 'onChange',
  });

  const wasteBeingEdited = useSelector(selectWasteBeingEdited);
  const wasteIdBeingEdited = useSelector(selectWasteIdBeingEdited);
  const isEditingWaste = !!(wasteBeingEdited && wasteIdBeingEdited);

  const { handleSubmit, formState, reset } = methods;

  const hasValidationError = useMemo(
    () => Object.keys(formState.errors).length > 0,
    [formState]
  );

  const onSubmit = async (data: WasteFieldValues) => {
    const response = isEditingWaste
      ? await updateWaste({
          wasteId: wasteIdBeingEdited,
          updatedWaste: data,
        })
      : await createWaste(data);

    if (response.error) {
      enqueueSnackbar(<Typography>Hiba történt.</Typography>, {
        variant: 'error',
      });
    } else {
      enqueueSnackbar(<Typography>Sikeres művelet.</Typography>, {
        variant: 'success',
      });

      if (!isEditingWaste) {
        reset(defaultValues);
        dispatch(setSelectedFlavor(null));
      }
    }
  };

  const handleDialogClose = useCallback(() => {
    setFlavorDialogOpened(false);
  }, []);

  const toggleDialogOpened = useCallback(() => {
    setFlavorDialogOpened((prev) => !prev);
  }, []);

  const selectedFlavor = useSelector<RootState, string | null>(
    (state) => state.flavor.selectedFlavor
  );

  useEffect(() => {
    if (selectedFlavor !== methods.getValues('flavor')) {
      methods.setValue('flavor', selectedFlavor || '', {
        shouldValidate: !!selectedFlavor,
      });
    }
  }, [methods, selectedFlavor]);

  useEffect(() => {
    if (wasteBeingEdited !== null) {
      reset({
        manufacturingDate: DateTime.fromISO(
          wasteBeingEdited.manufacturingDate
        ).toFormat(DATE_STRING_FORMAT),
        releaseDate: DateTime.fromISO(wasteBeingEdited.releaseDate).toFormat(
          DATE_STRING_FORMAT
        ),
        displayDate: DateTime.fromISO(wasteBeingEdited.displayDate).toFormat(
          DATE_STRING_FORMAT
        ),
        flavor: wasteBeingEdited.flavor,
        displayedQuantity: wasteBeingEdited.displayedQuantity,
        manufacturingWasteQuantity: wasteBeingEdited.manufacturingWasteQuantity,
        manufacturingWasteReason: wasteBeingEdited.manufacturingWasteReason,
        shippingWasteQuantity: wasteBeingEdited.shippingWasteQuantity,
      });
      dispatch(setSelectedFlavor(wasteBeingEdited.flavor));
    } else {
      reset(defaultValues);
      dispatch(setSelectedFlavor(null));
    }
  }, [wasteIdBeingEdited, wasteBeingEdited, reset, dispatch]);

  return (
    <FormProvider {...methods}>
      <form onSubmit={handleSubmit(onSubmit)}>
        <Box
          sx={{
            py: 4,
            px: 2,
          }}
        >
          <Grid container spacing={6} sx={{ mb: 3 }}>
            <Grid size={12}>
              <Box>
                <DateSelect
                  label="Pultba kerülés dátuma"
                  name="displayDate"
                  control={methods.control}
                  rules={{
                    required: REQUIRED_ERROR_TEXT,
                  }}
                />
              </Box>
            </Grid>
          </Grid>
          <Grid container spacing={6} sx={{ mb: 3 }}>
            <Grid size={6}>
              <Box>
                <FormControl fullWidth>
                  <FormLabel sx={{ mb: 2 }}>
                    <Typography variant="h5">Macaron íz</Typography>
                  </FormLabel>
                  <Stack gap={1}>
                    <Button
                      variant="contained"
                      color="secondary"
                      onClick={toggleDialogOpened}
                      size="large"
                    >
                      {selectedFlavor || 'Íz kiválasztása'}
                    </Button>
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

                        {fieldState.error?.message && (
                          <FormHelperText>
                            {fieldState.error.message}
                          </FormHelperText>
                        )}
                      </FormControl>
                    )}
                  />
                </FormControl>
              </Box>
            </Grid>
            <Grid size={6}>
              <Box>
                <DateSelect
                  label="Gyártás dátuma"
                  name="manufacturingDate"
                  control={methods.control}
                  rules={{
                    required: REQUIRED_ERROR_TEXT,
                  }}
                />
              </Box>
            </Grid>
          </Grid>
          <Grid container spacing={6} sx={{ mb: 3 }}>
            <Grid size={6}>
              <Box>
                <DateSelect
                  label="Kitárolás dátuma"
                  name="releaseDate"
                  control={methods.control}
                  rules={{
                    required: REQUIRED_ERROR_TEXT,
                  }}
                />
              </Box>
            </Grid>
            <Grid size={6}>
              <Box>
                <NumberInput
                  label="Pultba került mennyiség"
                  name="displayedQuantity"
                  control={methods.control}
                  rules={{
                    required: REQUIRED_ERROR_TEXT,
                  }}
                />
              </Box>
            </Grid>
          </Grid>
          <Grid container spacing={6} sx={{ mb: 3 }}>
            <Grid size={6}>
              <Box>
                <NumberInput
                  label="Gyártási selejt mennyiség"
                  name="manufacturingWasteQuantity"
                  control={methods.control}
                  rules={{
                    required: REQUIRED_ERROR_TEXT,
                  }}
                />
              </Box>
            </Grid>
            <Grid size={6}>
              <Box>
                <NumberInput
                  label="Szállítási selejt mennyiség"
                  name="shippingWasteQuantity"
                  control={methods.control}
                  rules={{
                    required: REQUIRED_ERROR_TEXT,
                  }}
                />
              </Box>
            </Grid>
          </Grid>

          {methods.watch('manufacturingWasteQuantity') > 0 && (
            <ManufacturingWasteReasons />
          )}

          <Box>
            <Stack gap={1}>
              {!isEditingWaste && (
                <Stack gap={1} direction="row">
                  <Button
                    loading={isCreateWasteLoading}
                    type="submit"
                    variant="contained"
                    color={hasValidationError ? 'error' : 'primary'}
                    size="large"
                  >
                    Mentés
                  </Button>
                </Stack>
              )}
              {isEditingWaste && (
                <Stack gap={1} direction="row">
                  <Button
                    loading={isUpdateWasteLoading}
                    type="submit"
                    variant="contained"
                    color={hasValidationError ? 'error' : 'primary'}
                    size="large"
                  >
                    Módosítás
                  </Button>
                  <Button
                    size="large"
                    color="secondary"
                    variant="contained"
                    onClick={() => {
                      dispatch(setWasteBeingEdited(null));
                      dispatch(setWasteIdBeingEdited(null));
                    }}
                  >
                    Kilépés szerkesztésből
                  </Button>
                </Stack>
              )}
              {hasValidationError && (
                <Alert severity="error">
                  Hiba történt. Ellenőrizd a beviteli mezőket.
                </Alert>
              )}
            </Stack>
          </Box>
        </Box>

        <FlavorSelectDialog
          open={flavorDialogOpened}
          onClose={handleDialogClose}
        />
      </form>
    </FormProvider>
  );
}

export default WasteForm;
