import { Suspense, useState, lazy } from "react";
import { Typography } from "@mui/material";
import { useQueryClient } from "@tanstack/react-query";

import { useSlackService } from "src/hooks/useService";
import Button from "src/components/button";
import Input from "src/components/input";
import { useSnackbar } from "src/provider/snackbar";
import FallbackLoader from "src/components/fallback-loader/fallback-loader";
import { useLogs } from "src/hooks/useLogs";
import { logsKeys } from "src/api/queryKeys";

import "./slack.css";

const HistoryTable = lazy(() => import("./history-table"));

export default function Slack() {
  const [channelID, setChannelID] = useState<any>("");
  const [message, setMessage] = useState("");

  const { mutate } = useSlackService();
  const showSnackbar = useSnackbar();
  const queryClient = useQueryClient();

  const slackLogsParams = { service: "slack", limit: 10 };

  const handleSend = () => {
    mutate(
      {
        service: "slack",
        destination: channelID,
        message,
      },
      {
        onSuccess: (data) => {
          queryClient.invalidateQueries({
            queryKey: logsKeys.all,
          });
          setMessage("");
          setChannelID("");
          showSnackbar(data?.message || "Message sent successfully", "info");
        },
        onError: () => {
          showSnackbar("Failed to send message", "error");
        },
      },
    );
  };

  const isDisabled = !channelID || !message;
  const {
    data: response,
    isLoading,
    isError,
    error,
    isFetching,
  } = useLogs(slackLogsParams);

  console.log(
    "isFetching",
    isFetching,
    "isLoading",
    isLoading,
    "response",
    response,
  );

  return (
    <div className="slack-container">
      <Typography variant="h6" sx={{ mb: 2 }}>
        New Message
      </Typography>
      <div className="sms-wrapper">
        <Input
          label="Channel ID"
          type="text"
          id="channelID"
          className="sms-input"
          placeholder="Eg. C0991E9E10R"
          value={channelID}
          onChange={(e) => setChannelID(e.target.value)}
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
            disabled={!channelID || !message}
            label="Send"
            className={isDisabled ? "button-disabled" : "sms-send-btn"}
            onClick={handleSend}
          />
        </div>
      </div>
      <Typography variant="h6" sx={{ mt: 4 }}>
        History (Last 10 messages)
      </Typography>
      <Suspense fallback={<FallbackLoader />}>
        <HistoryTable
          data={response}
          isDataLoading={isLoading}
          isError={isError}
          error={error}
        />
      </Suspense>
    </div>
  );
}
