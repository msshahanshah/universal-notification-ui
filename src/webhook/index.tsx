import { useState, ChangeEvent, useEffect } from "react";
// import axios from "axios";

// import Input from "./components/input";

import "../layouts/dashboard/services/slack/slack.css";
import Input from "src/components/input";
import Button from "src/components/button";
import { Select } from "src/components/select";
import { useSnackbar } from "src/provider/snackbar";
import MultipleSelectChip from "src/components/mui/select";
// import WebhookListItem from "src/components/WebhookListItem";
import {
  useSaveWebhookDetails,
  useGetWebhookDetails,
  useUpdateWebhookDetails,
} from "src/hooks/useWebhook";
import {
  buildServiceTrigger,
  buildSettings,
  buildWebhookConfig,
  transformServiceTriggerToStatuses,
} from "src/utility/webhook";
import WebhookListItem from "./listItem";
// import Button from "./components/button";

type StatusType = "success" | "failure" | "both";

export default function WebhookConfigPage() {
  const [username, setUsername] = useState("");
  const [webhookUrl, setWebhookUrl] = useState("");
  const [apiKey, setApiKey] = useState("");
  const [statusType, setStatusType] = useState<StatusType>("success");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [selectedStatuses, setSelectedStatuses] = useState<string[]>([]);
  const [isExistingConfig, setIsExistingConfig] = useState(false);
  const [editingWebhookId, setEditingWebhookId] = useState<string | null>(null);
  const selectedData = { enabled: [], disabled: [] };

  const showSnackbar = useSnackbar();
  const clientId =
    typeof window !== "undefined" ? localStorage.getItem("clientId") : null;

  const {
    data: webhooksList,
    isLoading: webhooksLoading,
    error: webhookError,
    isError,
  } = useGetWebhookDetails(clientId);

  const saveMutation = useSaveWebhookDetails();
  const updateMutation = useUpdateWebhookDetails();

  const extractServiceTrigger = (status: string[]) => {
    const newStatus = status.map((data: string) => {
      return { [data.split("_")?.[0]]: !!data.split("_")?.[0] };
    });

    return newStatus;
  };

  const extractServiceName = (status: string) => {
    return status.split("_")?.[0];
  };

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
    setIsExistingConfig(false);
    setEditingWebhookId(null);
  };

  const handleEditWebhook = (webhook: any) => {
    setWebhookUrl(webhook.webhookUrl || "");
    setApiKey(webhook.apiKey || "");
    setEditingWebhookId(webhook.id);
    setIsExistingConfig(true);

    if (webhook.service_trigger) {
      const statuses = transformServiceTriggerToStatuses(webhook.service_trigger);
      setSelectedStatuses(statuses);
    }

    // Scroll to form
    setTimeout(() => {
      document.querySelector("[data-webhook-form]")?.scrollIntoView({ behavior: "smooth" });
    }, 100);
  };

  const handleSave = async () => {
    // clientId read from outer scope
    setError("");

    if (!clientId) {
      showSnackbar("Client ID is missing. Please login again.", "error");
      return;
    }

    const serviceTrigger = buildServiceTrigger(selectedStatuses);

    // const existingSettings = webhooksList?.data?.settings || {};

    // const settings = buildSettings(existingSettings, serviceTrigger);

    const payload = {
      clientId: clientId,
      webhookUrl: webhookUrl,
      apiKey: apiKey,
      serviceTrigger: serviceTrigger,
      // settings: settings,
    };

    try {
      setLoading(true);

      const res = editingWebhookId
        ? await updateMutation.mutateAsync({ ...payload, webhookId: editingWebhookId } as any)
        : await saveMutation.mutateAsync(payload as any);

      const saved = res?.data ?? res;

      applySavedConfig(saved);

      showSnackbar(
        editingWebhookId
          ? "Webhook configuration updated successfully"
          : "Webhook configuration saved successfully",
        "success",
      );

      // Reset form after successful save/update
      resetForm();
    } catch (err: any) {
      console.error(err);

      const message =
        err?.response?.data?.error || err?.message || "Something went wrong";

      showSnackbar(message, "error");
    } finally {
      setLoading(false);
    }

    // try {
    //   setLoading(true);

    //   if (isExistingConfig) {
    //     console.log(" c id", clientId);
    //     const res = await updateMutation.mutateAsync(payload);
    //     const saved = res?.data ?? res;
    //     if (saved) {
    //       if (saved.webhookurl) setWebhookUrl(saved.webhookurl);
    //       if (saved.encrypted_key) setApiKey(saved.encrypted_key);
    //       if (saved.service_trigger) {
    //         const convertToArrayOfStrings = Object.entries(
    //           saved.service_trigger,
    //         ).flatMap(([key, values]) =>
    //           values.map((value) => `${key}_${value}`),
    //         );

    //         setStatus(convertToArrayOfStrings);
    //       }
    //     }
    //     showSnackbar("Webhook configuration updated successfully", "success");
    //   } else {
    //     const res = await saveMutation.mutateAsync(payload as any);
    //     const saved = res?.data ?? res;
    //     if (saved) {
    //       if (saved.webhookurl) setWebhookUrl(saved.webhookurl);
    //       if (saved.encrypted_key) setApiKey(saved.encrypted_key);
    //       if (saved.service_trigger) {
    //         const convertToArrayOfStrings = Object.entries(
    //           saved.service_trigger,
    //         ).flatMap(([key, values]) =>
    //           values.map((value) => `${key}_${value}`),
    //         );

    //         setStatus(convertToArrayOfStrings);
    //       }

    //       setIsExistingConfig(true);
    //     }
    //     showSnackbar("Webhook configuration saved successfully", "success");
    //   }
    // } catch (err: any) {
    //   console.log(" err?.response?.data", err);
    //   // const message = error?.message || "Something went wrong";
    //   // showSnackbar(message, "error");
    // } finally {
    //   setLoading(false);
    // }
  };

  const isDisabled = !webhookUrl?.trim() || !apiKey?.trim() || selectedStatuses.length === 0;

  console.log("webhooksList",webhooksList)
  const webhooksCount = Array.isArray(webhooksList?.data) 
    ? webhooksList.data.length 
    : 0;

  // const webhooksCount = webhooksList?.data&&1 
  const maxWebhooksReached = webhooksCount >= 10;

  const emailStatusOptions = [
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
  }, [isError, webhooksList?.data, webhookError]);

  console.log("webhooksList",webhooksList)
  return (
    <div style={{ maxWidth: 800, margin: "40px auto", padding: 20 }}>
      {/* Form Section */}
      <div
        data-webhook-form
        style={{
          maxWidth: 600,
          margin: "0 auto 40px",
          padding: 20,
          borderRadius: 8,
          background: "hsla(220, 35%, 3%, 0.4)",
          border: "1px solid rgba(255, 255, 255, 0.15)",
          boxShadow:
            "rgba(0, 0, 0, 0.6) 0px 4px 18px, rgba(255, 255, 255, 0.04) 0px 0px 0px 1px, rgba(0, 210, 255, 0.25) 0px 0px 20px",
        }}
      >
        <h2 style={{ marginBottom: 20 }}>
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
          className="sms-input"
        />

        <Input
          id="apiKey"
          label="API Key"
          value={apiKey}
          onChange={(e: ChangeEvent<HTMLInputElement>) =>
            setApiKey(e.target.value)
          }
          showAsteric
          className="sms-input"
        />

        {/* Radio Buttons */}
        <div style={{ marginTop: 15 }}>
          <label style={{ fontSize: 12, marginBottom: 6, display: "block" }}>
            Trigger Type
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
          <div style={{ marginTop: 12, fontSize: 12, color: "#fbbf24" }}>
            ⚠️ Maximum 10 webhooks reached. Edit or delete existing webhooks to add more.
          </div>
        )}
      </div>

      {/* Webhooks List Section */}
      {webhooksLoading ? (
        <div style={{ textAlign: "center", fontSize: 14, color: "rgba(255, 255, 255, 0.6)" }}>
          Loading webhooks...
        </div>
      ) : webhooksCount > 0 ? (
        <div
          style={{
            maxWidth: 600,
            margin: "0 auto",
            padding: 20,
            borderRadius: 8,
            background: "hsla(220, 35%, 3%, 0.2)",
            border: "1px solid rgba(255, 255, 255, 0.15)",
          }}
        >
          <h3 style={{ marginBottom: 16, marginTop: 0 }}>
            Webhooks ({webhooksCount}/10)
          </h3>
          {(Array.isArray(webhooksList?.data) ? webhooksList.data : []).map((webhook: any) => (
              <WebhookListItem
                key={webhook.id}
                webhook={webhook}
                onEdit={handleEditWebhook}
              />
            ))}
        </div>
      ) : (
        <div
          style={{
            maxWidth: 600,
            margin: "0 auto",
            padding: 20,
            textAlign: "center",
            fontSize: 14,
            color: "rgba(255, 255, 255, 0.6)",
          }}
        >
          No webhooks configured yet. Create one to get started!
        </div>
      )}
    </div>
  );
}

