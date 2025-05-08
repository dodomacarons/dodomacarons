import { Button, Grid, Typography } from '@mui/material';
import { DataGrid, GridSortModel } from '@mui/x-data-grid';
import { DateTime } from 'luxon';
import { Waste } from '../types';
import {
  useDeleteWasteMutation,
  useGetWastesQuery,
} from '../redux/waste.api.slice';
import { useEffect, useState } from 'react';
import { useSnackbar } from 'notistack';
import { WasteDeleteConfirmDialog } from './WasteDeleteConfirmDialog';
import { useDispatch } from 'react-redux';
import { setWasteBeingEdited, setWasteIdBeingEdited } from '../redux';

export function WasteGridList() {
  const dispatch = useDispatch();
  const [rowCount, setRowCount] = useState(0);
  const { enqueueSnackbar } = useSnackbar();
  const [deleteConfirmOpened, setDeleteConfirmOpened] = useState(false);
  const [wasteIdBeingDeleted, setWasteIdBeingDeleted] = useState('');
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

  const [deleteWaste, { isLoading: isDeleting }] = useDeleteWasteMutation();

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
          {
            field: 'updatedAt',
            headerName: 'Módosítás dátuma',
            type: 'date',
            width: 200,
            valueFormatter(value: string) {
              if (!value) {
                return '-';
              }
              return DateTime.fromISO(value).toFormat('yyyy. MM. dd., HH:mm');
            },
          },
          {
            field: 'edit',
            headerName: 'Szerkesztés',
            width: 120,
            sortable: false,
            renderCell({ row }) {
              return (
                <Button
                  variant="contained"
                  size="small"
                  onClick={() => {
                    dispatch(setWasteIdBeingEdited(row._id));
                    dispatch(setWasteBeingEdited(row));
                  }}
                >
                  Szerkesztés
                </Button>
              );
            },
          },
          {
            field: 'delete',
            headerName: 'Törlés',
            width: 120,
            sortable: false,
            renderCell({ row }) {
              return (
                <Button
                  variant="contained"
                  size="small"
                  color="error"
                  onClick={() => {
                    setWasteIdBeingDeleted(row._id);
                    setDeleteConfirmOpened((prev) => !prev);
                  }}
                >
                  Törlés
                </Button>
              );
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
        disableRowSelectionOnClick={true}
      />
      <WasteDeleteConfirmDialog
        open={deleteConfirmOpened}
        loading={isDeleting}
        onClose={() => {
          setDeleteConfirmOpened(false);
        }}
        onConfirm={async () => {
          if (wasteIdBeingDeleted) {
            const response = await deleteWaste(wasteIdBeingDeleted);
            if (response.error) {
              enqueueSnackbar(<Typography>Hiba történt.</Typography>, {
                variant: 'error',
              });
            } else {
              setWasteIdBeingDeleted('');
              setDeleteConfirmOpened(false);
              enqueueSnackbar(<Typography>Sikeres művelet.</Typography>, {
                variant: 'success',
              });
            }
          }
        }}
      />
    </Grid>
  );
}
