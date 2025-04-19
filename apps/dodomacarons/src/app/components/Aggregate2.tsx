import { useMemo, useState } from 'react';
import { DataGrid } from '@mui/x-data-grid';
import { useGetAggregate2Query } from '../redux/waste.api.slice';
import { Box, FormLabel, Grid2 as Grid, Typography } from '@mui/material';
import { Aggregate2ApiResponse } from '../types';
import { DATE_STRING_FORMAT } from '../misc';
import { DatePicker } from '@mui/x-date-pickers';
import { DateTime } from 'luxon';

const defaultDateFrom = DateTime.local()
  .minus({ year: 1 })
  .toFormat(DATE_STRING_FORMAT);
const defaultDateTo = DateTime.local().toFormat(DATE_STRING_FORMAT);

export function Aggregate2Grid() {
  const [dateFrom, setDateFrom] = useState(defaultDateFrom);
  const [dateTo, setDateTo] = useState(defaultDateTo);
  const {
    data: aggregate2,
    isLoading,
    isFetching,
  } = useGetAggregate2Query({
    dateFrom,
    dateTo,
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
      <DataGrid<Aggregate2ApiResponse>
        rows={aggregate2 || []}
        getRowId={(row) => row.manufacturingDate}
        loading={isLoading || isFetching}
        columns={[
          {
            field: 'manufacturingDate',
            headerName: 'Gyártás dátuma',
            width: 200,
            type: 'date',
            valueFormatter(value: string) {
              return DateTime.fromISO(value).toFormat('yyyy. MM. dd.');
            },
          },
          {
            field: 'totalWaste',
            headerName: 'Össz selejt',
            width: 150,
            type: 'number',
          },
        ]}
        initialState={{
          sorting: {
            sortModel: [{ field: 'manufacturingDate', sort: 'desc' }],
          },
        }}
        disableColumnFilter={true}
        disableColumnMenu={true}
        hideFooterPagination={true}
      />
    </>
  );
}
