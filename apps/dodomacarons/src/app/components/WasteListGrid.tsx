import { Grid2 as Grid } from '@mui/material';
import { DataGrid, GridSortModel } from '@mui/x-data-grid';
import { DateTime } from 'luxon';
import { Waste } from '../types';
import { useGetWastesQuery } from '../redux/waste.api.slice';
import { useEffect, useState } from 'react';

export function WasteGridList() {
  const [rowCount, setRowCount] = useState(0);
  const [paginationModel, setPaginationModel] = useState({
    page: 0,
    pageSize: 25,
  });
  const [sortModel, setSortModel] = useState<GridSortModel | undefined>([
    {
      field: 'displayDate',
      sort: 'desc',
    },
  ]);
  const { data, isLoading, isFetching } = useGetWastesQuery({
    ...paginationModel,
    sortModel,
  });

  const wasteList = data?.data;

  useEffect(() => {
    if (data?.total) {
      setRowCount(data.total || 0);
    }
  }, [data?.total]);

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
            type: 'date',
            valueFormatter(value: string) {
              return DateTime.fromISO(value).toFormat('yyyy. MM. dd.');
            },
          },
          {
            field: 'releaseDate',
            headerName: 'Kitárolás dátuma',
            width: 180,
            type: 'date',
            valueFormatter(value: string) {
              return DateTime.fromISO(value).toFormat('yyyy. MM. dd.');
            },
          },
          {
            field: 'displayDate',
            headerName: 'Pultba kerülés',
            width: 165,
            type: 'date',
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
            type: 'date',
            width: 200,
            valueFormatter(value: string) {
              return DateTime.fromISO(value).toFormat('yyyy. MM. dd., HH:mm');
            },
          },
        ]}
        initialState={{
          sorting: {
            sortModel,
          },
        }}
        rowCount={rowCount}
        paginationModel={paginationModel}
        onPaginationModelChange={setPaginationModel}
        paginationMode="server"
        disableColumnFilter={true}
        sortingMode="server"
        sortModel={sortModel}
        onSortModelChange={setSortModel}
      />
    </Grid>
  );
}
