import { useState } from "react";
import { Typography, useTheme } from "@mui/material";
import { useQueryClient } from "@tanstack/react-query";

import { useSmsService } from "src/hooks/useService";
import Button from "src/components/button";
import Input from "src/components/input";
import { useSnackbar } from "src/provider/snackbar";
import { logsKeys } from "src/api/queryKeys";
import { CountryCodeSelect } from "./country-code-select";

import "./sms-composer.css";

interface Recipient {
  id: string;
  countryCode: string;
  number: string;
}

export default function SMS() {
  const theme = useTheme();
  const queryClient = useQueryClient();
  const showSnackbar = useSnackbar();
  const { mutate } = useSmsService();

  const [recipients, setRecipients] = useState<Recipient[]>([
    { id: crypto.randomUUID(), countryCode: "+91", number: "" },
  ]);

  const [message, setMessage] = useState("");

  /* -------------------- Handlers -------------------- */

  const updateNumber = (id: string, value: string) => {
    const clean = value.replace(/\D/g, "");

    setRecipients((prev) =>
      prev.map((r) => (r.id === id ? { ...r, number: clean } : r)),
    );
  };

  const updateCountryCode = (id: string, code: string) => {
    setRecipients((prev) =>
      prev.map((r) => (r.id === id ? { ...r, countryCode: code } : r)),
    );
  };

  const addRecipient = () => {
    setRecipients((prev) => [
      ...prev,
      { id: crypto.randomUUID(), countryCode: "+91", number: "" },
    ]);
  };

  const removeRecipient = (id: string) => {
    setRecipients((prev) => prev.filter((r) => r.id !== id));
  };

  /* -------------------- Validation -------------------- */

  const isValidRecipients =
    recipients.length > 0 &&
    recipients.every(
      (r) => r.countryCode && r.number && /^\d{8,15}$/.test(r.number),
    );

  const isDisabled = !message.trim() || !isValidRecipients;

  /* -------------------- Submit -------------------- */

  const handleSend = () => {
    const destination = recipients
      .map((r) => `${r.countryCode}${r.number}`)
      .join(",");

    mutate(
      {
        service: "sms",
        destination,
        message,
      },
      {
        onSuccess: (data) => {
          queryClient.invalidateQueries({
            queryKey: logsKeys.all,
          });

          setMessage("");
          setRecipients([
            { id: crypto.randomUUID(), countryCode: "+91", number: "" },
          ]);

          showSnackbar(data?.message || "Message sent successfully", "info");
        },
        onError: (error: any) => {
          showSnackbar(error?.message || "Failed to send message", "error");
        },
      },
    );
  };

  return (
    <div className="sms-container">
      <Typography variant="h6" sx={{ mt: 0, mb: 4, color: "text.secondary" }}>
        New message
      </Typography>

      <div
        className="sms-wrapper"
        style={{ backgroundColor: theme.vars?.palette.background.paper }}
      >
        <label
          style={{
            fontSize: "12px",
            color: theme.vars?.palette.text.secondary,
          }}
        >
          Phone number
          <span style={{ color: "red", marginLeft: 2 }}>*</span>
        </label>

        <div>
          {recipients.map((recipient) => (
            <div key={recipient.id} className="sms-to-row">
              <CountryCodeSelect
                value={recipient.countryCode}
                onChange={(code) => updateCountryCode(recipient.id, code)}
              />

              <Input
                type="tel"
                id={`recipient-${recipient.id}`}
                placeholder="Enter receiver number"
                value={recipient.number}
                inputMode="numeric"
                className="sms-input"
                onChange={(e) => updateNumber(recipient.id, e.target.value)}
                style={{ color: "#fff" }}
              />

              {recipients.length > 1 && (
                <button
                  type="button"
                  onClick={() => removeRecipient(recipient.id)}
                  style={{
                    marginLeft: 8,
                    cursor: "pointer",
                    background: "transparent",
                    border: "none",
                    color: "red",
                    fontSize: 18,
                  }}
                >
                  ×
                </button>
              )}
            </div>
          ))}

          <Button
            label="Add Another Number"
            onClick={addRecipient}
            className="sms-add-btn"
          />
        </div>

        {/* Message */}
        <label
          style={{
            marginTop: 16,
            marginBottom: 4,
            fontSize: "12px",
            color: theme.vars?.palette.text.secondary,
          }}
        >
          Message
          <span style={{ color: "red", marginLeft: 2 }}>*</span>
        </label>

        <textarea
          className="sms-textarea"
          placeholder="Type your message..."
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          rows={6}
        />

        <div className="sms-footer">
          <Button
            disabled={isDisabled}
            label="Send"
            className={isDisabled ? "button-disabled" : "sms-send-btn"}
            onClick={handleSend}
          />
        </div>
      </div>
    </div>
  );
}
