import { createSelector, createSlice, PayloadAction } from '@reduxjs/toolkit';
import { Waste, WasteFieldValues } from '../types';
import { RootState } from './store';

export type WasteState = {
  list: WasteFieldValues[];
  wasteIdBeingEdited: string | null;
  wasteBeingEdited: Waste | null;
  aggregateDateFilterField: 'manufacturingDate' | 'displayDate';
};

export const initialState: WasteState = {
  list: [],
  wasteIdBeingEdited: null,
  wasteBeingEdited: null,
  aggregateDateFilterField: 'manufacturingDate',
};

export const wasteSlice = createSlice({
  name: 'waste',
  initialState,
  reducers: {
    setWasteIdBeingEdited: (state, action: PayloadAction<string | null>) => {
      state.wasteIdBeingEdited = action.payload;
    },
    setWasteBeingEdited: (state, action: PayloadAction<Waste | null>) => {
      state.wasteBeingEdited = action.payload;
    },
    setAggregateDateFilterField: (
      state,
      action: PayloadAction<'manufacturingDate' | 'displayDate'>,
    ) => {
      state.aggregateDateFilterField = action.payload;
    },
  },
});

export const selectWasteState = (state: RootState): WasteState => state.waste;

export const selectWasteList = createSelector(
  selectWasteState,
  (waste) => waste.list,
);

export const selectWasteIdBeingEdited = createSelector(
  selectWasteState,
  (waste) => waste.wasteIdBeingEdited,
);

export const selectWasteBeingEdited = createSelector(
  selectWasteState,
  (waste) => waste.wasteBeingEdited,
);

export const selectAggregateDateFilterField = createSelector(
  selectWasteState,
  (waste) => waste.aggregateDateFilterField,
);

export const {
  setWasteBeingEdited,
  setWasteIdBeingEdited,
  setAggregateDateFilterField,
} = wasteSlice.actions;
