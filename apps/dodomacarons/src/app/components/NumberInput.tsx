import { ReactNode, useCallback } from 'react';
import {
  Controller,
  ControllerProps,
  ControllerRenderProps,
} from 'react-hook-form';
import {
  FormControl,
  FormLabel,
  IconButton,
  InputAdornment,
  TextField,
  Typography,
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import RemoveIcon from '@mui/icons-material/Remove';
import { WasteFieldValues } from '../types';

export type NumberInputProps = {
  label: ReactNode;
  id: string;
} & Omit<
  ControllerProps<
    WasteFieldValues,
    'displayedQuantity' | 'manufacturingWasteQuantity' | 'shippingWasteQuantity'
  >,
  'render'
>;

export function NumberInput(props: NumberInputProps) {
  const handleIncrement = useCallback(
    (
      field: ControllerRenderProps<
        WasteFieldValues,
        | 'displayedQuantity'
        | 'manufacturingWasteQuantity'
        | 'shippingWasteQuantity'
      >,
      value: number,
    ) => {
      field.onChange(value + 1);
    },
    [],
  );

  const handleDecrement = useCallback(
    (
      field: ControllerRenderProps<
        WasteFieldValues,
        | 'displayedQuantity'
        | 'manufacturingWasteQuantity'
        | 'shippingWasteQuantity'
      >,
      value: number,
    ) => {
      const newValue = Math.max(0, value - 1);
      field.onChange(newValue);
    },
    [],
  );

  return (
    <FormControl fullWidth>
      <FormLabel sx={{ mb: 2 }} htmlFor={props.id}>
        <Typography variant="h5">{props.label}</Typography>
      </FormLabel>
      <Controller
        {...props}
        render={({ field, fieldState }) => (
          <TextField
            {...field}
            value={parseInt(field.value.toString(), 10) || 0}
            onChange={(e) => {
              field.onChange?.(parseInt(e.target.value, 10) || 0);
            }}
            error={!!fieldState?.error}
            helperText={fieldState.error?.message}
            slotProps={{
              input: {
                id: props.id,
                startAdornment: (
                  <InputAdornment position="start" sx={{ mr: 2 }}>
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
                  </InputAdornment>
                ),
                endAdornment: (
                  <InputAdornment position="end" sx={{ ml: 2 }}>
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
                  </InputAdornment>
                ),
              },
            }}
          />
        )}
      />
    </FormControl>
  );
}
