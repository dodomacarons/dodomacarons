import { Container } from '@mui/material';
import WasteForm from './WasteForm';
import { WasteGridList } from './WasteListGrid';

export function Waste() {
  return (
    <Container>
      <WasteForm />
      <WasteGridList />
    </Container>
  );
}
