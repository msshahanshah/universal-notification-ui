import { useState, ChangeEvent, useEffect } from "react";
// import axios from "axios";

// import Input from "./components/input";

import "../layouts/dashboard/services/slack/slack.css";
import Input from "src/components/input";
import Button from "src/components/button";
import { Select } from "src/components/select";
import { useSnackbar } from "src/provider/snackbar";
import MultipleSelectChip from "src/components/mui/select";
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
// import Button from "./components/button";

type StatusType = "success" | "failure" | "both";

export default function WebhookConfigPage() {
  const [username, setUsername] = useState("");
  const [webhookUrl, setWebhookUrl] = useState("");
  const [apiKey, setApiKey] = useState("");
  const [statusType, setStatusType] = useState<StatusType>("success");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [status, setStatus] = useState<string[]>([]);
  const [initialStatuses, setInitialStatuses] = useState<string[]>([]);
  const [selectedStatuses, setSelectedStatuses] = useState<string[]>([]);
  const [isExistingConfig, setIsExistingConfig] = useState(false);
  const selectedData = { enabled: [], disabled: [] };

  console.log("isExistingConfig",isExistingConfig)

  const showSnackbar = useSnackbar();
  const clientId =
    typeof window !== "undefined" ? localStorage.getItem("clientId") : null;

  const {
    data: getWebhookConfigurations,
    isLoading: queryLoading,
    error: webhookError,
    isError,
  } = useGetWebhookDetails(clientId);

  useEffect(() => {
    if (isError) {
      showSnackbar(
        webhookError?.message || "Failed to fetch webhook configurations",
        "error",
      );
      return;
    }
  }, [isError, getWebhookConfigurations?.data, webhookError]);

  console.log("getWebhookConfigurations", getWebhookConfigurations);
  const saveMutation = useSaveWebhookDetails();
  const updateMutation = useUpdateWebhookDetails();

  const extractServiceTrigger = (status) => {
    const newStatus = status.map((data) => {
      return { [data.split("_")?.[0]]: !!data.split("_")?.[0] };
    });

    return newStatus;
  };

  const extractServiceName = (status) => {
    return status.split("_")?.[0];
  };

  const applySavedConfig = (saved: any) => {
    if (!saved) return;

    if (saved.webhook_url) setWebhookUrl(saved.webhook_url);

    if (saved.api_key) setApiKey(saved.api_key);

    if (saved.service_trigger) {
      const statuses = Object.entries(saved.service_trigger).flatMap(
        ([service, triggers]) =>
          (triggers || []).map((trigger) => `${service}_${trigger}`),
      );

      setStatus(statuses);
      setSelectedStatuses(statuses);
      setInitialStatuses(statuses);
    }
  };

  const handleSave = async () => {
    // clientId read from outer scope
    setError("");

    if (!clientId) {
      showSnackbar("Client ID is missing. Please login again.", "error");
      return;
    }

    // const { settings, service_trigger } = buildWebhookConfig(selectedStatuses);
    // const newStatus = extractServiceTrigger(status);

    const serviceTrigger = buildServiceTrigger(selectedStatuses);

    const existingSettings = getWebhookConfigurations?.data?.settings || {};

    const settings = buildSettings(existingSettings, serviceTrigger);

    const payload = {
      client_id: clientId,
      webhook_url: webhookUrl,
      api_key: apiKey,
      service_trigger: serviceTrigger,
      settings: settings,
    };

    try {
      setLoading(true);

      const res = isExistingConfig
        ? await updateMutation.mutateAsync(payload)
        : await saveMutation.mutateAsync(payload as any);

      const saved = res?.data ?? res;

      applySavedConfig(saved);

      if (!isExistingConfig) {
        setIsExistingConfig(true);
      }

      showSnackbar(
        isExistingConfig
          ? "Webhook configuration updated successfully"
          : "Webhook configuration saved successfully",
        "success",
      );
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
    //       if (saved.webhook_url) setWebhookUrl(saved.webhook_url);
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
    //       if (saved.webhook_url) setWebhookUrl(saved.webhook_url);
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

  const isDisabled =
    !webhookUrl?.trim() || !apiKey?.trim() || selectedStatuses?.length === 0;

  const emailStatusOptions = [
    { label: "Email Failed", value: "email_failed" },
    { label: "Email Success", value: "email_success" },
    { label: "SMS Failed", value: "sms_failed" },
    { label: "SMS Success", value: "sms_success" },
    { label: "Slack Failed", value: "slack_failed" },
    { label: "Slack Success", value: "slack_success" },
  ];

  useEffect(() => {
    if (!getWebhookConfigurations) return;

    const payload = getWebhookConfigurations?.data ?? getWebhookConfigurations;

    if (!payload) return;

    if (payload.webhook_url) {
      setWebhookUrl(payload.webhook_url);
    }

    if (payload.api_key) {
      setApiKey(payload.api_key);
    }

    if (payload.service_trigger) {
      const statuses = transformServiceTriggerToStatuses(
        payload.service_trigger,
      );

      setStatus(statuses);
      setInitialStatuses(statuses);
      setSelectedStatuses(statuses);
    }

    console.log("payload?.success && payload?.data",getWebhookConfigurations)

    if (getWebhookConfigurations?.success && payload?.id) {
      setIsExistingConfig(true);
    }
  }, [getWebhookConfigurations]);

  console.log("status", status);

  return (
    <div
      style={{
        maxWidth: 600,
        margin: "40px auto",
        padding: 20,
        borderRadius: 8,
        border: "1px solid #ddd",
      }}
    >
      <h2 style={{ marginBottom: 20 }}>Webhook Configuration</h2>

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
          {/* {["success", "failure", "both"].map((type) => (
            <label key={type} style={{ display: "flex", gap: 6 }}>
              <input
                type="radio"
                checked={statusType === type}
                onChange={() => setStatusType(type as StatusType)}
              />
              <span style={{ fontSize: 12, textTransform: "capitalize" }}>
                {type}
              </span>
            </label>
          ))} */}
          <Select
            // value={status}
            // onChange={setStatus}
            // initialValue={selectedData}
            value={selectedStatuses}
            onChange={(val) => setSelectedStatuses(val as string[])}
            options={emailStatusOptions}
            placeholder="Select Status"
            dataTestId="status-select"
            multiple
            // callback={(data) => {
            //   selectedData.enabled = data?.enabled || [];
            //   selectedData.disabled = data?.disabled || [];
            // }}
          />
          {/* <MultipleSelectChip data={status||[]} onChange={setStatus} options={emailStatusOptions}/> */}
        </div>
      </div>

      <div className="sms-footer">
        <Button
          disabled={isDisabled}
          label="Send"
          className={isDisabled ? "button-disabled" : "sms-send-btn"}
          onClick={handleSave}
        />
      </div>
    </div>
  );
}
