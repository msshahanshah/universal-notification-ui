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
  TableSortLabel,
  TextField,
  Typography,
  Tooltip,
  IconButton,
  useTheme,
} from "@mui/material";
import { useEffect, useMemo, useState } from "react";
import RefreshIcon from "@mui/icons-material/Refresh";

import { useLogs, useLogStatus } from "src/hooks/useLogs";
import { useDebounce } from "src/hooks/useDebounce";
import { truncateString } from "src/utility/helper";
import { useSnackbar } from "src/provider/snackbar";

import { formatDateForTable, getStatusStyle } from "../../mui/utils";
import { getSortLabelStyles, textFieldTheme } from "../../mui/logs-table";


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

export default function HistoryTable() {
  const showSnackbar = useSnackbar();
  const [page, setPage] = useState(0);
  const [pageSize, setPageSize] = useState(10);
  const [sort, setSort] = useState<string>("messageDate");
  const [order, setOrder] = useState<Order>("");
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
  const buildUTCRange = (
    startDate?: string,
    startTime?: string,
    endDate?: string,
    endTime?: string,
  ) => {
    const result: Record<string, string> = {};

    if (startDate) {
      const start = new Date(`${startDate}T${startTime || "00:00"}:00`);
      result["from-date"] = start.toISOString().substring(0, 16) + ":00Z";
    }

    if (endDate) {
      const end = new Date(`${endDate}T${endTime || "23:59"}:00`);
      result["to-date"] = end.toISOString().substring(0, 16) + ":00Z";
    }

    return result;
  };

  const debouncedFilters = useDebounce(filters, 500);

  // Check if date filter is valid: both selected or both empty
  const isDateFilterValid =
    (debouncedFilters.startDate && debouncedFilters.endDate) ||
    (!debouncedFilters.startDate && !debouncedFilters.endDate);

  const queryParams = useMemo(() => {
    const timeRange = isDateFilterValid
      ? buildUTCRange(
          debouncedFilters.startDate,
          debouncedFilters.startTime,
          debouncedFilters.endDate,
          debouncedFilters.endTime,
        )
      : {};

    return {
      page: page + 1,
      limit: 10,
      sort,
      order,
      destination: debouncedFilters.destination || undefined,
      service: "slack",
      status: debouncedFilters.status || undefined,
      attempts: debouncedFilters.attempts || undefined,
      ...timeRange,
    };
  }, [page, pageSize, sort, order, debouncedFilters, isDateFilterValid]);

  const { data: response, isLoading, isError, error } = useLogs(queryParams);

  const rows: Log[] = response?.data || [];

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
      <Tooltip title={latestStatus} placement="bottom">
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

  const handleDateBlur = (key, e) => {
    const value = e.target.value; // always get latest value from DOM

    if (!value) {
      // reset invalid/partial input
      e.target.value = "";
      setFilters((prev) => ({
        ...prev,
        [key]: "",
      }));
      return;
    }

    // valid date
    setFilters((prev) => {
      const updated = { ...prev, [key]: value };

      return updated;
    });
  };

  return (
    <Paper
      sx={{
        p: 2,
        backgroundColor: theme.vars?.palette.background.paper,
        border: `1px solid ${theme.vars?.palette.divider}`,
        width: "100%",
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
            onBlur={(e) => handleDateBlur("startDate", e)}
            required
            sx={{
              ...textFieldTheme(theme),
              "& .MuiFormLabel-asterisk": {
                color: "red",
              },
            }}
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
            onBlur={(e) => handleDateBlur("startTime", e)}
          />

          <TextField
            type="date"
            size="small"
            label="End Date"
            InputLabelProps={{ shrink: true }}
            value={filters.endDate}
            onChange={(e) => handleFilterChange("endDate", e.target.value)}
            onBlur={(e) => handleDateBlur("endDate", e)}
            required
            sx={{
              ...textFieldTheme(theme),
              "& .MuiFormLabel-asterisk": {
                color: "red",
              },
            }}
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
            onBlur={(e) => handleDateBlur("endTime", e)}
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
            label="Status"
            value={filters.status}
            onChange={(e) => {
              setPage(0);
              setFilters((prev) => ({ ...prev, status: e.target.value }));
            }}
            sx={textFieldTheme(theme)}
          />

          <TextField
            size="small"
            label="Destination"
            value={filters.destination}
            onChange={(e) => {
              setPage(0);
              setFilters((prev) => ({ ...prev, destination: e.target.value }));
            }}
            sx={textFieldTheme(theme)}
          />

          <TextField
            size="small"
            label="Attempts"
            value={filters.attempts}
            onChange={(e) => {
              setPage(0);
              setFilters((prev) => ({ ...prev, attempts: e.target.value }));
            }}
            sx={textFieldTheme(theme)}
          />
        </Box>
      </Box>

      {/* Table */}
      <TableContainer
        sx={{
          minHeight: "20vh",
          maxHeight: "30vh", // control height here
          overflow: "auto",
          border: `1px solid ${theme.vars?.palette.divider}`,
          borderRadius: 1,
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

                  <TableCell>
                    {renderCell(
                      row.destination,
                      truncateString(row.destination, 30),
                    )}
                  </TableCell>
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
    </Paper>
  );
}
