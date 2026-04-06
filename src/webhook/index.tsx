import { useState, ChangeEvent, useEffect } from "react";
import { useTheme } from "@mui/material/styles";

import {
  useSaveWebhookDetails,
  useGetWebhookDetails,
  useUpdateWebhookDetails,
} from "src/hooks/useWebhook";
import {
  buildServiceTrigger,
  transformServiceTriggerToStatuses,
} from "src/utility/webhook";
import { useInputStyles } from "src/utility/styles";
import COLORS from "src/utility/colors";
import Input from "src/components/input";
import Button from "src/components/button";
import { Select } from "src/components/select";
import { useSnackbar } from "src/provider/snackbar";

import WebhookLogsDrawer from "./logs-drawer";

import WebhookListItem from "./listItem";

export default function WebhookConfigPage() {
  const [webhookUrl, setWebhookUrl] = useState("");
  const [apiKey, setApiKey] = useState("");

  const [selectedStatuses, setSelectedStatuses] = useState<string[]>([]);
  const [editingWebhookId, setEditingWebhookId] = useState<string | null>(null);
  const [showLogsDrawer, setShowLogsDrawer] = useState(false);
  const [selectedWebhookId, setSelectedWebhookId] = useState<string | null>(
    null,
  );

  const showSnackbar = useSnackbar();
  const theme = useTheme();
  const inputStyle = useInputStyles();

  const {
    data: webhooksList,
    isLoading: webhooksLoading,
    error: webhookError,
    isError,
  } = useGetWebhookDetails();

  const webhookData = webhooksList?.data?.configurations;

  const saveMutation = useSaveWebhookDetails();
  const updateMutation = useUpdateWebhookDetails();

  const applySavedConfig = (saved: any) => {
    if (!saved) return;

    if (saved.webhookUrl) setWebhookUrl(saved.webhookUrl);

    if (saved.apiKey) setApiKey(saved.apiKey);

    if (saved.serviceTrigger) {
      const statuses = Object.entries(saved.serviceTrigger).flatMap(
        ([service, triggers]: [string, any]) =>
          (triggers || []).map((trigger: string) => `${service}_${trigger}`),
      );

      setSelectedStatuses(statuses);
    }
  };

  const resetForm = () => {
    setWebhookUrl("");
    setApiKey("");
    setSelectedStatuses([]);
    setEditingWebhookId(null);
  };

  const handleEditWebhook = (webhook: any) => {
    setWebhookUrl(webhook.webhookUrl || "");
    setApiKey(webhook.apiKey || "");
    setEditingWebhookId(webhook.id);

    if (webhook.serviceTrigger) {
      const statuses = transformServiceTriggerToStatuses(
        webhook.serviceTrigger,
      );
      setSelectedStatuses(statuses);
    }

    // Scroll to form
    setTimeout(() => {
      document
        .querySelector("[data-webhook-form]")
        ?.scrollIntoView({ behavior: "smooth" });
    }, 100);
  };

  const handleViewLogs = (webhookId: string) => {
    setSelectedWebhookId(webhookId);
    setShowLogsDrawer(true);
  };

  const validateWebhookUrl = async (url: string): Promise<boolean> => {
    // Basic URL format validation
    try {
      new URL(url);
    } catch {
      showSnackbar(
        "Please enter a valid URL format (e.g., https://example.com)",
        "error",
      );
      return false;
    }

    // Check if URL uses http or https
    if (!url.startsWith("http://") && !url.startsWith("https://")) {
      showSnackbar("webhookUrl must be a valid HTTPS URL", "error");
      return false;
    }

    return true;
  };

  const handleSave = async () => {
    // clientId read from outer scope

    // Validate webhook URL before saving
    const isUrlValid = await validateWebhookUrl(webhookUrl);
    if (!isUrlValid) {
      return;
    }

    const serviceTrigger = buildServiceTrigger(selectedStatuses);

    const payload = {
      webhookUrl: webhookUrl,
      apiKey: apiKey,
      serviceTrigger: serviceTrigger,
    };

    try {
      const res = editingWebhookId
        ? await updateMutation.mutateAsync({
            payload,
            webhookId: editingWebhookId,
          } as any)
        : await saveMutation.mutateAsync(payload as any);

      const saved = res?.data ?? res;

      applySavedConfig(saved);

      showSnackbar(
        editingWebhookId
          ? "Webhook configuration updated successfully"
          : "webhook configuration added successfully.",
        "success",
      );

      // Reset form after successful save/update
      resetForm();
    } catch (err: any) {
      console.error(err);

      const message =
        err?.response?.data?.error || err?.message || "Something went wrong";

      showSnackbar(message, "error");
    }
  };

  const isDisabled =
    !webhookUrl?.trim() || !apiKey?.trim() || selectedStatuses.length === 0;

  const webhooksCount = Array.isArray(webhookData) ? webhookData.length : 0;

  const maxWebhooksReached = webhooksCount >= 10;

  const emailStatusOptions = [
    { label: "Twilio Queued", value: "sms_TWILIO:queued" },
    { label: "Twilio Read", value: "sms_TWILIO : read" },
    { label: "Email Failed", value: "email_failed" },
    { label: "Email Success", value: "email_success" },
    { label: "SMS Failed", value: "sms_failed" },
    { label: "SMS Success", value: "sms_success" },
    { label: "Slack Failed", value: "slack_failed" },
    { label: "Slack Success", value: "slack_success" },
  ];

  useEffect(() => {
    if (isError) {
      showSnackbar(
        webhookError?.message || "Failed to fetch webhook configurations",
        "error",
      );
      return;
    }
  }, [isError, webhookData, webhookError]);

  return (
    <div style={{ margin: "40px auto", marginTop: 0 }}>
      {/* Form Section */}
      <div
        data-webhook-form
        style={{
          minWidth: "100%",
          maxWidth: "100%",
          margin: "0 auto 40px",
          padding: 24,
          borderRadius: 8,
          background: theme.vars?.palette.background.paper,
          border: `1px solid ${theme.vars?.palette.divider}`,
          boxShadow:
            "rgba(0, 0, 0, 0.6) 0px 4px 18px, rgba(255, 255, 255, 0.04) 0px 0px 0px 1px, rgba(0, 210, 255, 0.25) 0px 0px 20px",
        }}
      >
        <h2
          style={{
            marginBottom: 20,
            color: theme.vars?.palette.text.secondary,
          }}
        >
          {editingWebhookId ? "Edit Webhook" : "Create Webhook"}
        </h2>

        <Input
          id="webhookUrl"
          label="Webhook URL (POST Call)"
          value={webhookUrl}
          onChange={(e: ChangeEvent<HTMLInputElement>) =>
            setWebhookUrl(e.target.value)
          }
          placeholder="Ex: https://webhook.site/your-test-url"
          showAsteric
          style={inputStyle}
        />

        <Input
          id="apiKey"
          label="API Key"
          value={apiKey}
          onChange={(e: ChangeEvent<HTMLInputElement>) =>
            setApiKey(e.target.value)
          }
          showAsteric
          style={inputStyle}
        />

        {/* Radio Buttons */}
        <div style={{ marginTop: 15 }}>
          <label
            style={{
              fontSize: 12,
              marginBottom: 6,
              display: "block",
              color: theme?.vars?.palette.text.secondary,
            }}
          >
            Enabled Services
          </label>

          <div style={{ display: "flex", gap: 20 }}>
            <Select
              value={selectedStatuses}
              onChange={(val) => setSelectedStatuses(val as string[])}
              options={emailStatusOptions}
              placeholder="Select Status"
              dataTestId="status-select"
              multiple
            />
          </div>
        </div>

        <div className="sms-footer" style={{ marginTop: 20 }}>
          <Button
            disabled={isDisabled || (maxWebhooksReached && !editingWebhookId)}
            label={editingWebhookId ? "Update" : "Create"}
            className={
              isDisabled || (maxWebhooksReached && !editingWebhookId)
                ? "button-disabled"
                : "sms-send-btn"
            }
            onClick={handleSave}
          />
          {editingWebhookId && (
            <Button
              label="Cancel"
              className="button-disabled"
              onClick={resetForm}
              style={{ marginLeft: 10 }}
            />
          )}
        </div>

        {maxWebhooksReached && !editingWebhookId && (
          <div
            style={{ marginTop: 12, fontSize: 12, color: COLORS.WARNING_COLOR }}
          >
            ⚠️ Maximum 10 webhooks reached. Edit or delete existing webhooks to
            add more.
          </div>
        )}
      </div>

      {/* Webhooks List Section */}
      {webhooksLoading ? (
        <div
          style={{
            textAlign: "center",
            fontSize: 14,
            color: theme.vars?.palette.text.disabled,
          }}
        >
          Loading webhooks...
        </div>
      ) : webhooksCount > 0 ? (
        <div
          style={{
            minWidth: "100%",
            maxWidth: "100%",
            margin: "0 auto",
            padding: 24,
            borderRadius: 8,
            background: theme.vars?.palette.background.paper,
            border: `1px solid ${theme.vars?.palette.divider}`,
            boxShadow:
              "rgba(0, 0, 0, 0.6) 0px 4px 18px, rgba(255, 255, 255, 0.04) 0px 0px 0px 1px, rgba(0, 210, 255, 0.25) 0px 0px 20px",
          }}
        >
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              marginBottom: 16,
            }}
          >
            <h3
              style={{
                margin: 0,
                color: theme.vars?.palette.text.secondary,
              }}
            >
              Webhooks ({webhooksCount}/10)
            </h3>
            <Button
              label="View All Logs"
              onClick={() => {
                if (webhookData && webhookData.length > 0) {
                  handleViewLogs(webhookData[0].id); // Open logs for first webhook as default
                }
              }}
              style={{
                padding: "8px 16px",
                fontSize: "14px",
                background: COLORS.ACTIVE_BLUE,
                color: COLORS.WHITE,
                border: "none",
                borderRadius: "6px",
                cursor: "pointer",
                fontWeight: 500,
                boxShadow:
                  "rgba(0, 0, 0, 0.6) 0px 4px 5px, rgba(255, 255, 255, 0.04) 0px 0px 0px 1px, rgba(0, 210, 255, 0.25) 0px 0px 20px",
              }}
            />
          </div>
          {(Array.isArray(webhookData) ? webhookData : [])
            .sort((a: any, b: any) => {
              // Convert UTC to IST (UTC+5:30) for sorting
              const getISTTime = (dateStr: string) => {
                if (!dateStr) return 0;
                const date = new Date(dateStr);
                // Add 5 hours 30 minutes for IST conversion
                return date.getTime() + 5.5 * 60 * 60 * 1000;
              };
              const timeA = getISTTime(a.createdAt);
              const timeB = getISTTime(b.createdAt);
              return timeB - timeA; // Descending order (most recent first)
            })
            .map((webhook: any) => (
              <WebhookListItem
                key={webhook.id}
                webhook={webhook}
                onEdit={handleEditWebhook}
                onViewLogs={handleViewLogs}
              />
            ))}
        </div>
      ) : (
        <div
          style={{
            maxWidth: 700,
            margin: "0 auto",
            padding: 24,
            textAlign: "center",
            fontSize: 14,
            color: theme.vars?.palette.text.disabled,
            background: theme.vars?.palette.background.paper,
            border: `1px solid ${theme.vars?.palette.divider}`,
            borderRadius: 8,
          }}
        >
          No webhooks configured yet. Create one to get started!
        </div>
      )}

      {/* Common Webhook Logs Drawer */}
      <WebhookLogsDrawer
        open={showLogsDrawer}
        onClose={() => setShowLogsDrawer(false)}
        webhookId={selectedWebhookId || ""}
      />
    </div>
  );
}
