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
} from '@mui/material';
import { Controller, useFieldArray, useFormContext } from 'react-hook-form';
import { WasteFieldValues } from '../types';
import { qualityWasteReasons, visualWasteReasons } from '../data';

const wasteReasons = [...qualityWasteReasons, ...visualWasteReasons];
const numberOfColumns = Math.ceil(wasteReasons.length / 4);

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
    <Box sx={{ mb: 3 }}>
      <FormGroup>
        <FormLabel sx={{ mb: 1 }}>
          <Typography variant="h6">Problémák</Typography>
        </FormLabel>
        <Grid container sx={{ maxWidth: '760px' }}>
          {new Array(numberOfColumns).fill(1).map((_, i) => (
            <Grid size={12 / numberOfColumns} key={`reason-column-${i}`}>
              {wasteReasons.slice(i * 4, i * 4 + 4).map((reason) => (
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
    </Box>
  );
}
