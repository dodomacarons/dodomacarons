import { Container } from '@mui/material';
import WasteForm from './WasteForm';
import { WasteGridList } from './WasteListGrid';
import { useGetReasonsQuery } from '../redux/waste.api.slice';

export function Waste() {
  const { data: reasons } = useGetReasonsQuery();
  return (
    <>
      <Container>
        <WasteForm />
      </Container>
      <WasteGridList />
    </>
  );
}
