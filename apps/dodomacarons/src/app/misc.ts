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
