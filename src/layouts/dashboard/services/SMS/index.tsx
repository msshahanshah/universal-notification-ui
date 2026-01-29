import { useEffect, useState } from "react";
import { Typography } from "@mui/material";
import { useQueryClient } from "@tanstack/react-query";

import { useSmsService } from "src/hooks/useService";
import Button from "src/components/button";
import Input from "src/components/input";
import { useSnackbar } from "src/provider/snackbar";
import { logsKeys } from "src/api/queryKeys";

import "./sms-composer.css";

export default function SMS() {
  const [to, setTo] = useState<any>("");
  const [message, setMessage] = useState("");

  const { mutate } = useSmsService();
  const showSnackbar = useSnackbar();
  const queryClient = useQueryClient();

  const handleSend = () => {
    mutate(
      {
        service: "sms",
        destination: to,
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
        {/* type="tel"> */}
        <Input
          label="To"
          type="text"
          id="to"
          className="sms-input"
          placeholder="Enter receiver number"
          value={to}
          onChange={(e) => setTo(e.target.value)}
        />

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
