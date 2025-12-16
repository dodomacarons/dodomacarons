import { Box, CircularProgress, Container } from '@mui/material';
import WasteForm from './WasteForm';
import { WasteGridList } from './WasteListGrid';
import {
  useGetFlavorsQuery,
  useGetReasonsQuery,
} from '../redux/waste.api.slice';
import { useAssertRtkError } from '../hooks/useAssertRtkError';

import { useParams } from 'react-router-dom';
import { useEffect } from 'react';
import { useDispatch } from 'react-redux';
import { setSelectedProductType } from '../redux/productType.slice';

export function Waste() {
  const dispatch = useDispatch();
  const { productType } = useParams();
  const {
    isLoading: isLoadingReasons,
    isFetching: isFetchingReasons,
    error: getReasonsError,
  } = useGetReasonsQuery({ productType: productType || '' });

  const {
    isLoading: isLoadingFlavors,
    isFetching: isFetchingFlavors,
    error: getFlavorsError,
  } = useGetFlavorsQuery({ productType: productType || '' });

  useAssertRtkError(getReasonsError);
  useAssertRtkError(getFlavorsError);

  useEffect(() => {
    dispatch(setSelectedProductType(productType || null));
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
