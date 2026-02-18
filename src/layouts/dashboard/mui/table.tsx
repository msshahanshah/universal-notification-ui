import {
  Box,
  CircularProgress,
  MenuItem,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TablePagination,
  TableSortLabel,
  TextField,
  Typography,
  Tooltip,
  IconButton,
} from "@mui/material";
import { useTheme } from "@mui/material/styles";
import { useEffect, useMemo, useState } from "react";
import RefreshIcon from "@mui/icons-material/Refresh";

import { useLogs, useLogStatus } from "src/hooks/useLogs";
import { useDebounce } from "src/hooks/useDebounce";

// import { getStatusStyle } from "./styles";
import { formatDateForTable, getStatusStyle } from "./utils";
import COLORS from "src/utility/colors";
import { useSnackbar } from "src/provider/snackbar";

interface Log {
  id: number;
  messageId: string;
  destination: string;
  service: string;
  status: string;
  messageDate: string;
  attempts: number;
}

type Order = "asc" | "desc" | "";

export const getSortLabelStyles = (theme: any) => ({
  "&.Mui-active": {
    color: theme.palette.text.secondary, // active text color
    fontWeight: 600,
  },
  "& .MuiTableSortLabel-icon": {
    color: theme.palette.text.secondary,
    opacity: 1,
  },
  "&.Mui-active .MuiTableSortLabel-icon": {
    color: theme.palette.text.secondary, // active arrow color
    opacity: 1,
  },
});

export const textFieldTheme = (theme: any) => ({
  "& .MuiInputLabel-root": {
    color: theme.palette.text.secondary, // default label color theme?.palette?.text?.secondary
  },
  "& .MuiInputLabel-root.Mui-focused": {
    color: theme.palette.text.secondary, // focused label color (blue)
    fontWeight: "bold",
    marginTop: -1,
  },
  "& .MuiOutlinedInput-input": {
    color: theme.palette.text.secondary,
  },
});

