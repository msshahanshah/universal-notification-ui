import {
  Box,
  Drawer,
  Typography,
  IconButton,
  CircularProgress,
} from "@mui/material";
import { useTheme } from "@mui/material/styles";
import CloseIcon from "@mui/icons-material/Close";

import Button from "src/components/button";
import { useWebhookLogs } from "src/hooks/useWebhook";
import WebhookLogsTable from "src/layouts/dashboard/mui/webhook-logs-table";

interface WebhookLogsDrawerProps {
  open: boolean;
  onClose: () => void;
}

export default function WebhookLogsDrawer({
  open,
  onClose,
}: WebhookLogsDrawerProps) {
  const theme = useTheme();

  const { data: logsData, isLoading, error, refetch } = useWebhookLogs();

  const logs = logsData?.data || [];

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
            <IconButton onClick={onClose} title="Close">
              <CloseIcon />
            </IconButton>
          </Box>
        </Box>

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
            </>
          )}
        </Box>
      </Box>
    </Drawer>
  );
}
