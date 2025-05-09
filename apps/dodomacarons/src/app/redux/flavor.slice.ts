import { createSelector, createSlice, PayloadAction } from '@reduxjs/toolkit';
import { RootState } from './store';

export interface FlavorState {
  selectedFlavor: { _id: string; name: string } | null;
  recentlyUsedFlavors: { _id: string; name: string }[];
}

export const initialState: FlavorState = {
  selectedFlavor: null,
  recentlyUsedFlavors: [],
};

export const flavorSlice = createSlice({
  name: 'flavor',
  initialState,
  reducers: {
    setSelectedFlavor(
      state,
      action: PayloadAction<{ _id: string; name: string } | null>,
    ) {
      const flavor = action.payload;
      state.selectedFlavor = flavor;

      if (flavor === null) {
        return;
      }

      const index = state.recentlyUsedFlavors.findIndex(
        (rf) => rf._id === flavor._id,
      );
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
    removeRecentlyUsedFlavor(state, action: PayloadAction<string>) {
      state.recentlyUsedFlavors = state.recentlyUsedFlavors.filter(
        (flavor) => flavor._id !== action.payload,
      );
    },
    clearRecentlyUsedFlavors(state) {
      state.recentlyUsedFlavors = [];
    },
  },
});

export const selectFlavorState = (state: RootState): FlavorState =>
  state.flavor;

export const selectRecentlyUsedFlavors = createSelector(
  selectFlavorState,
  (flavor) => flavor.recentlyUsedFlavors,
);

export const selectSelectedFlavor = createSelector(
  selectFlavorState,
  (flavor) => flavor.selectedFlavor,
);

export const {
  setSelectedFlavor,
  clearSelectedFlavor,
  removeRecentlyUsedFlavor,
  clearRecentlyUsedFlavors,
} = flavorSlice.actions;
