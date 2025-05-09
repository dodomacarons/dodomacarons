import { useMemo, useState } from 'react';
import { DataGrid, GridSortModel } from '@mui/x-data-grid';
import { useGetAggregate1Query } from '../redux/waste.api.slice';
import { Box, FormLabel, Grid, Typography } from '@mui/material';
import { Aggregate1ApiResponse } from '../types';
import { DATE_STRING_FORMAT, getRedGradient } from '../misc';
import { DatePicker } from '@mui/x-date-pickers';
import { DateTime } from 'luxon';

const defaultDateFrom = DateTime.local()
  .minus({ year: 1 })
  .toFormat(DATE_STRING_FORMAT);
const defaultDateTo = DateTime.local().toFormat(DATE_STRING_FORMAT);

export function Aggregate1Grid() {
  const [dateFrom, setDateFrom] = useState(defaultDateFrom);
  const [dateTo, setDateTo] = useState(defaultDateTo);
  const [paginationModel, setPaginationModel] = useState({
    page: 0,
    pageSize: 50,
  });
  const [sortModel, setSortModel] = useState<GridSortModel | undefined>([
    {
      field: 'wasteRatio',
      sort: 'desc',
    },
  ]);
  const { data, isLoading, isFetching } = useGetAggregate1Query({
    dateFrom,
    dateTo,
    ...paginationModel,
    sortModel,
  });

  const dateFromValue = useMemo(() => DateTime.fromISO(dateFrom), [dateFrom]);
  const dateToValue = useMemo(() => DateTime.fromISO(dateTo), [dateTo]);

  return (
    <>
      <Grid container>
        <Grid size={6}>
          <Box sx={{ p: 4 }}>
            <FormLabel sx={{ mb: 2 }}>
              <Typography variant="h5">Gyártás dátuma (-tól)</Typography>
              <DatePicker
                closeOnSelect
                sx={{ width: '100%' }}
                value={dateFromValue}
                onChange={(newDate) => {
                  if (newDate) {
                    setDateFrom(newDate.toFormat(DATE_STRING_FORMAT));
                  }
                }}
              />
            </FormLabel>
          </Box>
        </Grid>
        <Grid size={6}>
          <Box sx={{ p: 4 }}>
            <FormLabel sx={{ mb: 2 }}>
              <Typography variant="h5">Gyártás dátuma (-ig)</Typography>
              <DatePicker
                closeOnSelect
                sx={{ width: '100%' }}
                value={dateToValue}
                onChange={(newDate) => {
                  if (newDate) {
                    setDateTo(newDate.toFormat(DATE_STRING_FORMAT));
                  }
                }}
              />
            </FormLabel>
          </Box>
        </Grid>
      </Grid>
      <DataGrid<Aggregate1ApiResponse>
        rows={data?.items || []}
        getRowId={(row) => row.flavor}
        loading={isLoading || isFetching}
        columns={[
          {
            field: 'flavor.name',
            headerName: 'Macaron íz',
            width: 150,
            valueGetter: (_, row) => row.flavor,
          },

          {
            field: 'totalDisplayed',
            headerName: 'Pultba került',
            width: 150,
            type: 'number',
          },
          {
            field: 'totalWaste',
            headerName: 'Össz selejt',
            width: 150,
            type: 'number',
          },
          {
            field: 'wasteRatio',
            headerName: 'Selejt %',
            width: 150,
            type: 'number',
            renderCell: ({ value }) => {
              const backgroundColor = getRedGradient(value);
              return <Box sx={{ backgroundColor, px: 1 }}>{value}%</Box>;
            },
          },
        ]}
        initialState={{
          sorting: {
            sortModel,
          },
        }}
        disableColumnFilter={true}
        disableRowSelectionOnClick={true}
        sortingMode="server"
        paginationMode="server"
        rowCount={data?.total || 0}
        paginationModel={paginationModel}
        onPaginationModelChange={setPaginationModel}
        sortModel={sortModel}
        onSortModelChange={setSortModel}
      />
    </>
  );
}
