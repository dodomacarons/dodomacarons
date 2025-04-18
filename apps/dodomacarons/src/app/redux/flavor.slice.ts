import { createSelector, createSlice } from '@reduxjs/toolkit';
import { RootState } from './store';

export interface FlavorState {
  selectedFlavor: string | null;
  recentlyUsedFlavors: string[];
}

export const initialState: FlavorState = {
  selectedFlavor: null,
  recentlyUsedFlavors: [],
};

export const flavorSlice = createSlice({
  name: 'flavor',
  initialState,
  reducers: {
    setSelectedFlavor(state, action) {
      const flavor = action.payload;
      state.selectedFlavor = flavor;

      const index = state.recentlyUsedFlavors.indexOf(flavor);
      if (index === -1) {
        if (state.recentlyUsedFlavors.length === 25) {
          state.recentlyUsedFlavors.shift();
        }

        state.recentlyUsedFlavors.push(flavor);
      }
    },
    clearSelectedFlavor(state) {
      state.selectedFlavor = null;
    },
    removeRecentlyUsedFlavor(state, action) {
      state.recentlyUsedFlavors = state.recentlyUsedFlavors.filter(
        (flavor) => flavor !== action.payload
      );
    },
  },
});

export const selectFlavorState = (state: RootState): FlavorState =>
  state.flavor;

export const selectRecentlyUsedFlavors = createSelector(
  selectFlavorState,
  (flavor) => flavor.recentlyUsedFlavors
);

export const {
  setSelectedFlavor,
  clearSelectedFlavor,
  removeRecentlyUsedFlavor,
} = flavorSlice.actions;
