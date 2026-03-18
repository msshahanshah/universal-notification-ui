import { useEffect, useState } from "react";
import { Typography, useTheme } from "@mui/material";
import { useQueryClient } from "@tanstack/react-query";
import { useAtom } from "jotai";

import { useSlackService } from "src/hooks/useService";
import Button from "src/components/button";
import Input from "src/components/input";
import { useSnackbar } from "src/provider/snackbar";
import { logsKeys } from "src/api/queryKeys";
import ErrorText from "src/components/error-text";
import { slackRegex } from "src/utility/constants";

import "../slack/slack.css";
import {
  slackSectionsAtom,
  slackCallbackDataAtom,
  type SlackChannel,
} from "src/atoms/slackAtoms";
import COLORS from "src/utility/colors";

interface SlackWrapperProps {
  onValueChange?: (values: {
    destination: string[];
    message: string[];
    sections: any[];
  }) => void;
  maxBlocks?: number;
}

export function SlackWrapper({
  onValueChange,
  maxBlocks = 5,
}: SlackWrapperProps) {
  const theme = useTheme();
  // Replace local state with atoms
  const [channels, setChannels] = useAtom(slackSectionsAtom);
  const [callbackData] = useAtom(slackCallbackDataAtom);

  // Pass values to parent whenever they change (using computed atom)
  useEffect(() => {
    if (onValueChange) {
      onValueChange(callbackData);
    }
  }, [callbackData, onValueChange]);

  const { mutate } = useSlackService();
  const showSnackbar = useSnackbar();
  const queryClient = useQueryClient();
  const [invalidChannelId, setInvalidChannelId] = useState("");

  const addSection = () => {
    if (channels.length >= maxBlocks) {
      return; // Don't add more than maxBlocks
    }
    const newId = (
      Math.max(...channels.map((c) => parseInt(c.id))) + 1
    ).toString();
    setChannels([
      ...channels,
      { id: newId, channelID: "", message: "", separateMessage: false },
    ]);
  };

  const removeSection = (id: string) => {
    if (channels.length > 1) {
      setChannels(channels.filter((channel) => channel.id !== id));
    }
  };

  const updateSection = (
    id: string,
    field: keyof SlackChannel,
    value: string | boolean,
  ) => {
    const updatedChannel = channels.map((channel) =>
      channel.id === id ? { ...channel, [field]: value } : channel,
    );
    setChannels(updatedChannel);
  };

  return (
    <div className="sms-wrapper">
      {channels.map((channel, sectionIndex) => (
        <div
          key={channel.id}
          style={{
            marginBottom: 16,
            padding: "12px",
            border: "1px solid rgba(255,255,255,0.1)",
            borderRadius: "8px",
          }}
        >
          {channels.length > 1 && (
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                marginBottom: 12,
              }}
            >
              <span
                style={{
                  fontSize: "14px",
                  fontWeight: "bold",
                  color: theme.vars?.palette.text.secondary,
                }}
              >
                Slack Section {sectionIndex + 1}
              </span>
              <button
                onClick={() => removeSection(channel.id)}
                style={{
                  background: "transparent",
                  border: "none",
                  color: "red",
                  fontSize: "16px",
                  cursor: "pointer",
                }}
              >
                ×
              </button>
            </div>
          )}

          <label
            style={{
              fontSize: "12px",
              marginBottom: 8,
              display: "block",
              color: theme.vars?.palette.text.secondary,
            }}
          >
            Channel ID
            <span style={{ color: "red", marginLeft: 2 }}>*</span>
          </label>

          <Input
            type="text"
            id={`slack-channel-${channel.id}`}
            className="sms-input"
            placeholder="Eg. C0991E9E10R"
            value={channel.channelID}
            onChange={(e) => {
              if (!!invalidChannelId) {
                setInvalidChannelId("");
              }
              updateSection(channel.id, "channelID", e.target.value);
            }}
            showAsteric
          />

          {/* Separate Message Toggle for each Slack channel */}
          <button
            onClick={() =>
              updateSection(
                channel.id,
                "separateMessage",
                !channel.separateMessage,
              )
            }
            style={{
              padding: "4px 8px",
              fontSize: "10px",
              background: channel.separateMessage
                ? "rgba(76, 175, 80, 0.2)"
                : "rgba(255, 255, 255, 0.1)",
              border: `1px solid ${channel.separateMessage ? "#4CAF50" : "rgba(255, 255, 255, 0.2)"}`,
              color: channel.separateMessage ? "#4CAF50" : "#fff",
              borderRadius: "4px",
              cursor: "pointer",
              transition: "all 0.2s",
              marginTop: 8,
              marginBottom: 8,
              width: "100%",
            }}
          >
            {channel.separateMessage
              ? "Use common message"
              : "Send separate message"}
          </button>

          {channel.separateMessage && (
            <>
              <label
                style={{
                  marginBottom: 4,
                  fontSize: "12px",
                  marginTop: 8,
                  display: "block",
                  color: theme.vars?.palette.text.secondary,
                }}
              >
                Message {sectionIndex + 1}
                <span style={{ color: "red", marginLeft: 2 }}>*</span>
              </label>
              <textarea
                className="sms-textarea"
                placeholder="Type your message..."
                value={channel.message}
                onChange={(e) =>
                  updateSection(channel.id, "message", e.target.value)
                }
                rows={4}
                style={{ width: "100%", marginBottom: 8 }}
              />
            </>
          )}
        </div>
      ))}

      <button
        onClick={addSection}
        disabled={channels.length >= maxBlocks}
        style={{
          padding: "6px 12px",
          fontSize: "12px",
          background:
            channels.length >= maxBlocks
              ? "rgba(128, 128, 128, 0.2)"
              : "rgba(255, 255, 255, 0.1)",
          border: `1px solid ${channels.length >= maxBlocks ? "rgba(128, 128, 128, 0.4)" : "rgba(255, 255, 255, 0.2)"}`,
          color: channels.length >= maxBlocks ? "#888" : "#fff",
          borderRadius: "6px",
          cursor: channels.length >= maxBlocks ? "not-allowed" : "pointer",
          transition: "all 0.2s",
          marginTop: 8,
        }}
      >
        {channels.length >= maxBlocks
          ? `Max ${maxBlocks} Slack sections reached`
          : `Add Another Slack Section (${channels.length}/${maxBlocks})`}
      </button>

      {invalidChannelId && <ErrorText>{invalidChannelId}</ErrorText>}
    </div>
  );
}
