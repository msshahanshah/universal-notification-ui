import { Suspense, useState, lazy } from "react";
import { Typography, useTheme } from "@mui/material";
import { useQueryClient } from "@tanstack/react-query";

import { useSlackService } from "src/hooks/useService";
import Button from "src/components/button";
import Input from "src/components/input";
import { useSnackbar } from "src/provider/snackbar";
import FallbackLoader from "src/components/fallback-loader/fallback-loader";
import { logsKeys } from "src/api/queryKeys";
import ErrorText from "src/components/error-text";
import { slackRegex } from "src/utility/constants";

import "./slack.css";

const HistoryTable = lazy(() => import("./history-table"));

export default function Slack() {
  const [channelID, setChannelID] = useState<any>("");
  const [message, setMessage] = useState("");
  const [invalidChannelId, setInvalidChannelId] = useState("");

  const theme = useTheme();
  const { mutate } = useSlackService();
  const showSnackbar = useSnackbar();
  const queryClient = useQueryClient();

  const resetStates = () => {
    setMessage("");
    setChannelID("");
    setInvalidChannelId("");
  };

  const handleSend = (channelID: string) => {
    const channelIds = channelID
      .split(",")
      .map((id) => id.trim())
      .filter(Boolean);

    const hasInvalid = channelIds.some((id) => !slackRegex.test(id));

    if (hasInvalid) {
      setInvalidChannelId("One or more Channel IDs are invalid");
      return;
    }

    mutate(
      {
        service: "slack",
        destination: channelID,
        message,
      },
      {
        onSuccess: (data) => {
          resetStates();
          queryClient.invalidateQueries({
            queryKey: logsKeys.all,
          });
          setMessage("");
          setChannelID("");
          showSnackbar(data?.message || "Message sent successfully", "info");
        },
        onError: (error) => {
          showSnackbar(error?.message || "Failed to send message", "error");
        },
      },
    );
  };

  const isDisabled = !channelID || !message || !!invalidChannelId;

  return (
    <div className="slack-container">
      <Typography variant="h6" sx={{ mb: 4 }}>
        New message
      </Typography>
      <div
        className="sms-wrapper"
        style={{ backgroundColor: theme.palette.background.paper }}
      >
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
          style={{ color: "#fff" }}
        />

        {/* TODO make textarea reusable */}
        <label
          style={{
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
        <ErrorText>{invalidChannelId}</ErrorText>
        <div className="sms-footer">
          <Button
            disabled={!channelID?.trim() || !message?.trim()}
            label="Send"
            className={isDisabled ? "button-disabled" : "sms-send-btn"}
            onClick={() => handleSend(channelID)}
          />
        </div>
      </div>
      <Typography variant="h6" sx={{ mt: 0, mb: "32px" }}>
        History (Last 10 messages)
      </Typography>
      <Suspense fallback={<FallbackLoader />}>
        <HistoryTable />
      </Suspense>
    </div>
  );
}
