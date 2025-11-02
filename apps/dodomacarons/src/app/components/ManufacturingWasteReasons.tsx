import { useMemo, useState } from 'react';
import {
  Box,
  FormControlLabel,
  FormGroup,
  FormHelperText,
  Switch,
  Grid,
  FormLabel,
  Typography,
  FormControl,
  Button,
  Stack,
  useTheme,
  useMediaQuery,
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import { Controller, useFieldArray, useFormContext } from 'react-hook-form';
import { ManufacturingWasteReasonAddDialog } from './ManufacturingWasteReasonAddDialog';
import { WasteFieldValues } from '../types';
import {
  useCreateReasonMutation,
  useGetReasonsQuery,
} from '../redux/waste.api.slice';
import { useNotification } from '../hooks/useNotification';

export function ManufacturingWasteReasons({ productType = '' }: { productType?: string }) {
  const theme = useTheme();
  const isSmallScreen = useMediaQuery(theme.breakpoints.down('sm'));
  const numberOfColumns = isSmallScreen ? 2 : 3;
  const { showError, showSuccess } = useNotification();
  const [addDialogOpened, setAddDialogOpened] = useState(false);
  const [createReason, { isLoading: isCreateReasonLoading }] =
    useCreateReasonMutation();
  const { data: wasteReasons } = useGetReasonsQuery({ productType });
  const rowsPerColumn = useMemo(
    () => Math.ceil((wasteReasons?.length || 0) / numberOfColumns),
    [numberOfColumns, wasteReasons?.length],
  );

  const { control, watch, formState } = useFormContext<WasteFieldValues>();

  const { fields, append, remove } = useFieldArray<WasteFieldValues>({
    control,
    name: 'manufacturingWasteReason',
  });

  const handleSwitchChange = (reason: string, checked: boolean) => {
    if (checked) {
      if (!fields.find((field) => field.reason === reason)) {
        append({ reason });
      }
    } else {
      remove(fields.findIndex((field) => field.reason === reason));
    }
  };

  return (
    <Box sx={{ mb: 3 }}>
      <FormGroup>
        <FormLabel sx={{ mb: 1 }}>
          <Stack direction="row" gap={2} sx={{ alignItems: 'center' }}>
            <Typography variant="body1">Problémák</Typography>
            <Button
              size="small"
              startIcon={<AddIcon />}
              onClick={(e) => {
                e.currentTarget.blur();
                setAddDialogOpened(true);
              }}
            >
              Új hozzáadása
            </Button>
          </Stack>
        </FormLabel>
        <Grid container spacing={{ xs: 3, sm: 6 }}>
          {new Array(numberOfColumns).fill(1).map((_, i) => (
            <Grid
              size={Math.ceil(12 / numberOfColumns)}
              key={`reason-column-${i}`}
            >
              {wasteReasons
                ?.slice(i * rowsPerColumn, i * rowsPerColumn + rowsPerColumn)
                .map((reason) => (
                  <FormControlLabel
                    sx={{ display: 'flex' }}
                    key={reason.name}
                    control={
                      <Controller
                        name="manufacturingWasteReason"
                        control={control}
                        rules={{
                          validate(value) {
                            if (
                              watch('manufacturingWasteQuantity') > 0 &&
                              !fields.length
                            ) {
                              return 'Ha van gyártási selejt, legalább egy értéket kötelező megadni a fent felsorolt problémák közül.';
                            }
                            return true;
                          },
                        }}
                        render={({ field }) => (
                          <Switch
                            {...field}
                            checked={
                              !!fields.find(
                                (field) => field.reason === reason._id,
                              ) || false
                            }
                            onChange={(e) =>
                              handleSwitchChange(reason._id, e.target.checked)
                            }
                          />
                        )}
                      />
                    }
                    label={<Typography noWrap>{reason.name}</Typography>}
                  />
                ))}
            </Grid>
          ))}
        </Grid>
      </FormGroup>
      {formState.errors?.manufacturingWasteReason?.root && (
        <FormControl error={true}>
          <FormHelperText color="error">
            {formState.errors.manufacturingWasteReason.root.message}
          </FormHelperText>
        </FormControl>
      )}
      <ManufacturingWasteReasonAddDialog
        open={addDialogOpened}
        loading={isCreateReasonLoading}
        productType={productType}
        onConfirm={async (reason) => {
          const response = await createReason({ name: reason, productType });

          if (response.error) {
            showError(response.error);
          } else {
            showSuccess();
            setAddDialogOpened(false);
            handleSwitchChange(response.data._id, true);
          }
        }}
        onClose={() => setAddDialogOpened(false)}
      />
    </Box>
  );
}
