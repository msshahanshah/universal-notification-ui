import { useState, ChangeEvent } from "react";
import axios from "axios";

import Input from "./components/input";

import "./layouts/dashboard/services/slack/slack.css";
import Button from "./components/button";

type StatusType = "success" | "failure" | "both";

export default function WebhookConfigPage() {
  const [username, setUsername] = useState("client1");
  const [webhookUrl, setWebhookUrl] = useState("");
  const [authKey, setAuthKey] = useState("");
  const [statusType, setStatusType] = useState<StatusType>("success");

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSave = async () => {
    setError("");

    const payload = {
      username,
      webhook_url: webhookUrl,
      is_success: statusType === "success" || statusType === "both",
      is_failed: statusType === "failure" || statusType === "both",
      authKey,
    };

    try {
      setLoading(true);

      const response = await axios.post(
        "http://localhost:3000/api/webhook/config",
        payload,
        {
          headers: {
            Authorization: authKey, // bearer token
          },
        },
      );

      console.log("Saved successfully", response.data);
      alert("Webhook configuration saved successfully");
    } catch (err: any) {
      const message = err?.response?.data?.message || "Something went wrong";
      setError(message);
    } finally {
      setLoading(false);
    }
  };

  const isDisabled = !webhookUrl || !authKey;

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
        label="Webhook URL"
        value={webhookUrl}
        onChange={(e: ChangeEvent<HTMLInputElement>) =>
          setWebhookUrl(e.target.value)
        }
        placeholder="https://webhook.site/your-test-url"
        showAsteric
        className="sms-input"
      />

      <Input
        id="authKey"
        label="Auth Key"
        // type="password"
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
          {["success", "failure", "both"].map((type) => (
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
          ))}
        </div>
      </div>

      {error && (
        <div style={{ color: "red", marginTop: 10, fontSize: 12 }}>{error}</div>
      )}

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
