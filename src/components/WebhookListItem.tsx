import { Edit2, Trash2 } from "lucide-react";
import { useState } from "react";
import { useToggleWebhook, useDeleteWebhook } from "src/hooks/useWebhook";
import { useSnackbar } from "src/provider/snackbar";
import { transformServiceTriggerToStatuses } from "src/utility/webhook";

interface WebhookListItemProps {
  webhook: {
    id: string;
    webhookUrl?: string;
    serviceTrigger?: Record<string, string[]>;
    apiKey?: string;
    enabled?: boolean;
  };
  onEdit: (webhook: any) => void;
}

export default function WebhookListItem({ webhook, onEdit }: WebhookListItemProps) {
  const [isDeleting, setIsDeleting] = useState(false);
  const [isTogglingLoading, setIsTogglingLoading] = useState(false);
  const toggleMutation = useToggleWebhook();
  const deleteMutation = useDeleteWebhook();
  const showSnackbar = useSnackbar();

  const getServiceNames = () => {
    if (!webhook.serviceTrigger) return "No services";
    const statuses = transformServiceTriggerToStatuses(webhook.serviceTrigger);
    const services = [...new Set(statuses.map((s) => s.split("_")[0]))];
    return services.join(", ");
  };

  const handleToggle = async () => {
    try {
      setIsTogglingLoading(true);
      await toggleMutation.mutateAsync({
        webhookId: webhook.id,
        enabled: !webhook.enabled,
      });
      showSnackbar(
        webhook.enabled
          ? "Webhook disabled successfully"
          : "Webhook enabled successfully",
        "success",
      );
    } catch (error: any) {
      showSnackbar(
        error?.message || "Failed to toggle webhook",
        "error",
      );
    } finally {
      setIsTogglingLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!isDeleting) {
      setIsDeleting(true);
      return;
    }

    try {
      setIsDeleting(true);
      await deleteMutation.mutateAsync(webhook.id);
      showSnackbar("Webhook deleted successfully", "success");
    } catch (error: any) {
      showSnackbar(
        error?.message || "Failed to delete webhook",
        "error",
      );
      setIsDeleting(false);
    }
  };

  console.log("webhook",webhook)

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
        <div style={{ fontSize: 14, fontWeight: 500, marginBottom: 4 }}>
          {webhook.webhookUrl}
        </div>
        <div style={{ fontSize: 12, color: "rgba(255, 255, 255, 0.6)" }}>
          Services: {getServiceNames()}
        </div>
      </div>

      <div style={{ display: "flex", alignItems: "center", gap: 12, marginLeft: 16 }}>
        {/* Toggle button */}
        <button
          onClick={handleToggle}
          disabled={isTogglingLoading || deleteMutation.isPending}
          style={{
            padding: "6px 12px",
            borderRadius: 4,
            border: "none",
            background: webhook.enabled ? "#10b981" : "#6b7280",
            color: "white",
            fontSize: 12,
            fontWeight: 500,
            cursor: isTogglingLoading ? "not-allowed" : "pointer",
            opacity: isTogglingLoading ? 0.6 : 1,
          }}
        >
          {isTogglingLoading ? "..." : webhook.enabled ? "Enabled" : "Disabled"}
        </button>

        {/* Edit button */}
        <button
          onClick={() => onEdit(webhook)}
          disabled={deleteMutation.isPending}
          style={{
            padding: "6px 8px",
            background: "none",
            border: "1px solid rgba(255, 255, 255, 0.2)",
            borderRadius: 4,
            color: "rgba(255, 255, 255, 0.7)",
            cursor: deleteMutation.isPending ? "not-allowed" : "pointer",
            display: "flex",
            alignItems: "center",
            opacity: deleteMutation.isPending ? 0.5 : 1,
          }}
        >
          <Edit2 size={16} />
        </button>

        {/* Delete button */}
        <button
          onClick={handleDelete}
          style={{
            padding: "6px 8px",
            background: isDeleting ? "#ef4444" : "none",
            border: isDeleting ? "1px solid #ef4444" : "1px solid rgba(255, 255, 255, 0.2)",
            borderRadius: 4,
            color: isDeleting ? "white" : "rgba(255, 255, 255, 0.7)",
            cursor: "pointer",
            display: "flex",
            alignItems: "center",
            fontSize: 12,
            fontWeight: isDeleting ? 500 : 400,
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
