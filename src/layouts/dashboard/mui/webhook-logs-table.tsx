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
  Chip,
} from "@mui/material";
import { useTheme } from "@mui/material/styles";
import { useEffect, useMemo, useState } from "react";

import { useLogs } from "src/hooks/useLogs";
import { useSnackbar } from "src/provider/snackbar";
import { truncateString } from "src/utility/helper";
import COLORS from "src/utility/colors";

import { formatDateForTable, getStatusStyle } from "./utils";

interface WebhookLog {
  id: string;
  clientId: string;
  webhookUrl: string;
  serviceTrigger: Record<string, string>;
  status: string;
  retryAttempts: number;
  webhookPayload: any;
  webhookResponse: any;
  createdAt: string;
  updatedAt: string;
}

type Order = "asc" | "desc" | "";

export const getSortLabelStyles = (theme: any, isActive: boolean) => ({
  "&.Mui-active": {
    color: isActive ? "#027AF2" : theme.vars?.palette.text.secondary,
    fontWeight: 600,
  },
  "& .MuiTableSortLabel-icon": {
    color: theme.vars?.palette.text.secondary,
    opacity: 1,
  },
  "&.Mui-active .MuiTableSortLabel-icon": {
    color: isActive ? "#027AF2" : theme.vars?.palette.text.secondary,
    opacity: 1,
  },
});

export const textFieldTheme = (theme: any) => ({
  "& .MuiInputLabel-root": {
    color: theme.vars?.palette.text.secondary, // default label color theme?.palette?.text?.secondary
  },
  "& .MuiInputLabel-root.Mui-focused": {
    color: theme.vars?.palette.text.secondary, // focused label color (blue)
    fontWeight: "bold",
    marginTop: -1,
  },
  "& .MuiOutlinedInput-input": {
    color: theme.vars?.palette.text.secondary,
  },
});

interface WebhookLogsTableProps {
  styles?: React.CSSProperties;
  endpoint?: string;
}

