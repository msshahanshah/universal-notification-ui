import { useState, useEffect } from "react";
import {
  Box,
  Drawer,
  Typography,
  IconButton,
  CircularProgress,
  Paper,
  Accordion,
  AccordionSummary,
  AccordionDetails,
} from "@mui/material";
import { useTheme } from "@mui/material/styles";
import CloseIcon from "@mui/icons-material/Close";
import RefreshIcon from "@mui/icons-material/Refresh";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import ContentCopyIcon from "@mui/icons-material/ContentCopy";

import { useLogs } from "src/hooks/useLogs";
import { useSnackbar } from "src/provider/snackbar";
import {
  formatDateForTable,
  getStatusStyle,
} from "src/layouts/dashboard/mui/utils";
import LogsTable from "src/layouts/dashboard/mui/logs-table";
import Button from "src/components/button";
import { useWebhookLogs } from "src/hooks/useWebhook";
import COLORS from "src/utility/colors";
import WebhookLogsTable from "src/layouts/dashboard/mui/webhook-logs-table";

interface WebhookLogsDrawerProps {
  open: boolean;
  onClose: () => void;
}

interface WebhookLog {
  id: string;
  webhookUrl: string;
  serviceTrigger: Record<string, string[]>;
  status: string;
  retryAttempts: number;
  webhookPayload: any;
  webhookResponse: any;
  createdAt: string;
  updatedAt: string;
  retryEnabled: boolean;
  retryCount: number;
  isActive: boolean;
}

