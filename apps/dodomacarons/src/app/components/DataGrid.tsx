import {
  DataGridProps as MUIDataGridProps,
  DataGrid as MUIDataGrid,
  GridValidRowModel,
} from '@mui/x-data-grid';
import { huHU as dataGridLocaleHU } from '@mui/x-data-grid/locales';

export type DataGridProps<T extends GridValidRowModel> = MUIDataGridProps<T>;

export function DataGrid<T extends GridValidRowModel>(props: DataGridProps<T>) {
  return (
    <MUIDataGrid<T>
      {...props}
      paginationMode="server"
      sortingMode="server"
      disableColumnFilter={true}
      disableRowSelectionOnClick={true}
      localeText={{
        ...dataGridLocaleHU.components.MuiDataGrid.defaultProps.localeText,
        paginationDisplayedRows: ({ from, to, count }) =>
          `${from} - ${to} / ${count === -1 ? `több mint ${to}` : count}`,
      }}
    />
  );
}