export default function WebhookLogsTable({
  styles,
  endpoint,
}: WebhookLogsTableProps = {}) {
  const [page, setPage] = useState(0);
  const [pageSize, setPageSize] = useState(10);

  const [sort, setSort] = useState<string>("updatedAt");
  const [order, setOrder] = useState<Order>("desc");

  const theme = useTheme();

  const showSnackbar = useSnackbar();

  const queryParams = useMemo(() => {
    return {
      page: page + 1,
      limit: pageSize,
      sort,
      order,
    };
  }, [page, pageSize, sort, order]); // Removed debouncedFilters and isDateFilterValid dependencies

  const {
    data: response,
    isLoading,
    isError,
    error,
  } = useLogs(queryParams, endpoint);

  const rows: WebhookLog[] = response?.data || [];
  const pagination = response?.pagination;

  useEffect(() => {
    if (isError) {
      showSnackbar(error?.message || "Failed to fetch logs", "error");
      return;
    }
  }, [isError, response?.data, error]);

  const renderCell = (fullValue: any, value?: any) => {
    return (
      <Tooltip
        title={fullValue}
        componentsProps={{
          tooltip: {
            sx: {
              backgroundColor: theme.vars?.palette.grey[900],
              fontSize: 12,
            },
          },
        }}
      >
        <Box display="flex" alignItems="center" gap={1}>
          <Typography>{value || fullValue}</Typography>
        </Box>
      </Tooltip>
    );
  };

  const renderServiceChips = (serviceTrigger: Record<string, string>) => {
    const services = Object.entries(serviceTrigger || {});
    
    if (services.length === 0) {
      return (
        <Typography sx={{ color: theme.vars?.palette.text.secondary }}>
          N/A
        </Typography>
      );
    }

    return (
      <Box display="flex" gap={0.5} flexWrap="wrap">
        {services.map(([key, value]) => (
          <Chip
            key={`${key}-${value}`}
            label={`${key}: ${value}`}
            size="small"
            sx={{
              backgroundColor: COLORS.ACTIVE_BLUE + "20",
              color: COLORS.ACTIVE_BLUE,
              border: `1px solid ${COLORS.ACTIVE_BLUE + "40"}`,
              fontWeight: 500,
              fontSize: "12px",
              height: "24px",
            }}
          />
        ))}
      </Box>
    );
  };

  const StatusCell = ({ row }: { row: WebhookLog }) => {
    // For webhook logs, we use the status directly from the row
    const status = row.status;

    return (
      <Tooltip title={status}>
        <Box
          display="flex"
          alignItems="center"
          gap={1}
          sx={getStatusStyle(status, theme)}
        >
          <Typography>
            {status?.charAt(0).toUpperCase() + status?.slice(1)}
          </Typography>
        </Box>
      </Tooltip>
    );
  };

  const handleSort = (column: string) => {
    const isAsc = sort === column && order === "asc";
    setSort(column);
    setOrder(isAsc ? "desc" : "asc");
  };

  return (
    <Paper
      sx={{
        p: 2,
        backgroundColor: theme.vars?.palette.background.paper,
        border: `1px solid ${theme.vars?.palette.divider}`,
        ...styles,
      }}
    >
      <Box position="relative">
        <TableContainer
          sx={{
            minHeight: "600px",
            maxHeight: "600px",
            border: `1px solid ${theme.vars?.palette.divider}`,
            borderRadius: 1,
            overflow: "auto",
          }}
        >
          <Table stickyHeader>
            <TableHead>
              <TableRow>
                <TableCell sx={getSortLabelStyles(theme, false)}>
                  S. No
                </TableCell>
                <TableCell>
                  <TableSortLabel
                    active={sort === "updatedAt"}
                    direction={order as "asc" | "desc"}
                    onClick={() => handleSort("updatedAt")}
                    sx={getSortLabelStyles(theme, sort === "updatedAt")}
                  >
                    Updated Date
                  </TableSortLabel>
                </TableCell>
                <TableCell>
                  <TableSortLabel
                    active={sort === "createdAt"}
                    direction={order as "asc" | "desc"}
                    onClick={() => handleSort("createdAt")}
                    sx={getSortLabelStyles(theme, sort === "createdAt")}
                  >
                    Created Date
                  </TableSortLabel>
                </TableCell>
                <TableCell>Webhook URL</TableCell>
                <TableCell>Service</TableCell>
                <TableCell>Status</TableCell>
                <TableCell>Retry Attempts</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {rows.length === 0 && !isLoading ? (
                <TableRow>
                  <TableCell colSpan={7} align="center">
                    <Typography>No Data Found</Typography>
                  </TableCell>
                </TableRow>
              ) : (
                rows.map((row, id) => (
                  <TableRow key={row.id}>
                    <TableCell>{id + 1}</TableCell>
                    <TableCell>
                      {renderCell(formatDateForTable(row.updatedAt))}
                    </TableCell>
                    <TableCell>
                      {renderCell(formatDateForTable(row.createdAt))}
                    </TableCell>
                    <TableCell>
                      {renderCell(
                        row.webhookUrl,
                        truncateString(row.webhookUrl, 30),
                      )}
                    </TableCell>
                    <TableCell>
                      {renderServiceChips(row.serviceTrigger)}
                    </TableCell>
                    <TableCell>
                      <StatusCell row={row} />
                    </TableCell>
                    <TableCell>{renderCell(row.retryAttempts)}</TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </TableContainer>
        {isLoading && (
          <Box
            position="absolute"
            top={0}
            left={0}
            right={0}
            bottom={0}
            display="flex"
            alignItems="center"
            justifyContent="center"
            bgcolor="background.paper"
            sx={{ opacity: 0.6 }}
          >
            <CircularProgress size={28} />
          </Box>
        )}
      </Box>

      <TablePagination
        component="div"
        count={(pagination?.totalPages || 0) * pageSize}
        page={page}
        onPageChange={(_, newPage) => setPage(newPage)}
        rowsPerPage={pageSize}
        onRowsPerPageChange={(e) => {
          setPageSize(parseInt(e.target.value, 10));
          setPage(0);
        }}
      />
    </Paper>
  );
}
