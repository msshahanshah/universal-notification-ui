import { useState } from "react";
import { Typography, useTheme } from "@mui/material";
import { SlackThread } from "src/api/slack-threads.api";
import { ChannelInput } from "./components/channel-input";
import { ThreadsTable } from "./threads-table";
import { ThreadSidebar } from "./thread-sidebar";
import "./slack-threads.css";

export default function SlackThreads() {
  const theme = useTheme();
  const [selectedChannelId, setSelectedChannelId] = useState<string>("");
  const [selectedThread, setSelectedThread] = useState<SlackThread | null>(null);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  const handleChannelSelect = (channelId: string) => {
    setSelectedChannelId(channelId);
    // Reset selected thread when channel changes
    setSelectedThread(null);
    setIsSidebarOpen(false);
  };

  const handleThreadClick = (thread: SlackThread) => {
    setSelectedThread(thread);
    setIsSidebarOpen(true);
  };

  const handleSidebarClose = () => {
    setIsSidebarOpen(false);
    // Keep the thread selected for potential reopening
  };

  return (
    <div className="slack-threads-container">
      <Typography variant="h5" sx={{ mb: 2, color: "text.secondary" }}>
        Slack Thread Viewer
      </Typography>
      
      <Typography variant="body1" sx={{ mb: 4, color: "text.secondary" }}>
        View Slack message threads, user replies, and reactions in an organized interface.
      </Typography>

      {/* Channel Selection */}
      <ChannelInput 
        onChannelSelect={handleChannelSelect}
        isLoading={false}
      />

      {/* Threads Table */}
      {selectedChannelId && (
        <ThreadsTable
          channelId={selectedChannelId}
          onThreadClick={handleThreadClick}
        />
      )}

      {/* Thread Details Sidebar */}
      <ThreadSidebar
        thread={selectedThread}
        isOpen={isSidebarOpen}
        onClose={handleSidebarClose}
      />
    </div>
  );
}
