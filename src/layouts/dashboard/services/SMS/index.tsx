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
  countryCode: string;
  number: string;
}

export default function SMS() {
  const theme = useTheme();
  const queryClient = useQueryClient();
  const showSnackbar = useSnackbar();
  const { mutate } = useSmsService();

  const [recipients, setRecipients] = useState<Recipient[]>([
    { countryCode: "+91", number: "" },
  ]);

  const [message, setMessage] = useState("");

  /* -------------------- Handlers -------------------- */

  const updateNumber = (index: number, value: string) => {
    const clean = value.replace(/\D/g, "");

    const updated = [...recipients];
    updated[index].number = clean;

    setRecipients(updated);
  };

  const updateCountryCode = (index: number, code: string) => {
    const updated = [...recipients];
    updated[index].countryCode = code;

    setRecipients(updated);
  };

  const addRecipient = () => {
    setRecipients([...recipients, { countryCode: "+91", number: "" }]);
  };

  const removeRecipient = (index: number) => {
    const updated = recipients.filter((_, i) => i !== index);
    setRecipients(updated);
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
          setRecipients([{ countryCode: "+91", number: "" }]);

          showSnackbar(data?.message || "Message sent successfully", "info");
        },
        onError: (error: any) => {
          showSnackbar(error?.message || "Failed to send message", "error");
        },
      },
    );
  };

  /* -------------------- UI -------------------- */

  return (
    <div className="sms-container">
      <Typography variant="h6" sx={{ mt: 0, mb: 4 }}>
        New message
      </Typography>

      <div
        className="sms-wrapper"
        style={{ backgroundColor: theme.palette.background.sidebar }}
      >
        {/* Phone Numbers */}
        <label
          style={{
            fontSize: "12px",
            color: theme.palette.text.secondary,
          }}
        >
          Phone number
          <span style={{ color: "red", marginLeft: 2 }}>*</span>
        </label>

        <div>
          {recipients.map((recipient, index) => (
            <div key={index} className="sms-to-row">
              <CountryCodeSelect
                value={recipient.countryCode}
                onChange={(code) => updateCountryCode(index, code)}
              />

              <Input
                type="tel"
                id={`recipient-${index}`}
                placeholder="Enter receiver number"
                value={recipient.number}
                inputMode="numeric"
                className="sms-input"
                onChange={(e) => updateNumber(index, e.target.value)}
              />

              {recipients.length > 1 && (
                <button
                  type="button"
                  onClick={() => removeRecipient(index)}
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
            color: theme.palette.text.secondary,
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
