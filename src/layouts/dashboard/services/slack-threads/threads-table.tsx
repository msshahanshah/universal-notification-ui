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
  Typography,
  IconButton,
  useTheme,
} from "@mui/material";
import { useEffect, useMemo, useState } from "react";
import RefreshIcon from "@mui/icons-material/Refresh";
import { MessageSquareIcon } from "lucide-react";

import { useSlackThreads } from "src/hooks/useSlackThreads";
import { useDebounce } from "src/hooks/useDebounce";
import { formatDateForTable, getStatusStyle } from "../../mui/utils";
import { useSnackbar } from "src/provider/snackbar";
import { SlackThread } from "src/api/slack-threads.api";

type Order = "asc" | "desc" | "";

interface ThreadsTableProps {
  channelId: string;
  onThreadClick: (thread: SlackThread) => void;
}

export function ThreadsTable({ channelId, onThreadClick }: ThreadsTableProps) {
  const showSnackbar = useSnackbar();
  const [page, setPage] = useState(0);
  const [pageSize, setPageSize] = useState(10);
  const [sort, setSort] = useState<string>("messageDate");
  const [order, setOrder] = useState<Order>("desc");

  const theme = useTheme();

  // const queryParams = useMemo(() => ({
  //   page: page + 1,
  //   limit: pageSize,
  //   sort,
  //   order,
  // }), [page, pageSize, sort, order]);

  const { data: response, isLoading, isError, error, refetch } = useSlackThreads();
  const rows: SlackThread[] = response?.data || [];

  useEffect(() => {
    if (isError) {
      showSnackbar(error?.message || "Failed to fetch threads", "error");
      return;
    }
  }, [isError, response?.data, error]);

  const renderCell = (fullValue: any, value?: any) => {
    return (
      <Box display="flex" alignItems="center" gap={1}>
        <Typography variant="body2">{value || fullValue}</Typography>
      </Box>
    );
  };

  const StatusCell = ({ row }: { row: SlackThread }) => {
    return (
      <Box
        display="flex"
        alignItems="center"
        gap={1}
        sx={getStatusStyle(row.status, theme)}
      >
        <Typography variant="body2">
          {row.status?.charAt(0).toUpperCase() + row.status?.slice(1)}
        </Typography>
      </Box>
    );
  };

  const handleSort = (column: string) => {
    const isAsc = sort === column && order === "asc";
    setSort(column);
    setOrder(isAsc ? "desc" : "asc");
  };

  const handleRefresh = () => {
    refetch();
  };

  const handleThreadClick = (thread: SlackThread) => {
    onThreadClick(thread);
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
      <Box
        display="flex"
        justifyContent="space-between"
        alignItems="center"
        mb={2}
      >
        <Typography variant="h6" color="text.secondary">
          Message Threads ({rows.length})
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

      <TableContainer
        sx={{
          minHeight: "20vh",
          maxHeight: "50vh",
          overflow: "auto",
          border: `1px solid ${theme.vars?.palette.divider}`,
          borderRadius: 1,
        }}
      >
        <Table stickyHeader>
          <TableHead>
            <TableRow>
              <TableCell sx={{ 
                fontWeight: "bold", 
                color: theme.vars?.palette.text.primary,
                backgroundColor: theme.vars?.palette.background.default
              }}>
                S. No
              </TableCell>
              <TableCell>
                <TableSortLabel
                  active={sort === "messageDate"}
                  direction={order as "asc" | "desc"}
                  onClick={() => handleSort("messageDate")}
                  sx={{ 
                    fontWeight: "bold", 
                    color: theme.vars?.palette.text.primary,
                    backgroundColor: theme.vars?.palette.background.default
                  }}
                >
                  Date
                </TableSortLabel>
              </TableCell>
              <TableCell sx={{ 
                fontWeight: "bold", 
                color: theme.vars?.palette.text.primary,
                backgroundColor: theme.vars?.palette.background.default
              }}>
                Reference ID
              </TableCell>
              <TableCell sx={{ 
                fontWeight: "bold", 
                color: theme.vars?.palette.text.primary,
                backgroundColor: theme.vars?.palette.background.default
              }}>
                Status
              </TableCell>
              <TableCell sx={{ 
                fontWeight: "bold", 
                color: theme.vars?.palette.text.primary,
                backgroundColor: theme.vars?.palette.background.default
              }}>
                Replies
              </TableCell>
              <TableCell sx={{ 
                fontWeight: "bold", 
                color: theme.vars?.palette.text.primary,
                backgroundColor: theme.vars?.palette.background.default
              }}>
                Actions
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
                  <Typography color="text.secondary">
                    {channelId ? "No threads found for this channel" : "Select a channel to view threads"}
                  </Typography>
                </TableCell>
              </TableRow>
            ) : (
              rows.map((row, id) => (
                <TableRow 
                  key={row.id}
                  hover
                  sx={{ cursor: "pointer" }}
                  onClick={() => handleThreadClick(row)}
                >
                  <TableCell>{id + 1}</TableCell>
                  <TableCell>
                    {renderCell(formatDateForTable(row.messageDate))}
                  </TableCell>
                  <TableCell>
                    {renderCell(row.referenceId)}
                  </TableCell>
                  <TableCell>
                    <StatusCell row={row} />
                  </TableCell>
                  <TableCell>
                    <Box display="flex" alignItems="center" gap={1}>
                      <MessageSquareIcon size={16} />
                      <Typography variant="body2">
                        {row.userReplyedMessages?.length || 0}
                      </Typography>
                    </Box>
                  </TableCell>
                  <TableCell>
                    <Typography 
                      variant="body2" 
                      sx={{ 
                        color: theme.vars?.palette.primary.main,
                        textDecoration: "underline"
                      }}
                    >
                      View Thread
                    </Typography>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </TableContainer>
    </Paper>
  );
}
