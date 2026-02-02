import { useState } from "react";
import { Typography } from "@mui/material";
import { useQueryClient } from "@tanstack/react-query";

import { useSmsService } from "src/hooks/useService";
import Button from "src/components/button";
import Input from "src/components/input";
import { useSnackbar } from "src/provider/snackbar";
import { logsKeys } from "src/api/queryKeys";

import "./sms-composer.css";
import { CountryCodeSelect } from "./country-code-select";

export default function SMS() {
  const [countryCode, setCountryCode] = useState("+91");
  const [to, setTo] = useState<any>("");
  const [message, setMessage] = useState("");

  const destination = `${countryCode}${to}`;

  const { mutate } = useSmsService();
  const showSnackbar = useSnackbar();
  const queryClient = useQueryClient();

  const handleSend = () => {
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
          setTo("");
          showSnackbar(data?.message || "Message sent successfully", "info");
        },
        onError: () => {
          showSnackbar("Failed to send message", "error");
        },
      },
    );
  };

  const isDisabled = !to || !message;
  return (
    <div className="sms-container">
      <Typography variant="h6" sx={{ mt: 4, mb: 4 }}>
        New message
      </Typography>
      <div className="sms-wrapper">
        <div className="sms-to-row">
          <CountryCodeSelect value={countryCode} onChange={setCountryCode} />
          <Input
            type="tel"
            id="to"
            className="sms-input"
            placeholder="Enter receiver number"
            value={to}
            inputMode="numeric"
            pattern="[0-9]*"
            maxLength={10}
            onChange={(e) => {
              const onlyNums = e.target.value.replace(/\D/g, ""); // remove non-digits
              setTo(onlyNums);
            }}
          />
        </div>

        <textarea
          className="sms-textarea"
          placeholder="Type your message..."
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          rows={6}
        />

        <div className="sms-footer">
          <Button
            disabled={!to || !message}
            label="Send"
            className={isDisabled ? "button-disabled" : "sms-send-btn"}
            onClick={handleSend}
          />
        </div>
      </div>
    </div>
  );
}
