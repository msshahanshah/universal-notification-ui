import { useState } from "react";
import { Typography, useTheme } from "@mui/material";
import Input from "src/components/input";
import Button from "src/components/button";
import ErrorText from "src/components/error-text";
import { useInputStyles } from "src/utility/styles";

interface ChannelInputProps {
  onChannelSelect: (channelId: string) => void;
  isLoading?: boolean;
}

export function ChannelInput({ onChannelSelect, isLoading = false }: ChannelInputProps) {
  const theme = useTheme();
  const inputStyle = useInputStyles();
  const [channelID, setChannelID] = useState("");
  const [invalidChannelId, setInvalidChannelId] = useState("");

  const handleLoadThreads = () => {
    if (!channelID.trim()) {
      setInvalidChannelId("Channel ID is required");
      return;
    }

    // Basic validation for channel ID format
    const channelIds = channelID
      .split(",")
      .map((id) => id.trim())
      .filter(Boolean);

    if (channelIds.length === 0) {
      setInvalidChannelId("Please enter a valid Channel ID");
      return;
    }

    // Use first channel ID for now
    const selectedChannelId = channelIds[0];
    setInvalidChannelId("");
    onChannelSelect(selectedChannelId);
  };

  return (
    <div
      style={{
        backgroundColor: theme.vars?.palette.background.paper,
        border: `1px solid ${theme.vars?.palette.divider}`,
        borderRadius: "8px",
        padding: "20px",
        marginBottom: "24px",
      }}
    >
      <Typography variant="h6" sx={{ mb: 3, color: "text.secondary" }}>
        Slack Thread Viewer
      </Typography>
      
      <Typography variant="body2" sx={{ mb: 2, color: "text.secondary" }}>
        Enter a Slack Channel ID to view message threads and user replies
      </Typography>

      <Input
        label="Channel ID"
        type="text"
        id="slack-channel-id"
        placeholder="Eg. C0991E9E10R"
        value={channelID}
        onChange={(e) => {
          if (!!invalidChannelId) {
            setInvalidChannelId("");
          }
          setChannelID(e.target.value);
        }}
        showAsteric={true}
        style={inputStyle}
      />

      <ErrorText>{invalidChannelId}</ErrorText>

      <div style={{ marginTop: "16px" }}>
        <Button
          label={isLoading ? "Loading..." : "Load Threads"}
          className={isLoading ? "button-disabled" : "send-button"}
          disabled={isLoading || !channelID.trim()}
          onClick={handleLoadThreads}
        />
      </div>
    </div>
  );
}
