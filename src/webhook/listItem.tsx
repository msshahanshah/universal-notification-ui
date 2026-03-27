import { Edit2, Trash2 } from "lucide-react";
import { useState } from "react";
import { useToggleWebhook, useDeleteWebhook } from "src/hooks/useWebhook";
import { useSnackbar } from "src/provider/snackbar";
import { transformServiceTriggerToStatuses } from "src/utility/webhook";
import Switch from "src/components/switch";
import { useTheme } from "@mui/material/styles";

interface WebhookListItemProps {
  webhook: {
    _id: string;
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
  const webhookId = webhook._id;
  console.log("rendered webhook", webhook);
  const theme = useTheme();
  const [isDeleting, setIsDeleting] = useState(false);
  const [isTogglingActive, setIsTogglingActive] = useState(false);
  const [isTogglingRetry, setIsTogglingRetry] = useState(false);
  const toggleMutation = useToggleWebhook();
  const deleteMutation = useDeleteWebhook();
  const showSnackbar = useSnackbar();

  const getServiceNames = () => {
    if (!webhook.serviceTrigger) return "No services";
    const statuses = transformServiceTriggerToStatuses(webhook.serviceTrigger);
    const services = [...new Set(statuses.map((s) => s.split("_")[0]))];
    return services.join(", ");
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
      console.log("webhook....", webhook);
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
      showSnackbar(error?.message || "Failed to toggle retry", "error");
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
      showSnackbar("Webhook deleted successfully", "success");
    } catch (error: any) {
      showSnackbar(error?.message || "Failed to delete webhook", "error");
      setIsDeleting(false);
    }
  };

  console.log("webhook", webhook);

  return (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        padding: "12px 16px",
        borderRadius: 8,
        border: "1px solid rgba(255, 255, 255, 0.15)",
        background: "hsla(220, 35%, 3%, 0.2)",
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
            color: "rgba(255, 255, 255, 0.6)",
            marginBottom: 2,
          }}
        >
          Services: {getServiceNames()}
        </div>
        <div style={{ fontSize: 12, color: "rgba(255, 255, 255, 0.4)" }}>
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
          disabled={
            isTogglingActive || isTogglingRetry || deleteMutation.isPending
          }
          label="Active"
          title="Toggle webhook active status"
        />

        {/* Retry Enabled Toggle */}
        <Switch
          checked={webhook.retryEnabled || false}
          onChange={handleToggleRetry}
          disabled={
            isTogglingRetry || isTogglingActive || deleteMutation.isPending
          }
          label="Retry"
          title="Toggle retry mechanism"
        />

        {/* Edit button */}
        <button
          onClick={() => onEdit(webhook)}
          disabled={
            deleteMutation.isPending || isTogglingActive || isTogglingRetry
          }
          style={{
            padding: "6px 8px",
            background: "none",
            border: "1px solid rgba(255, 255, 255, 0.2)",
            borderRadius: 4,
            color: "rgba(255, 255, 255, 0.7)",
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
            background: isDeleting ? "#ef4444" : "none",
            border: isDeleting
              ? "1px solid #ef4444"
              : "1px solid rgba(255, 255, 255, 0.2)",
            borderRadius: 4,
            color: isDeleting ? "white" : "rgba(255, 255, 255, 0.7)",
            cursor:
              isTogglingActive || isTogglingRetry ? "not-allowed" : "pointer",
            display: "flex",
            alignItems: "center",
            fontSize: 12,
            fontWeight: isDeleting ? 500 : 400,
            opacity: isTogglingActive || isTogglingRetry ? 0.5 : 1,
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
