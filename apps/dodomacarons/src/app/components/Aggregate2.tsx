import { DataGrid } from '@mui/x-data-grid';
import { useGetAggregate2Query } from '../redux/waste.api.slice';
import { Aggregate2ApiResponse } from '../types';
import { DateTime } from 'luxon';

export function Aggregate2Grid() {
  const { data: aggregate1, isLoading, isFetching } = useGetAggregate2Query();

  return (
    <DataGrid<Aggregate2ApiResponse>
      rows={aggregate1 || []}
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
  );
}
