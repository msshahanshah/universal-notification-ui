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
import { AddButton } from "./helper";
import { useInputStyles } from "src/utility/styles";

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
  const inputStyle = useInputStyles();
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
    <div
      className="sms-wrapper"
      style={{ backgroundColor: theme.vars?.palette.background.paper }}
    >
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
          {channels.length >= 1 && (
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
              {sectionIndex !== 0 && (
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
              )}
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
            // className="sms-input"
            placeholder="Eg. C0991E9E10R"
            value={channel.channelID}
            onChange={(e) => {
              if (!!invalidChannelId) {
                setInvalidChannelId("");
              }
              updateSection(channel.id, "channelID", e.target.value);
            }}
            showAsteric
            style={inputStyle}
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
            className="add-btn"
            style={{ width: "100%" }}
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

      <AddButton
        title="Slack"
        onClick={addSection}
        data={channels}
        maxBlocks={maxBlocks}
      />

      {invalidChannelId && <ErrorText>{invalidChannelId}</ErrorText>}
    </div>
  );
}
