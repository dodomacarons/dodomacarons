import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { WasteFieldValues } from './types';

type WasteState = {
  list: WasteFieldValues[];
};

const initialState: WasteState = {
  list: [],
};

export const wasteSlice = createSlice({
  name: 'waste',
  initialState,
  reducers: {
    addWaste: (state, action: PayloadAction<WasteFieldValues>) => {
      state.list.push(action.payload);
    },
    removeWaste: (state, action: PayloadAction<number>) => {
      state.list.splice(action.payload, 1);
    },
    updateWaste: (
      state,
      action: PayloadAction<{
        index: number;
        updated: Partial<WasteFieldValues>;
      }>
    ) => {
      const { index, updated } = action.payload;
      if (state.list[index]) {
        state.list[index] = { ...state.list[index], ...updated };
      }
    },
    clearWaste: (state) => {
      state.list = [];
    },
  },
});

export const { addWaste, removeWaste, updateWaste, clearWaste } =
  wasteSlice.actions;
