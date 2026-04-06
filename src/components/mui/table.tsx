// common MUI component
import {
  Box,
  CircularProgress,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TablePagination,
  TableSortLabel,
  Typography,
  Tooltip,
} from "@mui/material";
import { ReactNode } from "react";

export type Order = "asc" | "desc" | "";

export interface Column<T> {
  id: keyof T | string;
  label: string;
  sortable?: boolean;
  render?: (row: T, index: number) => ReactNode;
}

interface AppTableProps<T> {
  columns: Column<T>[];
  rows: T[];
  loading?: boolean;

  page: number;
  pageSize: number;
  totalCount: number;

  sort?: string;
  order?: Order;

  onSort?: (column: string) => void;
  onPageChange: (page: number) => void;
  onPageSizeChange: (size: number) => void;
}

export function AppTable<T>({
  columns,
  rows,
  loading,
  page,
  pageSize,
  totalCount,
  sort,
  order,
  onSort,
  onPageChange,
  onPageSizeChange,
}: AppTableProps<T>) {
  return (
    <Paper sx={{ p: 2, background: "hsla(220, 35%, 3%, 0.4)" }}>
      <TableContainer
        sx={{
          minHeight: "60vh",
          maxHeight: "60vh",
          overflow: "auto",
        }}
      >
        <Table stickyHeader>
          <TableHead>
            <TableRow>
              {columns.map((col) => (
                <TableCell key={String(col.id)}>
                  {col.sortable ? (
                    <TableSortLabel
                      active={sort === col.id}
                      direction={order as "asc" | "desc"}
                      onClick={() => onSort?.(String(col.id))}
                    >
                      {col.label}
                    </TableSortLabel>
                  ) : (
                    col.label
                  )}
                </TableCell>
              ))}
            </TableRow>
          </TableHead>

          <TableBody>
            {loading ? (
              <TableRow>
                <TableCell colSpan={columns.length} align="center">
                  <CircularProgress size={24} />
                </TableCell>
              </TableRow>
            ) : rows.length === 0 ? (
              <TableRow>
                <TableCell colSpan={columns.length} align="center">
                  <Typography>No Data Found</Typography>
                </TableCell>
              </TableRow>
            ) : (
              rows.map((row, index) => (
                <TableRow key={index}>
                  {columns.map((col) => (
                    <TableCell key={String(col.id)}>
                      {col.render ? (
                        col.render(row, index)
                      ) : (
                        <Tooltip title={String((row as any)[col.id])}>
                          <Box>
                            {String((row as any)[col.id] ?? "")}
                          </Box>
                        </Tooltip>
                      )}
                    </TableCell>
                  ))}
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </TableContainer>

      <TablePagination
        component="div"
        count={totalCount}
        page={page}
        onPageChange={(_, newPage) => onPageChange(newPage)}
        rowsPerPage={pageSize}
        onRowsPerPageChange={(e) =>
          onPageSizeChange(parseInt(e.target.value, 10))
        }
      />
    </Paper>
  );
}
