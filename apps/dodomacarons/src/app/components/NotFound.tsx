import { Alert, Stack, Box, Button } from '@mui/material';
import { useNavigate } from 'react-router-dom';

export function NotFound() {
  const navigate = useNavigate();
  return (
    <Stack gap={2} sx={{ p: 4 }}>
      <Alert severity="info">A keresett oldal nem található</Alert>
      <Box>
        <Button
          variant="contained"
          onClick={() => {
            navigate('/');
          }}
        >
          Tovább a főoldalra
        </Button>
      </Box>
    </Stack>
  );
}
