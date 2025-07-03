import {
  SyntheticEvent,
  useCallback,
  useEffect,
  useMemo,
  useState,
} from 'react';
import { DateTime } from 'luxon';
import { Controller, FormProvider, useForm } from 'react-hook-form';
import {
  Alert,
  Button,
  FormControl,
  FormHelperText,
  FormLabel,
  Grid,
  Stack,
  TextField,
  Typography,
} from '@mui/material';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import { Box } from '@mui/system';
import { useDispatch, useSelector } from 'react-redux';
import {
  selectSelectedFlavor,
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
  useGetReasonsQuery,
  useUpdateWasteMutation,
} from '../redux/waste.api.slice';
import { useNotification } from '../hooks/useNotification';

const defaultValues: WasteFieldValues = {
  manufacturingDate: '',
  releaseDate: DateTime.local().minus({ day: 1 }).toFormat(DATE_STRING_FORMAT),
  displayDate: DateTime.local().toFormat(DATE_STRING_FORMAT),
  flavor: '',
  displayedQuantity: 40,
  manufacturingWasteQuantity: 0,
  manufacturingWasteReason: [],
  shippingWasteQuantity: 0,
  comment: '',
};

export function WasteForm() {
  const { showError, showSuccess } = useNotification();
  const dispatch = useDispatch();
  const [createWaste, { isLoading: isCreateWasteLoading }] =
    useCreateWasteMutation();
  const [updateWaste, { isLoading: isUpdateWasteLoading }] =
    useUpdateWasteMutation();
  const { data: wasteReasons } = useGetReasonsQuery();

  const [flavorDialogOpened, setFlavorDialogOpened] = useState(false);
  const [addComment, setAddComment] = useState(false);

  const methods = useForm<WasteFieldValues>({
    defaultValues,
    reValidateMode: 'onChange',
  });

  const wasteBeingEdited = useSelector(selectWasteBeingEdited);
  const wasteIdBeingEdited = useSelector(selectWasteIdBeingEdited);
  const isEditingWaste = !!(wasteBeingEdited && wasteIdBeingEdited);

  const { handleSubmit, formState, reset, watch, setValue } = methods;

  const hasValidationError = useMemo(
    () => Object.keys(formState.errors).length > 0,
    [formState],
  );

  const onSubmit = async (data: WasteFieldValues) => {
    const response = isEditingWaste
      ? await updateWaste({
          wasteId: wasteIdBeingEdited,
          updatedWaste: {
            ...data,
            manufacturingWasteReason: data.manufacturingWasteReason?.filter(
              ({ reason }) => !!wasteReasons?.find((r) => r._id === reason),
            ),
          },
        })
      : await createWaste(data);

    if (response.error) {
      showError(response.error);
    } else {
      showSuccess();

      if (!isEditingWaste) {
        reset(defaultValues);
        dispatch(setSelectedFlavor(null));
      }
    }
  };

  const handleDialogClose = useCallback(() => {
    setFlavorDialogOpened(false);
  }, []);

  const toggleDialogOpened = useCallback(
    (e: SyntheticEvent<HTMLButtonElement>) => {
      e.currentTarget.blur();
      setFlavorDialogOpened((prev) => !prev);
    },
    [],
  );

  const selectedFlavor = useSelector(selectSelectedFlavor);

  useEffect(() => {
    if (selectedFlavor?._id !== methods.getValues('flavor')) {
      methods.setValue('flavor', selectedFlavor?._id || '', {
        shouldValidate: !!selectedFlavor,
      });
    }
  }, [methods, selectedFlavor]);

  useEffect(() => {
    if (wasteBeingEdited !== null) {
      reset({
        manufacturingDate: DateTime.fromISO(
          wasteBeingEdited.manufacturingDate,
        ).toFormat(DATE_STRING_FORMAT),
        releaseDate: DateTime.fromISO(wasteBeingEdited.releaseDate).toFormat(
          DATE_STRING_FORMAT,
        ),
        displayDate: DateTime.fromISO(wasteBeingEdited.displayDate).toFormat(
          DATE_STRING_FORMAT,
        ),
        flavor: wasteBeingEdited.flavor._id,
        displayedQuantity: wasteBeingEdited.displayedQuantity,
        manufacturingWasteQuantity: wasteBeingEdited.manufacturingWasteQuantity,
        manufacturingWasteReason: wasteBeingEdited.manufacturingWasteReason,
        shippingWasteQuantity: wasteBeingEdited.shippingWasteQuantity,
        comment: wasteBeingEdited.comment || '',
      });
      dispatch(setSelectedFlavor(wasteBeingEdited.flavor));
      setAddComment(!!wasteBeingEdited.comment);
    } else {
      reset(defaultValues);
      dispatch(setSelectedFlavor(null));
    }
  }, [wasteIdBeingEdited, wasteBeingEdited, reset, dispatch]);

  const manufacturingWasteQuantity = watch('manufacturingWasteQuantity');
  const manufacturingWasteReason = watch('manufacturingWasteReason');

  useEffect(() => {
    if (
      manufacturingWasteQuantity === 0 &&
      (manufacturingWasteReason?.length || 0) > 0
    ) {
      setValue('manufacturingWasteReason', []);
    }
  }, [manufacturingWasteQuantity, manufacturingWasteReason, setValue]);

  return (
    <FormProvider {...methods}>
      <form onSubmit={handleSubmit(onSubmit)}>
        <Box
          sx={{
            py: 4,
            px: 2,
          }}
        >
          <Grid container spacing={{ xs: 3, sm: 6 }} sx={{ mb: 3 }}>
            <Grid size={12}>
              <Box>
                <DateSelect
                  label="Pultba kerülés dátuma"
                  name="displayDate"
                  control={methods.control}
                  id="displayDate"
                  rules={{
                    required: REQUIRED_ERROR_TEXT,
                  }}
                />
              </Box>
            </Grid>
          </Grid>
          <Grid container spacing={{ xs: 3, sm: 6 }} sx={{ mb: 3 }}>
            <Grid size={{ xs: 12, sm: 6 }}>
              <Box>
                <FormLabel>
                  <Typography variant="h5" sx={{ mb: 2 }}>
                    Macaron íz
                  </Typography>

                  <Stack gap={1}>
                    <Button
                      variant="contained"
                      color={selectedFlavor ? 'secondary' : 'primary'}
                      onClick={toggleDialogOpened}
                      size="large"
                    >
                      {selectedFlavor?.name || 'Íz kiválasztása'}
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
                          value={selectedFlavor?._id || ''}
                          id="flavor"
                        />

                        {fieldState.error?.message && (
                          <FormHelperText>
                            {fieldState.error.message}
                          </FormHelperText>
                        )}
                      </FormControl>
                    )}
                  />
                </FormLabel>
              </Box>
            </Grid>
            <Grid size={{ xs: 12, sm: 6 }}>
              <Box>
                <DateSelect
                  label="Gyártás dátuma"
                  name="manufacturingDate"
                  control={methods.control}
                  id="manufacturingDate"
                  rules={{
                    required: REQUIRED_ERROR_TEXT,
                  }}
                />
              </Box>
            </Grid>
          </Grid>
          <Grid container spacing={{ xs: 3, sm: 6 }} sx={{ mb: 3 }}>
            <Grid size={{ xs: 12, sm: 6 }}>
              <Box>
                <DateSelect
                  label="Kitárolás dátuma"
                  name="releaseDate"
                  control={methods.control}
                  id="releaseDate"
                  rules={{
                    required: REQUIRED_ERROR_TEXT,
                  }}
                />
              </Box>
            </Grid>
            <Grid size={{ xs: 12, sm: 6 }}>
              <Box>
                <NumberInput
                  id="displayedQuantity"
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
          <Grid container spacing={{ sm: 3, lg: 7 }} sx={{ mb: 3 }}>
            <Grid size={{ xs: 12, sm: 6 }}>
              <Box>
                <NumberInput
                  id="manufacturingWasteQuantity"
                  label="Gyártási selejt mennyiség"
                  name="manufacturingWasteQuantity"
                  control={methods.control}
                  rules={{
                    required: REQUIRED_ERROR_TEXT,
                  }}
                />
              </Box>
            </Grid>
            <Grid size={{ xs: 12, sm: 6 }}>
              <Box>
                <NumberInput
                  id="shippingWasteQuantity"
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

          <Grid container spacing={12} sx={{ mb: 3 }}>
            <Stack sx={{ width: '100%' }} gap={1}>
              <Box>
                <Button
                  variant="text"
                  size="small"
                  startIcon={addComment ? <DeleteIcon /> : <EditIcon />}
                  onClick={() => {
                    if (addComment) {
                      if (wasteBeingEdited?.comment) {
                        setValue('comment', '');
                      }
                    }

                    setAddComment((prev) => !prev);
                  }}
                >
                  Megjegyzés {addComment ? 'törlése' : 'hozzáfűzése'}
                </Button>
              </Box>

              {addComment && (
                <FormControl fullWidth>
                  <Controller
                    name="comment"
                    control={methods.control}
                    render={({ field }) => (
                      <TextField
                        {...field}
                        multiline={true}
                        maxRows={4}
                        minRows={4}
                        slotProps={{
                          input: {
                            id: 'comment',
                          },
                        }}
                      />
                    )}
                  />
                </FormControl>
              )}
            </Stack>
          </Grid>

          <Grid container spacing={12} sx={{ mb: 3 }}>
            <Stack gap={1}>
              {!isEditingWaste && (
                <Stack gap={1} direction={{ xs: 'column', sm: 'row' }}>
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
                <Stack gap={1} direction={{ xs: 'column', sm: 'row' }}>
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
                      setAddComment(false);
                      window.scrollTo({ top: 0, behavior: 'smooth' });
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
          </Grid>
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
