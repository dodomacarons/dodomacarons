import { Grid2 as Grid } from '@mui/material';
import { DataGrid } from '@mui/x-data-grid';
import { DateTime } from 'luxon';
import { Waste } from '../types';
import { useGetWastesQuery } from '../redux/waste.api.slice';

export function WasteGridList() {
  const { data: wasteList, isLoading, isFetching } = useGetWastesQuery({});

  return (
    <Grid container>
      <DataGrid<Waste>
        rows={wasteList || []}
        getRowId={(row) => row._id}
        loading={isLoading || isFetching}
        columns={[
          { field: 'flavor', headerName: 'Macaron íz', width: 150 },
          {
            field: 'displayedQuantity',
            headerName: 'Darab',
            type: 'number',
            width: 110,
          },
          {
            field: 'manufacturingDate',
            headerName: 'Gyártás dátuma',
            width: 175,
            valueFormatter(value: string) {
              return DateTime.fromISO(value).toFormat('yyyy. MM. dd.');
            },
          },
          {
            field: 'releaseDate',
            headerName: 'Kitárolás dátuma',
            width: 180,
            valueFormatter(value: string) {
              return DateTime.fromISO(value).toFormat('yyyy. MM. dd.');
            },
          },
          {
            field: 'displayDate',
            headerName: 'Pultba kerülés',
            width: 165,
            valueFormatter(value: string) {
              return DateTime.fromISO(value).toFormat('yyyy. MM. dd.');
            },
          },

          {
            field: 'manufacturingWasteQuantity',
            headerName: 'Gyártási selejt',
            type: 'number',
            width: 165,
          },
          {
            field: 'shippingWasteQuantity',
            headerName: 'Szállítási selejt',
            type: 'number',
            width: 170,
          },
          {
            field: 'manufacturingWasteReason',
            headerName: 'Problémák',
            width: 200,
            valueGetter(reasons?: { reason: string }[]) {
              if (reasons) {
                return reasons.map(({ reason }) => reason).join(', ');
              }
              return '';
            },
          },
          {
            field: 'createdAt',
            headerName: 'Rögzítés dátuma',
            width: 200,
            valueFormatter(value: string) {
              return DateTime.fromISO(value).toFormat('yyyy. MM. dd., HH:mm');
            },
          },
        ]}
        initialState={{
          sorting: {
            sortModel: [{ field: 'createdAt', sort: 'desc' }],
          },
        }}
      ></DataGrid>
    </Grid>
  );
}
