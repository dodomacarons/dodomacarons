import { DataGrid } from '@mui/x-data-grid';
import { useGetAggregate1Query } from '../redux/waste.api.slice';
import { Box } from '@mui/material';

const getRedGradient = (value: number) => {
  const clamped = Math.max(0, Math.min(100, value));
  const saturation = clamped;
  const lightness = 100 - clamped;
  return `hsl(0, ${saturation}%, ${lightness}%)`;
};

export function Aggregate1Grid() {
  const {
    data: aggregate1,
    isLoading,
    isFetching,
  } = useGetAggregate1Query({
    displayDateFrom: '2024-01-01',
    displayDateTo: '2025-12-31',
  });

  return (
    <DataGrid<any>
      rows={aggregate1 || []}
      getRowId={(row) => row.flavor}
      loading={isLoading || isFetching}
      columns={[
        { field: 'flavor', headerName: 'Macaron íz', width: 150 },

        { field: 'totalDisplayed', headerName: 'Pultba került', width: 150 },
        { field: 'totalWaste', headerName: 'Össz selejt', width: 150 },
        {
          field: 'wasteRatio',
          headerName: 'Selejt %',
          width: 150,
          renderCell: ({ value }) => {
            const backgroundColor = getRedGradient(value);

            return <Box sx={{ backgroundColor }}>{value}%</Box>;
          },
        },
      ]}
    ></DataGrid>
  );
}
