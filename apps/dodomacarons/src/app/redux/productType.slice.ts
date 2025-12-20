import { createSelector, createSlice, PayloadAction } from '@reduxjs/toolkit';
import { RootState } from './store';
import { EProductType } from '../types';

export interface ProductTypeState {
  selectedProductType: EProductType;
}

export const initialState: ProductTypeState = {
  selectedProductType: EProductType.MACARON,
};

export const productTypeSlice = createSlice({
  name: 'productType',
  initialState,
  reducers: {
    setSelectedProductType(state, action: PayloadAction<EProductType>) {
      state.selectedProductType = action.payload;
    },
  },
});

export const selectProductTypeState = (state: RootState): ProductTypeState =>
  state.productType;

export const selectSelectedProductType = createSelector(
  selectProductTypeState,
  (productType) => productType.selectedProductType,
);

export const { setSelectedProductType } = productTypeSlice.actions;
