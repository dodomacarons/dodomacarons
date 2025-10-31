import { DateTime } from 'luxon';
import { Waste, WasteFieldValues } from './types';
import { FetchBaseQueryError } from '@reduxjs/toolkit/query';
import { SerializedError } from '@reduxjs/toolkit';

export const DATE_STRING_FORMAT = 'yyyy-MM-dd';

export const REQUIRED_ERROR_TEXT = 'Mező kitöltése kötelező';

export function convertWasteApiResponseToFormFieldValues(
  data: Waste,
): WasteFieldValues {
  return {
    ...data,
    flavor: data.flavor._id,
    releaseDate: DateTime.fromISO(data.releaseDate).toFormat(
      DATE_STRING_FORMAT,
    ),
    manufacturingDate: DateTime.fromISO(data.manufacturingDate).toFormat(
      DATE_STRING_FORMAT,
    ),
    displayDate: DateTime.fromISO(data.displayDate).toFormat(
      DATE_STRING_FORMAT,
    ),
  };
}

export function getRedGradient(percentage: number) {
  const clampedPercentage = Math.min(Math.max(percentage, 0), 100);
  const lightness = 100 - clampedPercentage * 0.5; // 0% -> 100, 100% -> 50
  return `hsl(0, 100%, ${lightness}%)`;
}

export function isMongoDuplicateKeyError(error: any) {
  if (typeof error?.data?.error?.errorResponse?.errmsg === 'string') {
    if (
      error.data.error.errorResponse.errmsg.includes(
        'E11000 duplicate key error',
      )
    ) {
      return true;
    }
  }
  return false;
}

export function isFetchBaseQueryError(error?: FetchBaseQueryError | SerializedError): error is FetchBaseQueryError {
  return !!error && 'status' in error && ('data' in error || ('error' in error && !error.data));
}

export function assertRtkQueryError(error?: FetchBaseQueryError | SerializedError) {
  if (isFetchBaseQueryError(error)) {
    if (typeof error.status !== 'number') {
      throw new Error(`${error.status}: ${error.error}`);
    } else {
      throw new Error(`${error.status}: ${(error.data as any)?.message}`);
    }
  }
}
