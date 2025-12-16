import { useCallback, useMemo, useState } from 'react';
import { GridSortModel } from '@mui/x-data-grid';
import { useGetAggregate1Query } from '../redux/waste.api.slice';
import { Box, FormLabel, Grid, Stack, Switch, Typography } from '@mui/material';
import { Aggregate1ApiResponse } from '../types';
import { DATE_STRING_FORMAT, getRedGradient } from '../misc';
import { DatePicker } from '@mui/x-date-pickers';
import { DateTime } from 'luxon';
import { DataGrid } from './DataGrid';
import { useDispatch, useSelector } from 'react-redux';
import {
  selectAggregateDateFilterField,
  setAggregateDateFilterField,
} from '../redux';
import { useAssertRtkError } from '../hooks/useAssertRtkError';

const defaultDateFrom = DateTime.local()
  .minus({ year: 1 })
  .toFormat(DATE_STRING_FORMAT);
const defaultDateTo = DateTime.local().toFormat(DATE_STRING_FORMAT);

export function Aggregate1Grid({ productType = '' }: { productType?: string }) {
  const dispatch = useDispatch();
  const [dateFrom, setDateFrom] = useState(defaultDateFrom);
  const [dateTo, setDateTo] = useState(defaultDateTo);
  const dateFilterField = useSelector(selectAggregateDateFilterField);
  const setDateFilterField = useCallback(
    (newDateFilterField: typeof dateFilterField) => {
      dispatch(setAggregateDateFilterField(newDateFilterField));
    },
    [dispatch],
  );

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
  const {
    data,
    isLoading,
    isFetching,
    error: getAggregate1Error,
  } = useGetAggregate1Query({
    dateFrom,
    dateTo,
    dateFilterField,
    ...paginationModel,
    sortModel,
    productType,
  });

  const dateFromValue = useMemo(() => DateTime.fromISO(dateFrom), [dateFrom]);
  const dateToValue = useMemo(() => DateTime.fromISO(dateTo), [dateTo]);

  useAssertRtkError(getAggregate1Error);

  return (
    <>
      <Grid container>
        <Grid size={12}>
          <Stack
            direction="row"
            gap={0.5}
            sx={{ px: 4, py: 2, alignItems: 'center' }}
          >
            <Typography
              sx={{ opacity: dateFilterField === 'displayDate' ? 1 : 0.3 }}
            >
              Pultba kerülés dátuma
            </Typography>
            <Switch
              checked={dateFilterField === 'manufacturingDate'}
              onChange={(e, isChecked) => {
                if (isChecked) {
                  setDateFilterField('manufacturingDate');
                } else {
                  setDateFilterField('displayDate');
                }
              }}
            />
            <Typography
              sx={{
                opacity: dateFilterField === 'manufacturingDate' ? 1 : 0.3,
              }}
            >
              Gyártás dátuma
            </Typography>
          </Stack>
        </Grid>
        <Grid size={6}>
          <Box sx={{ p: 4, pt: 0 }}>
            <FormLabel sx={{ mb: 2 }}>
              <Typography variant="h5">
                {dateFilterField === 'manufacturingDate'
                  ? 'Gyártás'
                  : 'Pultba kerülés'}{' '}
                dátuma (-tól)
              </Typography>
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
          <Box sx={{ p: 4, pt: 0 }}>
            <FormLabel sx={{ mb: 2 }}>
              <Typography variant="h5">
                {dateFilterField === 'manufacturingDate'
                  ? 'Gyártás'
                  : 'Pultba kerülés'}{' '}
                dátuma (-ig)
              </Typography>
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
        columns={[
          {
            field: 'flavor.name',
            headerName: 'íz',
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
          {
            field: 'flavor.nameCopy',
            headerName: 'íz',
            width: 150,
            valueGetter: (_, row) => row.flavor,
          },
        ]}
        initialState={{
          sorting: {
            sortModel,
          },
        }}
        rows={data?.items || []}
        getRowId={(row) => row.flavor}
        loading={isLoading || isFetching}
        rowCount={data?.total || 0}
        paginationModel={paginationModel}
        onPaginationModelChange={setPaginationModel}
        sortModel={sortModel}
        onSortModelChange={setSortModel}
      />
    </>
  );
}
