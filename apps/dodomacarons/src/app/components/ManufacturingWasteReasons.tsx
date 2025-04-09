import {
  Alert,
  Box,
  FormControlLabel,
  FormGroup,
  FormHelperText,
  FormLabel,
  Stack,
  Switch,
  Typography,
} from '@mui/material';
import { Controller, useFieldArray, useFormContext } from 'react-hook-form';
import { WasteFieldValues } from '../types';
import { qualityWasteReasons, visualWasteReasons } from '../data';

export function ManufacturingWasteReasons() {
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
    <Box>
      <Stack direction="row" gap={4}>
        <FormGroup>
          <FormLabel sx={{ mb: 1 }}>
            <Typography variant="h6">Külalak</Typography>
          </FormLabel>
          {visualWasteReasons.map((reason) => (
            <FormControlLabel
              key={reason}
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
                        !!fields.find((field) => field.reason === reason) ||
                        false
                      }
                      onChange={(e) =>
                        handleSwitchChange(reason, e.target.checked)
                      }
                    />
                  )}
                />
              }
              label={reason}
            />
          ))}
        </FormGroup>
        <FormGroup>
          <FormLabel sx={{ mb: 1 }}>
            <Typography variant="h6">Minőség</Typography>
          </FormLabel>
          {qualityWasteReasons.map((reason) => (
            <FormControlLabel
              key={reason}
              control={
                <Controller
                  name="manufacturingWasteReason"
                  control={control}
                  render={({ field }) => (
                    <Switch
                      {...field}
                      checked={
                        !!fields.find((field) => field.reason === reason) ||
                        false
                      }
                      onChange={(e) =>
                        handleSwitchChange(reason, e.target.checked)
                      }
                    />
                  )}
                />
              }
              label={reason}
            />
          ))}
        </FormGroup>
      </Stack>
      {formState.errors?.manufacturingWasteReason?.root && (
        <FormHelperText>
          <Alert severity="error">
            {formState.errors.manufacturingWasteReason.root.message}
          </Alert>
        </FormHelperText>
      )}
    </Box>
  );
}
