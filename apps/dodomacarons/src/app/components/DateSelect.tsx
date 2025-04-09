import { Alert, FormControl, FormLabel, Typography } from '@mui/material';
import { ReactNode } from 'react';
import { Controller, ControllerProps } from 'react-hook-form';
import { WasteFieldValues } from '../types';
import { DatePicker } from '@mui/x-date-pickers';
import { DateTime } from 'luxon';
import { DATE_STRING_FORMAT } from '../misc';

export type DateSelectProps = {
  label: ReactNode;
} & Omit<ControllerProps<WasteFieldValues, any>, 'render'>;

export function DateSelect(props: DateSelectProps) {
  return (
    <FormControl fullWidth>
      <FormLabel sx={{ mb: 2 }}>
        <Typography variant="h5">{props.label}</Typography>
      </FormLabel>
      <Controller
        {...props}
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
                  <Alert severity="error">{fieldState.error.message}</Alert>
                ),
              },
            }}
          />
        )}
      />
    </FormControl>
  );
}
