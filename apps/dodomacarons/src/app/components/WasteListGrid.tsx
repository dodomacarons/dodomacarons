import { DataGrid } from '@mui/x-data-grid';
import { DateTime } from 'luxon';
import { WasteFieldValues } from '../types';
import { useSelector } from 'react-redux';
import { selectWasteList } from '../redux';

export function WasteGridList() {
  const wasteList = useSelector(selectWasteList);

  return (
    <DataGrid<WasteFieldValues>
      rows={wasteList}
      columns={[
        { field: 'flavor', headerName: 'Macaron íz', width: 150 },
        {
          field: 'releasedQuantity',
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
            return DateTime.fromISO(value).toFormat('yyyy. MM. dd.');
          },
        },
      ]}
      initialState={{
        sorting: {
          sortModel: [{ field: 'createdAt', sort: 'desc' }],
        },
      }}
    ></DataGrid>
  );
}
