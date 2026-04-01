import { Edit2, Trash2 } from "lucide-react";
import { useState } from "react";
import { useTheme } from "@mui/material/styles";

import { useToggleWebhook, useDeleteWebhook } from "src/hooks/useWebhook";
import { useSnackbar } from "src/provider/snackbar";
import Switch from "src/components/switch";
import COLORS from "src/utility/colors";

interface WebhookListItemProps {
  webhook: {
    id: string;
    webhookUrl?: string;
    serviceTrigger?: Record<string, string[]>;
    isActive?: boolean;
    retryEnabled?: boolean;
    retryCount?: number;
    updatedAt?: string;
  };
  onEdit: (webhook: any) => void;
}

export default function WebhookListItem({
  webhook,
  onEdit,
}: WebhookListItemProps) {
  const webhookId = webhook.id;
  const theme = useTheme();
  const [isDeleting, setIsDeleting] = useState(false);
  const [isTogglingActive, setIsTogglingActive] = useState(false);
  const [isTogglingRetry, setIsTogglingRetry] = useState(false);
  const toggleMutation = useToggleWebhook();
  const deleteMutation = useDeleteWebhook();
  const showSnackbar = useSnackbar();

  const getServiceChips = () => {
    if (!webhook.serviceTrigger) return "No services";

    return Object.entries(webhook.serviceTrigger).map(([service, triggers]) => (
      <div
        key={service}
        style={{
          display: "flex",
          alignItems: "center",
          gap: 6,
          marginBottom: 4,
        }}
      >
        <span
          style={{
            fontSize: 12,
            color: theme.vars?.palette.text.secondary,
            textTransform: "lowercase",
          }}
        >
          {service}:
        </span>
        <div style={{ display: "flex", gap: 4 }}>
          {(triggers || []).map((trigger) => (
            <span
              key={trigger}
              style={{
                fontSize: 10,
                padding: "2px 8px",
                borderRadius: 12,
                background:
                  trigger === "success"
                    ? theme.vars?.palette.success?.light ||
                      "rgba(34, 197, 94, 0.2)"
                    : theme.vars?.palette.error?.light ||
                      "rgba(239, 68, 68, 0.2)",
                color: COLORS.WHITE,
                border: `1px solid ${trigger === "success" ? theme.vars?.palette.success?.main || "rgba(34, 197, 94, 0.4)" : theme.vars?.palette.error?.main || "rgba(239, 68, 68, 0.4)"}`,
                textTransform: "lowercase",
              }}
            >
              {trigger}
            </span>
          ))}
        </div>
      </div>
    ));
  };

  const formatDate = (dateString?: string) => {
    if (!dateString) return "Unknown";
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString("en-US", {
        year: "numeric",
        month: "short",
        day: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      });
    } catch (error) {
      return "Invalid date";
    }
  };

  const handleActiveToggle = async () => {
    try {
      setIsTogglingActive(true);
      await toggleMutation.mutateAsync({
        webhookId: webhookId,
        payload: { isActive: !webhook.isActive },
      });
      showSnackbar(
        !webhook.isActive
          ? "Webhook enabled successfully"
          : "Webhook disabled successfully",
        "success",
      );
    } catch (error: any) {
      showSnackbar(error?.message || "Failed to toggle webhook", "error");
    } finally {
      setIsTogglingActive(false);
    }
  };

  const handleToggleRetry = async () => {
    try {
      setIsTogglingRetry(true);
      await toggleMutation.mutateAsync({
        webhookId: webhookId,
        payload: {
          retryEnabled: !webhook.retryEnabled,
        },
      });
      showSnackbar(
        !webhook.retryEnabled
          ? "Retry mechanism enabled"
          : "Retry mechanism disabled",
        "success",
      );
    } catch (error: any) {
      showSnackbar(error?.message || "Failed to retry", "error");
    } finally {
      setIsTogglingRetry(false);
    }
  };

  const handleDelete = async () => {
    if (!isDeleting) {
      setIsDeleting(true);
      return;
    }

    try {
      setIsDeleting(true);
      await deleteMutation.mutateAsync(webhookId);
      showSnackbar("Webhook configuration deleted successfully.", "success");
    } catch (error: any) {
      showSnackbar(error?.message || "Failed to delete webhook", "error");
      setIsDeleting(false);
    }
  };

  return (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        padding: "12px 16px",
        borderRadius: 8,
        border: `1px solid ${theme.vars?.palette.divider}`,
        background: theme.vars?.palette.background.paper,
        marginBottom: 8,
      }}
    >
      <div style={{ flex: 1, minWidth: 0 }}>
        <div
          style={{
            fontSize: 14,
            fontWeight: 500,
            marginBottom: 4,
            color: theme.vars?.palette.text.secondary,
          }}
        >
          {webhook.webhookUrl}
        </div>
        <div
          style={{
            fontSize: 12,
            color: theme.vars?.palette.text.secondary,
            marginBottom: 2,
          }}
        >
          {getServiceChips()}
        </div>
        <div style={{ fontSize: 12, color: theme.vars?.palette.text.disabled }}>
          Updated: {formatDate(webhook.updatedAt)}
        </div>
      </div>

      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: 12,
          marginLeft: 16,
        }}
      >
        {/* Active Status Toggle */}
        <Switch
          checked={webhook.isActive || false}
          onChange={handleActiveToggle}
          disabled={isTogglingActive}
          label="Active"
          title="Toggle webhook active status"
        />

        {/* Retry Enabled Toggle */}
        <Switch
          checked={webhook.retryEnabled || false}
          onChange={handleToggleRetry}
          disabled={isTogglingRetry}
          label="Retry"
          title="Toggle retry mechanism"
        />

        {/* Edit button */}
        <button
          onClick={() => {
            setIsDeleting(false);
            onEdit(webhook);
          }}
          disabled={
            deleteMutation.isPending || isTogglingActive || isTogglingRetry
          }
          style={{
            padding: "6px 8px",
            background: "none",
            borderRadius: 4,
            color: theme.vars?.palette.text.secondary,
            cursor:
              deleteMutation.isPending || isTogglingActive || isTogglingRetry
                ? "not-allowed"
                : "pointer",
            display: "flex",
            alignItems: "center",
            opacity:
              deleteMutation.isPending || isTogglingActive || isTogglingRetry
                ? 0.5
                : 1,
            border: "1px solid rgba(255, 255, 255, 0.15)",
            boxShadow:
              "rgba(0, 0, 0, 0.6) 0px 4px 5px, rgba(255, 255, 255, 0.04) 0px 0px 0px 1px, rgba(0, 210, 255, 0.25) 0px 0px 20px",
          }}
        >
          <Edit2 size={16} />
        </button>

        {/* Delete button */}
        <button
          onClick={handleDelete}
          disabled={isTogglingActive || isTogglingRetry}
          style={{
            padding: "6px 8px",
            background: isDeleting
              ? theme.vars?.palette.error?.main || "#ef4444"
              : "none",
            borderRadius: 4,
            color: isDeleting ? "white" : theme.vars?.palette.text.secondary,
            cursor:
              isTogglingActive || isTogglingRetry ? "not-allowed" : "pointer",
            display: "flex",
            alignItems: "center",
            fontSize: 12,
            fontWeight: isDeleting ? 500 : 400,
            opacity: isTogglingActive || isTogglingRetry ? 0.5 : 1,
            border: "1px solid rgba(255, 255, 255, 0.15)",
            boxShadow:
              "rgba(0, 0, 0, 0.6) 0px 4px 5px, rgba(255, 255, 255, 0.04) 0px 0px 0px 1px, rgba(0, 210, 255, 0.25) 0px 0px 20px",
          }}
        >
          {isDeleting ? (
            <>
              <Trash2 size={16} style={{ marginRight: 4 }} />
              Confirm
            </>
          ) : (
            <Trash2 size={16} />
          )}
        </button>
      </div>
    </div>
  );
}
