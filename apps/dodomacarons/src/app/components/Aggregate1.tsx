import { useMemo, useState } from 'react';
import { DataGrid } from '@mui/x-data-grid';
import { useGetAggregate1Query } from '../redux/waste.api.slice';
import { Box, FormLabel, Grid2 as Grid, Typography } from '@mui/material';
import { Aggregate1ApiResponse } from '../types';
import { DATE_STRING_FORMAT, getRedGradient } from '../misc';
import { DatePicker } from '@mui/x-date-pickers';
import { DateTime } from 'luxon';

const defaultDisplayDateFrom = DateTime.local()
  .minus({ year: 1 })
  .toFormat(DATE_STRING_FORMAT);
const defaultDisplayDateTo = DateTime.local().toFormat(DATE_STRING_FORMAT);

export function Aggregate1Grid() {
  const [displayDateFrom, setDisplayDateFrom] = useState(
    defaultDisplayDateFrom
  );
  const [displayDateTo, setDisplayDateTo] = useState(defaultDisplayDateTo);
  const {
    data: aggregate1,
    isLoading,
    isFetching,
  } = useGetAggregate1Query({
    displayDateFrom,
    displayDateTo,
  });

  const displayDateFromValue = useMemo(
    () => DateTime.fromISO(displayDateFrom),
    [displayDateFrom]
  );
  const displayDateToValue = useMemo(
    () => DateTime.fromISO(displayDateTo),
    [displayDateTo]
  );

  return (
    <>
      <Grid container>
        <Grid size={6}>
          <Box sx={{ p: 4 }}>
            <FormLabel sx={{ mb: 2 }}>
              <Typography variant="h5">Időszak kezdete</Typography>
              <DatePicker
                closeOnSelect
                sx={{ width: '100%' }}
                value={displayDateFromValue}
                onChange={(newDate) => {
                  if (newDate) {
                    setDisplayDateFrom(newDate.toFormat(DATE_STRING_FORMAT));
                  }
                }}
              />
            </FormLabel>
          </Box>
        </Grid>
        <Grid size={6}>
          <Box sx={{ p: 4 }}>
            <FormLabel sx={{ mb: 2 }}>
              <Typography variant="h5">Időszak vége</Typography>
              <DatePicker
                closeOnSelect
                sx={{ width: '100%' }}
                value={displayDateToValue}
                onChange={(newDate) => {
                  if (newDate) {
                    setDisplayDateTo(newDate.toFormat(DATE_STRING_FORMAT));
                  }
                }}
              />
            </FormLabel>
          </Box>
        </Grid>
      </Grid>
      <DataGrid<Aggregate1ApiResponse>
        rows={aggregate1 || []}
        getRowId={(row) => row.flavor}
        loading={isLoading || isFetching}
        columns={[
          { field: 'flavor', headerName: 'Macaron íz', width: 150 },

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
            sortModel: [{ field: 'wasteRatio', sort: 'desc' }],
          },
        }}
        disableColumnFilter={true}
        hideFooterPagination={true}
      />
    </>
  );
}
