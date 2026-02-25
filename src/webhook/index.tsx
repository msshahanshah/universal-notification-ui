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
// import Button from "./components/button";

type StatusType = "success" | "failure" | "both";

export default function WebhookConfigPage() {
  const [username, setUsername] = useState("");
  const [webhookUrl, setWebhookUrl] = useState("");
  const [authKey, setAuthKey] = useState("");
  const [apiKey, setApiKey] = useState("");
  const [statusType, setStatusType] = useState<StatusType>("success");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [status, setStatus] = useState<string[]>([]);
  const [isExistingConfig, setIsExistingConfig] = useState(false);

  const showSnackbar = useSnackbar();
  const clientId =
    typeof window !== "undefined" ? localStorage.getItem("clientId") : null;

  const { data: queryData, isLoading: queryLoading } =
    useGetWebhookDetails(clientId);
  const saveMutation = useSaveWebhookDetails();
  const updateMutation = useUpdateWebhookDetails();

  const handleSave = async () => {
    // clientId read from outer scope
    setError("");

    if (!clientId) {
      showSnackbar("Client ID is missing. Please login again.", "error");
      return;
    }

    const payload = {
      client_id: clientId,
      webhook_url: webhookUrl,
      service_trigger: status,
      auth_key: authKey,
      api_key: apiKey,
    };

    try {
      setLoading(true);

      if (isExistingConfig) {
        console.log(" c id", clientId);
        const res = await updateMutation.mutateAsync(payload);
        const saved = res?.data ?? res;
        if (saved) {
          if (saved.webhook_url) setWebhookUrl(saved.webhook_url);
          if (saved.encrypted_key) setApiKey(saved.encrypted_key);
          if (saved.auth_key) setAuthKey(saved.auth_key);
          if (Array.isArray(saved.service_trigger))
            setStatus(saved.service_trigger);
        }
        showSnackbar("Webhook configuration updated successfully", "success");
      } else {
        const res = await saveMutation.mutateAsync(payload as any);
        const saved = res?.data ?? res;
        if (saved) {
          if (saved.webhook_url) setWebhookUrl(saved.webhook_url);
          if (saved.encrypted_key) setApiKey(saved.encrypted_key);
          if (saved.auth_key) setAuthKey(saved.auth_key);
          if (Array.isArray(saved.service_trigger))
            setStatus(saved.service_trigger);
          setIsExistingConfig(true);
        }
        showSnackbar("Webhook configuration saved successfully", "success");
      }
    } catch (err: any) {
      const message = err?.response?.data?.message || "Something went wrong";
      showSnackbar(message, "error");
    } finally {
      setLoading(false);
    }
  };

  const isDisabled = !webhookUrl || !authKey || !apiKey || status?.length === 0;

  const emailStatusOptions = [
    { label: "Email Failed", value: "email_failed" },
    { label: "Email Success", value: "email_success" },
    { label: "SMS Failed", value: "sms_failed" },
    { label: "SMS Success", value: "sms_success" },
    { label: "Slack Failed", value: "slack_failed" },
    { label: "Slack Success", value: "slack_success" },
  ];

  useEffect(() => {
    // populate fields from react-query fetched data when it arrives
    if (!queryData) return;

    const payload = queryData?.data ? queryData.data : queryData;
    console.log("payload", payload);

    if (payload) {
      if (payload.webhook_url) setWebhookUrl(payload.webhook_url);
      if (payload.encrypted_key) setApiKey(payload.encrypted_key);
      if (payload.auth_key) setAuthKey(payload.auth_key);
      if (Array.isArray(payload.service_trigger))
        setStatus(payload.service_trigger);
      if (payload?.success && payload?.data) {
        setIsExistingConfig(true);
      }
    }
  }, [queryData]);

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

      <Input
        id="authKey"
        label="Auth Key"
        value={authKey}
        onChange={(e: ChangeEvent<HTMLInputElement>) =>
          setAuthKey(e.target.value)
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
            value={status}
            onChange={setStatus}
            options={emailStatusOptions}
            placeholder="Select Status"
            dataTestId="status-select"
            multiple
          />
          {/* <MultipleSelectChip data={status||[]} onChange={setStatus} options={emailStatusOptions}/> */}
        </div>
      </div>

      {/* {error && (
        <div style={{ color: "red", marginTop: 10, fontSize: 12 }}>{error}</div>
      )} */}

      {/* <button
        onClick={handleSave}
        disabled={loading}
        style={{
          marginTop: 20,
          padding: "10px 16px",
          cursor: loading ? "not-allowed" : "pointer",
        }}
      >
        {loading ? "Saving..." : "Save"}
      </button> */}

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
