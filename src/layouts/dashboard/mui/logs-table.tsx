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
import { useSnackbar } from "src/provider/snackbar";
import { truncateString } from "src/utility/helper";
import { formatUserReactions } from "src/utility/reactions";

import { formatDateForTable, getStatusStyle } from "./utils";

interface Log {
  id: number;
  messageId: string;
  destination: string;
  service: string;
  status: string;
  messageDate: string;
  attempts: number;
  userRepliedMessages?: { reactions: string }[];
}

type Order = "asc" | "desc" | "";

export const getSortLabelStyles = (theme: any, isActive?: boolean) => ({
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

interface LogsTableProps {
  styles?: React.CSSProperties;
  serviceType?: string;
  endpoint?: string;
}

export default function LogsTable({
  styles,
  serviceType,
  endpoint,
}: LogsTableProps = {}) {
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
  const showSnackbar = useSnackbar();

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
      limit: pageSize,
      sort,
      order,
      destination: debouncedFilters.destination || undefined,
      service: debouncedFilters.service || undefined,
      status: debouncedFilters.status || undefined,
      attempts: debouncedFilters.attempts || undefined,
      ...timeRange,
    };
  }, [page, pageSize, sort, order, debouncedFilters, isDateFilterValid]);

  const {
    data: response,
    isLoading,
    isError,
    error,
  } = useLogs(queryParams, endpoint);

  const rows: Log[] = response?.data || [];
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

  const resetFilters = () => {
    setPage(0);
    setPageSize(10);
  };

  const handleFilterChange = (key: keyof typeof filters, value: string) => {
    resetFilters();

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
        ...styles,
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
            value={filters.startDate || ""}
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
          {!serviceType && (
            <TextField
              size="small"
              label="Service"
              value={filters.service}
              onChange={(e) => {
                setPage(0);
                resetFilters();
                setFilters((prev) => ({ ...prev, service: e.target.value }));
              }}
              sx={textFieldTheme(theme)}
            />
          )}

          <TextField
            size="small"
            label="Status"
            value={filters.status}
            onChange={(e) => {
              setPage(0);
              resetFilters();
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
              resetFilters();
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
              resetFilters();
              setFilters((prev) => ({ ...prev, attempts: e.target.value }));
            }}
            sx={textFieldTheme(theme)}
          />
        </Box>
      </Box>

      {/* Table */}
      <Box position="relative">
        <TableContainer
          sx={{
            minHeight: "600px",
            maxHeight: "600px", // control height here
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
                    active={sort === "messageDate"}
                    direction={order as "asc" | "desc"}
                    onClick={() => handleSort("messageDate")}
                    sx={getSortLabelStyles(theme, sort === "messageDate")}
                  >
                    Date
                  </TableSortLabel>
                </TableCell>

                {!serviceType && (
                  <TableCell>
                    <TableSortLabel
                      active={sort === "service"}
                      direction={order as "asc" | "desc"}
                      onClick={() => handleSort("service")}
                      sx={getSortLabelStyles(theme, sort === "service")}
                    >
                      Service
                    </TableSortLabel>
                  </TableCell>
                )}

                {serviceType === "slack" && <TableCell>Reactions</TableCell>}

                <TableCell>
                  <TableSortLabel
                    active={sort === "destination"}
                    direction={order as "asc" | "desc"}
                    onClick={() => handleSort("destination")}
                    sx={getSortLabelStyles(theme, sort === "destination")}
                  >
                    Destination
                  </TableSortLabel>
                </TableCell>

                <TableCell>
                  <TableSortLabel
                    active={sort === "status"}
                    direction={order as "asc" | "desc"}
                    onClick={() => handleSort("status")}
                    sx={getSortLabelStyles(theme, sort === "status")}
                  >
                    Status
                  </TableSortLabel>
                </TableCell>

                <TableCell>
                  <TableSortLabel
                    active={sort === "attempts"}
                    direction={order as "asc" | "desc"}
                    onClick={() => handleSort("attempts")}
                    sx={getSortLabelStyles(theme, sort === "attempts")}
                  >
                    Attempts
                  </TableSortLabel>
                </TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {rows.length === 0 && !isLoading ? (
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
                    {!serviceType && (
                      <TableCell>{renderCell(row.service)}</TableCell>
                    )}
                    {serviceType === "slack" && (
                      <TableCell>
                        {renderCell(
                          formatUserReactions(row.userRepliedMessages),
                        )}
                      </TableCell>
                    )}
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
      />
    </Paper>
  );
}
