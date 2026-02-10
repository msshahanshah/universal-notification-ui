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
import ErrorText from "src/components/error-text";
import { slackRegex } from "src/utility/constants";

import "./slack.css";

const HistoryTable = lazy(() => import("./history-table"));

export default function Slack() {
  const [channelID, setChannelID] = useState<any>("");
  const [message, setMessage] = useState("");
  const [invalidChannelId, setInvalidChannelId] = useState("");
  const { mutate } = useSlackService();
  const showSnackbar = useSnackbar();
  const queryClient = useQueryClient();

  const slackLogsParams = { service: "slack", limit: 10 };

  const resetStates = () => {
    setMessage("");
    setChannelID("");
    setInvalidChannelId("");
  };

  const handleSend = (channelID: string) => {
    if (!slackRegex.test(channelID)) {
      setInvalidChannelId("Invalid channel ID");
      return;
    }

    resetStates();

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

  const isDisabled = !channelID || !message || !!invalidChannelId;
  const {
    data: response,
    isLoading,
    isError,
    error,
  } = useLogs(slackLogsParams);

  return (
    <div className="slack-container">
      <Typography variant="h6" sx={{ mb: 4 }}>
        New message
      </Typography>
      <div className="sms-wrapper">
        <Input
          label="Channel ID"
          type="text"
          id="channelID"
          className="sms-input"
          placeholder="Eg. C0991E9E10R"
          value={channelID}
          onChange={(e) => {
            if (!!invalidChannelId) {
              setInvalidChannelId("");
            }
            setChannelID(e.target.value);
          }}
          showAsteric
        />

        {/* TODO make textarea reusable */}
        <label style={{ marginBottom: 4, fontSize: "12px" }}>
          Message
          <span style={{ color: "red",marginLeft:2 }}>*</span>
        </label>
        <textarea
          className="sms-textarea"
          placeholder="Type your message..."
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          rows={6}
        />
        <ErrorText>{invalidChannelId}</ErrorText>
        <div className="sms-footer">
          <Button
            disabled={!channelID || !message}
            label="Send"
            className={isDisabled ? "button-disabled" : "sms-send-btn"}
            onClick={() => handleSend(channelID)}
          />
        </div>
      </div>
      <Typography variant="h6" sx={{ mt: 0 }}>
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
