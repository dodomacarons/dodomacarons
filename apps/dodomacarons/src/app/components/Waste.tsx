import { Box, CircularProgress, Container } from '@mui/material';
import WasteForm from './WasteForm';
import { WasteGridList } from './WasteListGrid';
import {
  useGetFlavorsQuery,
  useGetReasonsQuery,
} from '../redux/waste.api.slice';
import { useAssertRtkError } from '../hooks/useAssertRtkError';

export function Waste() {
  const {
    isLoading: isLoadingReasons,
    isFetching: isFetchingReasons,
    error: getReasonsError
  } = useGetReasonsQuery();

  const {
    isLoading: isLoadingFlavors,
    isFetching: isFetchingFlavors,
    error: getFlavorsError
  } = useGetFlavorsQuery();


  useAssertRtkError(getReasonsError);
  useAssertRtkError(getFlavorsError);

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
        {!loading && !hasError && <WasteForm />}
      </Container>
      {!loading && !hasError && <WasteGridList />}
    </>
  );
}
