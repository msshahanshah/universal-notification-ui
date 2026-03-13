import { useState, useEffect, useMemo } from "react";
import { Typography } from "@mui/material";
import { useQueryClient } from "@tanstack/react-query";

import { useSlackService } from "src/hooks/useService";
import Button from "src/components/button";
import Input from "src/components/input";
import { useSnackbar } from "src/provider/snackbar";
import { logsKeys } from "src/api/queryKeys";
import ErrorText from "src/components/error-text";
import { slackRegex } from "src/utility/constants";

import "../slack/slack.css";

interface SlackChannel {
  id: string;
  channelID: string;
  message: string;
}

interface SlackWrapperProps {
  showMessage: boolean;
  onValueChange?: (values: { destination: string[]; message: string[] }) => void;
}

export function SlackWrapper({ showMessage, onValueChange }: SlackWrapperProps) {
  const [channels, setChannels] = useState<SlackChannel[]>([
    { id: "1", channelID: "", message: "" }
  ]);
  const [invalidChannelId, setInvalidChannelId] = useState("");
  const { mutate } = useSlackService();
  const showSnackbar = useSnackbar();
  const queryClient = useQueryClient();

  // Create destination and message arrays from channels
  const destinations = useMemo(() => 
    channels
      .filter((channel) => channel.channelID.trim() !== "")
      .map((channel) => channel.channelID),
    [channels]
  );

  const messages = useMemo(() => 
    channels
      .filter((channel) => channel.message.trim() !== "")
      .map((channel) => channel.message),
    [channels]
  );

  // Pass values to parent whenever they change
  useEffect(() => {
    if (onValueChange) {
      onValueChange({
        destination: destinations,
        message: messages,
      });
    }
  }, [destinations, messages, onValueChange]);

  const addChannel = () => {
    const newId = (Math.max(...channels.map((c) => parseInt(c.id))) + 1).toString();
    setChannels([...channels, { id: newId, channelID: "", message: "" }]);
  };

  const removeChannel = (id: string) => {
    if (channels.length > 1) {
      setChannels(channels.filter((channel) => channel.id !== id));
    }
  };

  const updateChannel = (id: string, field: keyof SlackChannel, value: string) => {
    setChannels(
      channels.map((channel) => (channel.id === id ? { ...channel, [field]: value } : channel)),
    );
  };

  const handleSend = () => {
    const validChannels = channels.filter(channel => 
      channel.channelID.trim() !== "" && slackRegex.test(channel.channelID)
    );

    if (validChannels.length === 0) {
      setInvalidChannelId("Please enter valid channel ID(s)");
      return;
    }

    // Send to each channel
    validChannels.forEach(channel => {
      mutate(
        {
          service: "slack",
          destination: channel.channelID,
          message: showMessage ? channel.message : channels[0].message,
        },
        {
          onSuccess: (data) => {
            queryClient.invalidateQueries({
              queryKey: logsKeys.all,
            });
            showSnackbar(data?.message || "Message sent successfully", "info");
          },
          onError: (error) => {
            showSnackbar(error?.message || "Failed to send message", "error");
          },
        },
      );
    });

    // Reset form
    setChannels(channels.map(channel => ({ ...channel, message: "" })));
  };

  return (
    <div className="sms-wrapper">
      {channels.map((channel, index) => (
        <div key={channel.id} style={{ marginBottom: 8 }}>
          <Input
            label={index === 0 ? "Channel ID" : ""}
            type="text"
            id={`slack-channel-${channel.id}`}
            className="sms-input"
            placeholder="Eg. C0991E9E10R"
            value={channel.channelID}
            onChange={(e) => {
              if (!!invalidChannelId) {
                setInvalidChannelId("");
              }
              updateChannel(channel.id, "channelID", e.target.value);
            }}
            showAsteric
          />
          {channels.length > 1 && (
            <button
              onClick={() => removeChannel(channel.id)}
              style={{
                marginLeft: 8,
                background: 'transparent',
                border: 'none',
                color: '#ff4444',
                cursor: 'pointer',
                fontSize: '16px',
                marginTop: index === 0 ? '20px' : '0'
              }}
            >
              ×
            </button>
          )}
          
          {showMessage && (
            <>
              <label style={{ marginBottom: 4, fontSize: "12px", marginTop: 8 }}>
                Message {index > 0 && index + 1}
                <span style={{ color: "red", marginLeft: 2 }}>*</span>
              </label>
              <textarea
                className="sms-textarea"
                placeholder="Type your message..."
                value={channel.message}
                onChange={(e) => updateChannel(channel.id, "message", e.target.value)}
                rows={4}
              />
            </>
          )}
        </div>
      ))}

      <button
        onClick={addChannel}
        style={{
          padding: "6px 12px",
          fontSize: "12px",
          background: "rgba(255, 255, 255, 0.1)",
          border: "1px solid rgba(255, 255, 255, 0.2)",
          color: "#fff",
          borderRadius: "6px",
          cursor: "pointer",
          transition: "all 0.2s",
          marginTop: 8
        }}
      >
        Add Another Channel
      </button>

      {invalidChannelId && <ErrorText>{invalidChannelId}</ErrorText>}
    </div>
  );
}