export default function LogsTable() {
  const [page, setPage] = useState(0);
  const [pageSize, setPageSize] = useState(10);

  const [sort, setSort] = useState<string>("messageDate");
  const [order, setOrder] = useState<Order>("desc");

  const [filters, setFilters] = useState({
    startDate: "",
    startTime: "",
    endDate: "",
    endTime: "",
    service: "",
    status: "",
    destination: "",
    attempts: "",
  });

  const theme = useTheme();

  const headerCellStyles = {
    backgroundColor: theme.palette.background.paper,
    color: theme.palette.text.primary,
    fontWeight: 600,
  };

  const buildUTCRange = (
    startDate?: string,
    startTime?: string,
    endDate?: string,
    endTime?: string,
  ) => {
    const result: Record<string, string> = {};

    if (startDate) {
      const start = new Date(`${startDate}T${startTime || "00:00"}:00`);
      result["start-time"] = start.toISOString().substring(0, 16) + ":00Z";
    }

    if (endDate) {
      const end = new Date(`${endDate}T${endTime || "23:59"}:00`);
      result["end-time"] = end.toISOString().substring(0, 16) + ":00Z";
    }

    return result;
  };

  const debouncedFilters = useDebounce(filters, 500);
  const showSnackbar = useSnackbar();

  const queryParams = useMemo(() => {
    const timeRange = buildUTCRange(
      debouncedFilters.startDate,
      debouncedFilters.startTime,
      debouncedFilters.endDate,
      debouncedFilters.endTime,
    );

    return {
      page: page + 1,
      limit: pageSize,
      // sort,
      // order,
      destination: debouncedFilters.destination || undefined,
      service: debouncedFilters.service || undefined,
      status: debouncedFilters.status || undefined,
      attempts: debouncedFilters.attempts || undefined,
      ...timeRange,
    };
  }, [page, pageSize, sort, order, debouncedFilters]);

  const { data: response, isLoading, isError, error } = useLogs(queryParams);

  const rows: Log[] = response?.data || [];
  const pagination = response?.pagination;

  useEffect(() => {
    if (isError) {
      showSnackbar(error?.message || "Failed to fetch logs", "error");
      return;
    }
  }, [isError, response?.data, error]);

  const renderCell = (value: any) => {
    return (
      <Tooltip
        title={value}
        componentsProps={{
          tooltip: {
            sx: {
              backgroundColor: theme.palette.grey[900],
              fontSize: 12,
            },
          },
        }}
      >
        <Box
          display="flex"
          alignItems="center"
          gap={1}
          // sx={getStatusStyle(latestStatus)}
        >
          <Typography>{value}</Typography>
        </Box>
      </Tooltip>
    );
  };

  const StatusCell = ({ row }: { row: Log }) => {
    const {
      data: statusData,
      refetch,
      isLoading,
    } = useLogStatus(row.messageId);

    const latestStatus = statusData?.data?.deliveryStatus ?? row.status;

    const handleRefresh = (e: React.MouseEvent) => {
      e.stopPropagation();
      if (!row.messageId) return;
      refetch();
    };

    return (
      <Tooltip title={latestStatus}>
        <Box
          display="flex"
          alignItems="center"
          gap={1}
          sx={getStatusStyle(latestStatus, theme)}
        >
          <Typography>
            {latestStatus?.charAt(0).toUpperCase() + latestStatus?.slice(1)}
          </Typography>

          <IconButton
            size="small"
            onClick={handleRefresh}
            style={{ background: "transparent" }}
          >
            {isLoading ? (
              <CircularProgress size={14} />
            ) : (
              <RefreshIcon fontSize="small" />
            )}
          </IconButton>
        </Box>
      </Tooltip>
    );
  };

  const handleSort = (column: string) => {
    const isAsc = sort === column && order === "asc";
    setSort(column);
    setOrder(isAsc ? "desc" : "asc");
  };

  const handleFilterChange = (key: keyof typeof filters, value: string) => {
    setPage(0);

    setFilters((prev) => {
      const updated = { ...prev, [key]: value };

      // 🔥 If start date cleared → clear start time
      if (key === "startDate" && !value) {
        updated.startTime = "";
      }

      // 🔥 If end date cleared → clear end time
      if (key === "endDate" && !value) {
        updated.endTime = "";
      }

      return updated;
    });
  };

  return (
    <Paper
      sx={{
        p: 2,
        backgroundColor: theme.palette.background.sidebar,
        border: `1px solid ${theme.palette.divider}`,
      }}
    >
      {/* Filters */}

      <Box display="flex" flexDirection="column" gap={2} mb={2}>
        {/* Row 1 → Date Time Range */}
        <Box display="flex" gap={2} alignItems="center" flexWrap="wrap">
          <TextField
            type="date"
            size="small"
            label="Start Date"
            InputLabelProps={{ shrink: true }}
            value={filters.startDate}
            onChange={(e) => handleFilterChange("startDate", e.target.value)}
            sx={textFieldTheme(theme)}
          />

          <TextField
            type="time"
            size="small"
            label="Start Time"
            InputLabelProps={{ shrink: true }}
            inputProps={{ step: 60 }}
            value={filters.startTime}
            onChange={(e) => handleFilterChange("startTime", e.target.value)}
            sx={textFieldTheme(theme)}
          />

          <TextField
            type="date"
            size="small"
            label="End Date"
            InputLabelProps={{ shrink: true }}
            value={filters.endDate}
            onChange={(e) => handleFilterChange("endDate", e.target.value)}
            sx={textFieldTheme(theme)}
          />

          <TextField
            type="time"
            size="small"
            label="End Time"
            InputLabelProps={{ shrink: true }}
            inputProps={{ step: 60 }}
            value={filters.endTime}
            onChange={(e) => handleFilterChange("endTime", e.target.value)}
            sx={textFieldTheme(theme)}
          />
        </Box>

        {/* Row 2 → Other Filters */}
        <Box
          display="flex"
          gap={2}
          alignItems="center"
          flexWrap="wrap"
          marginTop={1}
        >
          <TextField
            size="small"
            label="Service"
            value={filters.service}
            onChange={(e) =>
              setFilters((prev) => ({ ...prev, service: e.target.value }))
            }
            sx={textFieldTheme(theme)}
          />

          <TextField
            size="small"
            label="Status"
            value={filters.status}
            onChange={(e) =>
              setFilters((prev) => ({ ...prev, status: e.target.value }))
            }
            sx={textFieldTheme(theme)}
          />

          <TextField
            size="small"
            label="Destination"
            value={filters.destination}
            onChange={(e) =>
              setFilters((prev) => ({ ...prev, destination: e.target.value }))
            }
            sx={textFieldTheme(theme)}
          />

          <TextField
            size="small"
            label="Attempts"
            value={filters.attempts}
            onChange={(e) =>
              setFilters((prev) => ({ ...prev, attempts: e.target.value }))
            }
            sx={textFieldTheme(theme)}
          />
        </Box>
      </Box>

      {/* Table */}
      <TableContainer
        sx={{
          minHeight: "60vh",
          maxHeight: "60vh", // control height here

          border: `1px solid ${theme.palette.divider}`,
          borderRadius: 1,
          overflow: "auto"
        }}
      >
        <Table stickyHeader>
          <TableHead>
            <TableRow>
              <TableCell sx={getSortLabelStyles(theme)}>S. No</TableCell>
              <TableCell>
                <TableSortLabel
                  active={sort === "messageDate"}
                  direction={order as "asc" | "desc"}
                  onClick={() => handleSort("messageDate")}
                  sx={getSortLabelStyles(theme)}
                >
                  Date
                </TableSortLabel>
              </TableCell>

              <TableCell>
                <TableSortLabel
                  active={sort === "service"}
                  direction={order as "asc" | "desc"}
                  onClick={() => handleSort("service")}
                  sx={getSortLabelStyles(theme)}
                >
                  Service
                </TableSortLabel>
              </TableCell>

              <TableCell>
                <TableSortLabel
                  active={sort === "destination"}
                  direction={order as "asc" | "desc"}
                  onClick={() => handleSort("destination")}
                  sx={getSortLabelStyles(theme)}
                >
                  Destination
                </TableSortLabel>
              </TableCell>

              <TableCell>
                <TableSortLabel
                  active={sort === "status"}
                  direction={order as "asc" | "desc"}
                  onClick={() => handleSort("status")}
                  sx={getSortLabelStyles(theme)}
                >
                  Status
                </TableSortLabel>
              </TableCell>

              <TableCell>
                <TableSortLabel
                  active={sort === "attempts"}
                  direction={order as "asc" | "desc"}
                  onClick={() => handleSort("attempts")}
                  sx={getSortLabelStyles(theme)}
                >
                  Attempts
                </TableSortLabel>
              </TableCell>
            </TableRow>
          </TableHead>

          <TableBody>
            {isLoading ? (
              <TableRow>
                <TableCell colSpan={6} align="center">
                  <CircularProgress size={24} />
                </TableCell>
              </TableRow>
            ) : rows.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} align="center">
                  <Typography>No Data Found</Typography>
                </TableCell>
              </TableRow>
            ) : (
              rows.map((row, id) => (
                <TableRow key={row.id}>
                  <TableCell>{id + 1}</TableCell>
                  <TableCell>
                    {renderCell(formatDateForTable(row.messageDate))}
                  </TableCell>
                  <TableCell>{renderCell(row.service)}</TableCell>
                  <TableCell>{renderCell(row.destination)}</TableCell>
                  <TableCell>
                    <StatusCell row={row} />
                  </TableCell>
                  <TableCell>{renderCell(row.attempts)}</TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </TableContainer>

      {/* Pagination */}
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
        // sx={{
        //   backgroundColor: theme.palette.background.paper,
        //   color: theme.palette.text.secondary,
        //   borderTop: `1px solid ${theme.palette.divider}`,

        //   "& .MuiTablePagination-toolbar": {
        //     color: theme.palette.text.primary,
        //   },

        //   "& .MuiTablePagination-selectLabel": {
        //     color: theme.palette.text.secondary,
        //   },

        //   "& .MuiTablePagination-displayedRows": {
        //     color: theme.palette.text.secondary,
        //   },

        //   "& .MuiSelect-select": {
        //     color: theme.palette.text.secondary,
        //   },

        //   "& .MuiSvgIcon-root": {
        //     color: theme.palette.text.secondary,
        //   },
        // }}
      />
    </Paper>
  );
}
