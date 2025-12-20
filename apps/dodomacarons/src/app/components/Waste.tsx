import { Box, CircularProgress, Container } from '@mui/material';
import WasteForm from './WasteForm';
import { WasteGridList } from './WasteListGrid';
import {
  useGetFlavorsQuery,
  useGetReasonsQuery,
} from '../redux/waste.api.slice';
import { useAssertRtkError } from '../hooks/useAssertRtkError';

import { useEffect } from 'react';
import { useDispatch } from 'react-redux';
import { setSelectedProductType } from '../redux/productType.slice';
import { EProductType } from '../types';

export interface WasteProps {
  productType: EProductType;
}

export function Waste({ productType }: WasteProps) {
  const dispatch = useDispatch();
  const {
    isLoading: isLoadingReasons,
    isFetching: isFetchingReasons,
    error: getReasonsError,
  } = useGetReasonsQuery({ productType });

  const {
    isLoading: isLoadingFlavors,
    isFetching: isFetchingFlavors,
    error: getFlavorsError,
  } = useGetFlavorsQuery({ productType });

  useAssertRtkError(getReasonsError);
  useAssertRtkError(getFlavorsError);

  useEffect(() => {
    dispatch(setSelectedProductType(productType));
  }, [productType, dispatch]);

  const hasError = !!(getReasonsError || getFlavorsError);

  const loading =
    isLoadingReasons ||
    isFetchingReasons ||
    isLoadingFlavors ||
    isFetchingFlavors;

  return (
    <>
      <Container sx={{ height: '100%' }}>
        {loading && (
          <Box
            sx={{
              p: 4,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <CircularProgress />
          </Box>
        )}
        {!loading && !hasError && <WasteForm productType={productType} />}
      </Container>
      {!loading && !hasError && <WasteGridList productType={productType} />}
    </>
  );
}
