import { createSelector, createSlice, PayloadAction } from '@reduxjs/toolkit';
import { RootState } from './store';

export interface ProductTypeState {
  selectedProductType: string | null;
}

export const initialState: ProductTypeState = {
  selectedProductType: null,
};

export const productTypeSlice = createSlice({
  name: 'productType',
  initialState,
  reducers: {
    setSelectedProductType(state, action: PayloadAction<string | null>) {
      state.selectedProductType = action.payload;
    },
    clearSelectedProductType(state) {
      state.selectedProductType = null;
    },
  },
});

export const selectProductTypeState = (state: RootState): ProductTypeState=>
  state.productType;

export const selectSelectedProductType = createSelector(
  selectProductTypeState,
  (productType) => productType.selectedProductType,
);

export const {
  setSelectedProductType,
  clearSelectedProductType
} = productTypeSlice.actions;