export default function WebhookLogsDrawer({
  open,
  onClose,
}: WebhookLogsDrawerProps) {
  const theme = useTheme();
  const showSnackbar = useSnackbar();
  const [expandedRows, setExpandedRows] = useState<string[]>([]);

  const { data: logsData, isLoading, error, refetch } = useWebhookLogs();

  const logs = logsData?.data || [];
  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case "success":
        return COLORS.SUCCESS;
      case "failed":
      case "error":
        return COLORS.FAILED;
      case "warning":
      case "pending":
        return COLORS.WARNING_COLOR;
      default:
        return theme.vars?.palette.text.secondary;
    }
  };

  const copyToClipboard = async (text: string, label: string) => {
    try {
      await navigator.clipboard.writeText(text);
      showSnackbar(`${label} copied to clipboard`, "success");
    } catch (error) {
      showSnackbar("Failed to copy to clipboard", "error");
    }
  };

  const toggleRowExpansion = (rowId: string) => {
    setExpandedRows((prev) =>
      prev.includes(rowId)
        ? prev.filter((id) => id !== rowId)
        : [...prev, rowId],
    );
  };

  const handleRefresh = () => {
    refetch();
  };

  return (
    <Drawer
      anchor="right"
      open={open}
      onClose={onClose}
      sx={{
        "& .MuiDrawer-paper": {
          width: { xs: "100%", sm: 600, md: 800 },
          backgroundColor: theme.vars?.palette.background.paper,
          borderLeft: `1px solid ${theme.vars?.palette.divider}`,
        },
      }}
    >
      <Box sx={{ height: "100vh", display: "flex", flexDirection: "column" }}>
        {/* Header */}
        <Box
          sx={{
            p: 2,
            borderBottom: `1px solid ${theme.vars?.palette.divider}`,
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
          }}
        >
          <Box sx={{ flex: 1, minWidth: 0 }}>
            <Typography variant="h6" color="text.secondary" sx={{ mb: 0.5 }}>
              Webhook Logs
            </Typography>
          </Box>
          <Box sx={{ display: "flex", gap: 1 }}>
            {/* <IconButton onClick={handleRefresh} title="Refresh logs">
              <RefreshIcon />
            </IconButton> */}
            <IconButton onClick={onClose} title="Close">
              <CloseIcon />
            </IconButton>
          </Box>
        </Box>

        {/* Content */}
        <Box sx={{ flex: 1, overflow: "auto", p: 2 }}>
          {isLoading ? (
            <Box
              sx={{
                display: "flex",
                justifyContent: "center",
                alignItems: "center",
                height: 200,
              }}
            >
              <CircularProgress />
            </Box>
          ) : error ? (
            <Box
              sx={{
                display: "flex",
                justifyContent: "center",
                alignItems: "center",
                height: 200,
                flexDirection: "column",
                gap: 2,
              }}
            >
              <Typography sx={{ color: theme.vars?.palette.text.secondary }}>
                Failed to load webhook logs
              </Typography>
              <Button onClick={handleRefresh} variant="outlined">
                Retry
              </Button>
            </Box>
          ) : logs.length === 0 ? (
            <Box
              sx={{
                display: "flex",
                justifyContent: "center",
                alignItems: "center",
                height: 200,
                flexDirection: "column",
                gap: 2,
              }}
            >
              <Typography sx={{ color: theme.vars?.palette.text.secondary }}>
                No logs available for this webhook
              </Typography>
            </Box>
          ) : (
            <>
              <Box sx={{ height: "400px", width: "100%" }}>
                <WebhookLogsTable
                  endpoint="/webhooks/logs"
                  styles={{ height: "700px" }}
                />
              </Box>

              {/* Expandable Details Section */}
              {/* {logs.map((log: any) => (
                <Accordion
                  key={log.id}
                  expanded={expandedRows.includes(log.id.toString())}
                  onChange={() => toggleRowExpansion(log.id.toString())}
                  sx={{ mt: 2 }}
                >
                  <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                    <Typography
                      variant="subtitle2"
                      sx={{ color: theme.vars?.palette.text.secondary }}
                    >
                      Log Details - {formatDateForTable(log.updatedAt)}
                    </Typography>
                  </AccordionSummary>
                  <AccordionDetails>
                    <Box
                      sx={{ display: "flex", flexDirection: "column", gap: 2 }}
                    >
                    
                      <Box>
                        <Box
                          sx={{
                            display: "flex",
                            justifyContent: "space-between",
                            alignItems: "center",
                            mb: 1,
                          }}
                        >
                          <Typography
                            variant="subtitle2"
                            sx={{ color: theme.vars?.palette.text.secondary }}
                          >
                            Payload
                          </Typography>
                          <IconButton
                            size="small"
                            onClick={() =>
                              copyToClipboard(
                                JSON.stringify(log.webhookPayload, null, 2),
                                "Payload",
                              )
                            }
                          >
                            <ContentCopyIcon fontSize="small" />
                          </IconButton>
                        </Box>
                        <Paper
                          variant="outlined"
                          sx={{
                            p: 2,
                            backgroundColor: theme.vars?.palette.action.hover,
                            maxHeight: 200,
                            overflow: "auto",
                          }}
                        >
                          <pre style={{ margin: 0, whiteSpace: "pre-wrap", color: theme.vars?.palette.text.secondary }}>
                            {JSON.stringify(log.webhookPayload, null, 2)}
                          </pre>
                        </Paper>
                      </Box>

               
                      <Box>
                        <Box
                          sx={{
                            display: "flex",
                            justifyContent: "space-between",
                            alignItems: "center",
                            mb: 1,
                          }}
                        >
                          <Typography
                            variant="subtitle2"
                            sx={{ color: theme.vars?.palette.text.secondary }}
                          >
                            Response
                          </Typography>
                          <IconButton
                            size="small"
                            onClick={() =>
                              copyToClipboard(
                                JSON.stringify(log.webhookResponse, null, 2),
                                "Response",
                              )
                            }
                          >
                            <ContentCopyIcon fontSize="small" />
                          </IconButton>
                        </Box>
                        <Paper
                          variant="outlined"
                          sx={{
                            p: 2,
                            backgroundColor: theme.vars?.palette.action.hover,
                            maxHeight: 200,
                            overflow: "auto",
                          }}
                        >
                          <pre style={{ margin: 0, whiteSpace: "pre-wrap", color: theme.vars?.palette.text.secondary }}>
                            {JSON.stringify(log.webhookResponse, null, 2)}
                          </pre>
                        </Paper>
                      </Box>
                    </Box>
                  </AccordionDetails>
                </Accordion>
              ))} */}
            </>
          )}
        </Box>
      </Box>
    </Drawer>
  );
}
