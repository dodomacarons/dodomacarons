import { Button, Grid } from '@mui/material';
import { GridSortModel } from '@mui/x-data-grid';
import { DataGrid } from './DataGrid';
import { DateTime } from 'luxon';
import { Waste } from '../types';
import {
  useDeleteWasteMutation,
  useGetReasonsQuery,
  useGetWastesQuery,
} from '../redux/waste.api.slice';
import { useEffect, useState } from 'react';
import { EProductType } from '../types';
import { WasteDeleteConfirmDialog } from './WasteDeleteConfirmDialog';
import { useDispatch, useSelector } from 'react-redux';
import {
  selectWasteIdBeingEdited,
  setWasteBeingEdited,
  setWasteIdBeingEdited,
} from '../redux';
import { useNotification } from '../hooks/useNotification';
import { useAssertRtkError } from '../hooks/useAssertRtkError';

export function WasteGridList({ productType }: { productType?: string }) {
  const dispatch = useDispatch();
  const [rowCount, setRowCount] = useState(0);
  const { showError, showSuccess } = useNotification();
  const [deleteConfirmOpened, setDeleteConfirmOpened] = useState(false);
  const [wasteIdBeingDeleted, setWasteIdBeingDeleted] = useState('');
  const wasteIdBeingEdited = useSelector(selectWasteIdBeingEdited);
  const [paginationModel, setPaginationModel] = useState({
    page: 0,
    pageSize: 25,
  });
  const [sortModel, setSortModel] = useState<GridSortModel | undefined>([
    {
      field: 'createdAt',
      sort: 'desc',
    },
  ]);
  const {
    data,
    isLoading,
    isFetching,
    error: getWastesError,
  } = useGetWastesQuery({
    ...paginationModel,
    sortModel,
    productType: productType as EProductType,
  });

  const [deleteWaste, { isLoading: isDeleting }] = useDeleteWasteMutation();
  const { data: wasteReasons } = useGetReasonsQuery({
    productType: productType || '',
  });

  const wasteList = data?.data;

  useEffect(() => {
    if (data?.total) {
      setRowCount(data.total || 0);
    }
  }, [data?.total]);

  useAssertRtkError(getWastesError);

  return (
    <Grid container>
      <DataGrid<Waste>
        columns={[
          {
            field: 'flavor.name',
            headerName: 'íz',
            width: 150,
            valueGetter: (_, row) => row.flavor.name,
          },
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
                return reasons
                  .map(({ reason }) => {
                    const id = reason;
                    const registeredReason = wasteReasons?.find(
                      (r) => r._id === id,
                    );
                    if (registeredReason) {
                      return registeredReason.name;
                    }
                    return id;
                  })
                  .sort((a, b) => a.localeCompare(b))
                  .join(', ');
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
            field: 'comment',
            headerName: 'Megjegyzés',
            width: 200,
          },
          {
            field: 'flavor.nameCopy',
            headerName: 'íz',
            width: 150,
            valueGetter: (_, row) => row.flavor.name,
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
                    window.scrollTo({ top: 0, behavior: 'smooth' });
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
        getRowId={(row) => row._id}
        rows={wasteList || []}
        loading={isLoading || isFetching}
        rowCount={rowCount}
        paginationModel={paginationModel}
        sortModel={sortModel}
        onPaginationModelChange={setPaginationModel}
        onSortModelChange={setSortModel}
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
              showError(response.error);
            } else {
              if (wasteIdBeingDeleted === wasteIdBeingEdited) {
                dispatch(setWasteIdBeingEdited(null));
                dispatch(setWasteBeingEdited(null));
              }

              setWasteIdBeingDeleted('');
              setDeleteConfirmOpened(false);
              showSuccess();
            }
          }
        }}
      />
    </Grid>
  );
}
