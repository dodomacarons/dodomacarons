import {
  Box,
  FormControl,
  FormLabel,
  IconButton,
  Stack,
  Typography,
} from '@mui/material';
import { ReactNode, useCallback } from 'react';
import {
  Controller,
  ControllerProps,
  ControllerRenderProps,
} from 'react-hook-form';
import { WasteFieldValues } from '../types';
import { DatePicker } from '@mui/x-date-pickers';
import { DateTime } from 'luxon';
import { DATE_STRING_FORMAT } from '../misc';
import AddIcon from '@mui/icons-material/Add';
import RemoveIcon from '@mui/icons-material/Remove';

export type DateSelectProps = {
  label: ReactNode;
  id: string;
  onChange?: (newDate: string | null) => void
} & Omit<
  ControllerProps<
    WasteFieldValues,
    'displayDate' | 'manufacturingDate' | 'releaseDate'
  >,
  'render'
>;

export function DateSelect(props: DateSelectProps) {
  const handleIncrement = useCallback(
    (
      field: ControllerRenderProps<
        WasteFieldValues,
        'displayDate' | 'manufacturingDate' | 'releaseDate'
      >,
      value: string,
    ) => {
      const dateToChange: DateTime = value
        ? DateTime.fromISO(value)
        : DateTime.local();
      const newValue = dateToChange.plus({ days: 1 }).toFormat(DATE_STRING_FORMAT);
      field.onChange?.(newValue);
      props.onChange?.(newValue);
    },
    [props],
  );

  const handleDecrement = useCallback(
    (
      field: ControllerRenderProps<
        WasteFieldValues,
        'displayDate' | 'manufacturingDate' | 'releaseDate'
      >,
      value: string,
    ) => {
      const dateToChange: DateTime = value
        ? DateTime.fromISO(value)
        : DateTime.local();
      const newValue = dateToChange.minus({ days: 1 }).toFormat(DATE_STRING_FORMAT);
      field.onChange?.(newValue);
      props.onChange?.(newValue);
    },
    [props],
  );

  return (
    <FormControl fullWidth>
      <FormLabel sx={{ mb: 2 }} htmlFor={props.id}>
        <Typography variant="h5">{props.label}</Typography>
      </FormLabel>
      <Controller
        {...props}
        render={({ field, fieldState }) => (
          <Stack direction="row" gap={1} alignItems="center">
            <Box>
              <IconButton
                size="large"
                onClick={() => handleDecrement(field, field.value)}
                sx={(theme) => ({
                  '&, &:hover': {
                    background: theme.palette.primary.main,
                  },
                  color: 'white',
                })}
              >
                <RemoveIcon />
              </IconButton>
            </Box>
            <DatePicker
              {...field}
              value={
                field.value
                  ? DateTime.fromFormat(field.value, 'yyyy-MM-dd')
                  : null
              }
              onChange={(date) => {
                if (date) {
                  field.onChange?.(date.toFormat(DATE_STRING_FORMAT));
                  props.onChange?.(date.toFormat(DATE_STRING_FORMAT));
                } else {
                  field.onChange?.(null);
                  props.onChange?.(null);
                }
              }}
              closeOnSelect
              slotProps={{
                textField: {
                  id: props.id,
                  error: !!fieldState?.error,
                  helperText: fieldState.error?.message,
                },
              }}
              sx={{ width: '100%' }}
            />
            <Box>
              <IconButton
                size="large"
                onClick={() => handleIncrement(field, field.value)}
                sx={(theme) => ({
                  '&, &:hover': {
                    background: theme.palette.primary.main,
                  },
                  color: 'white',
                })}
              >
                <AddIcon />
              </IconButton>
            </Box>
          </Stack>
        )}
      />
    </FormControl>
  );
}
