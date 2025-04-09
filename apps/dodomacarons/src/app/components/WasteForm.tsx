import { useCallback, useEffect, useMemo, useState } from 'react';
import { DateTime } from 'luxon';
import { Controller, FormProvider, useForm } from 'react-hook-form';
import {
  Alert,
  Button,
  FormControl,
  FormHelperText,
  FormLabel,
  Stack,
  Typography,
} from '@mui/material';
import { Box } from '@mui/system';
import { useDispatch, useSelector } from 'react-redux';
import { v4 as uuid } from 'uuid';
import { useSnackbar } from 'notistack';

import { addWaste, RootState } from '../redux';
import { WasteFieldValues } from '../types';
import { WasteGridList } from './WasteListGrid';
import { FlavorSelectDialog } from './FlavorSelectDialog';
import { NumberInput } from './NumberInput';
import { DateSelect } from './DateSelect';
import { DATE_STRING_FORMAT, REQUIRED_ERROR_TEXT } from '../misc';
import { ManufacturingWasteReasons } from './ManufacturingWasteReasons';

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

export function WasteForm() {
  const dispatch = useDispatch();
  const { enqueueSnackbar } = useSnackbar();
  const [isLoading, setIsLoading] = useState(false);

  const [flavorDialogOpened, setFlavorDialogOpened] = useState(false);

  const methods = useForm<WasteFieldValues>({
    defaultValues,
    reValidateMode: 'onChange',
  });

  const { handleSubmit, formState } = methods;

  const hasValidationError = useMemo(
    () => Object.keys(formState.errors).length > 0,
    [formState]
  );

  const onSubmit = async (data: WasteFieldValues) => {
    setIsLoading(true);
    await new Promise((resolve) => setTimeout(resolve, 2000));
    dispatch(
      addWaste({
        id: uuid(),
        createdAt: DateTime.local().toString(),
        ...data,
      })
    );
    setIsLoading(false);
    enqueueSnackbar(<Typography>Sikeres művelet.</Typography>, {
      variant: 'success',
    });
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
            <DateSelect
              label="Kitárolás dátuma"
              name="releaseDate"
              control={methods.control}
              rules={{
                required: REQUIRED_ERROR_TEXT,
              }}
            />
          </Box>

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
                {!selectedFlavor && (
                  <Alert severity="warning">Nincs íz kiválasztva</Alert>
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
                        <Alert severity="error">
                          {fieldState.error.message}
                        </Alert>
                      )}
                    </FormHelperText>
                  </FormControl>
                )}
              />
            </FormControl>
          </Box>

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

          <Box>
            <NumberInput
              label="Kitárolt mennyiség"
              name="releasedQuantity"
              control={methods.control}
              rules={{
                required: REQUIRED_ERROR_TEXT,
              }}
            />
          </Box>

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

          {methods.watch('manufacturingWasteQuantity') > 0 && (
            <ManufacturingWasteReasons />
          )}

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

          <Box>
            <Stack gap={1}>
              <Button
                loading={isLoading}
                type="submit"
                variant="contained"
                color={hasValidationError ? 'error' : 'primary'}
                size="large"
              >
                Mentés
              </Button>
              {hasValidationError && (
                <Alert severity="error">
                  Hiba történt. Ellenőrizd a beviteli mezőket.
                </Alert>
              )}
            </Stack>
          </Box>

          <WasteGridList />
        </Stack>

        <FlavorSelectDialog
          open={flavorDialogOpened}
          onClose={handleDialogClose}
        />
      </form>
    </FormProvider>
  );
}

export default WasteForm;
