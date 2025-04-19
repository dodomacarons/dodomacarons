import { DateTime } from 'luxon';
import { Waste, WasteFieldValues } from './types';

export const DATE_STRING_FORMAT = 'yyyy-MM-dd';

export const REQUIRED_ERROR_TEXT = 'Mező kitöltése kötelező';

export function convertWasteApiResponseToFormFieldValues(
  data: Waste
): WasteFieldValues {
  return {
    ...data,
    releaseDate: DateTime.fromISO(data.releaseDate).toFormat(
      DATE_STRING_FORMAT
    ),
    manufacturingDate: DateTime.fromISO(data.manufacturingDate).toFormat(
      DATE_STRING_FORMAT
    ),
    displayDate: DateTime.fromISO(data.displayDate).toFormat(
      DATE_STRING_FORMAT
    ),
  };
}

export function getRedGradient(value: number) {
  const clamped = Math.max(0, Math.min(100, value));
  const saturation = clamped;
  const lightness = 100 - clamped;
  return `hsl(0, ${saturation}%, ${lightness}%)`;
}
