import { Alert, Box, CircularProgress, Container } from '@mui/material';
import WasteForm from './WasteForm';
import { WasteGridList } from './WasteListGrid';
import {
  useGetFlavorsQuery,
  useGetReasonsQuery,
} from '../redux/waste.api.slice';

export function Waste() {
  const {
    isLoading: isLoadingReasons,
    isFetching: isFetchingReasons,
    isError: isGettingReasonsError,
  } = useGetReasonsQuery();
  const {
    isLoading: isLoadingFlavors,
    isFetching: isFetchingFlavors,
    isError: isGettingFlavorsError,
  } = useGetFlavorsQuery();

  const loading =
    isLoadingReasons ||
    isFetchingReasons ||
    isLoadingFlavors ||
    isFetchingFlavors;
  const isError = isGettingReasonsError || isGettingFlavorsError;

  if (isError) {
    return (
      <Box sx={{ p: 4 }}>
        <Alert severity="error">A szolgáltatás nem elérhető.</Alert>
      </Box>
    );
  }

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
        {!loading && <WasteForm />}
      </Container>
      {!loading && <WasteGridList />}
    </>
  );
}
