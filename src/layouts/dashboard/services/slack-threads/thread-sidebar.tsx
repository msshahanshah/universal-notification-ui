import { useEffect, useState } from "react";
import {
  Box,
  IconButton,
  Typography,
  useTheme,
  Backdrop,
  Slide,
  Paper,
} from "@mui/material";
import { Close as CloseIcon } from "@mui/icons-material";
import { SlackThread } from "src/api/slack-threads.api";
import { ThreadMessage } from "./components/thread-message";
import COLORS from "src/utility/colors";

interface ThreadSidebarProps {
  thread: SlackThread | null;
  isOpen: boolean;
  onClose: () => void;
}

export function ThreadSidebar({ thread, isOpen, onClose }: ThreadSidebarProps) {
  const theme = useTheme();
  const [isAnimating, setIsAnimating] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setIsAnimating(true);
    } else {
      const timer = setTimeout(() => setIsAnimating(false), 300);
      return () => clearTimeout(timer);
    }
  }, [isOpen]);

  if (!thread) return null;

  const hasReplies = thread.userRepliedMessages && thread.userRepliedMessages.length > 0;

  console.log("hasReplies",hasReplies)
  return (
    <>
      {/* Backdrop */}
      <Backdrop
        open={isOpen}
        onClick={onClose}
        sx={{
          zIndex: 1000,
          backgroundColor: theme.vars?.palette.background.default === '#1f2836' 
            ? 'rgba(0, 0, 0, 0.7)'
            : 'rgba(0, 0, 0, 0.5)',
        }}
      />

      {/* Slide-in Panel */}
      <Slide
        direction="left"
        in={isOpen}
        timeout={{ enter: 300, exit: 300 }}
      >
        <Paper
          sx={{
            position: "fixed",
            top: 0,
            right: 0,
            height: "100vh",
            width: "500px",
            maxWidth: "90vw",
            backgroundColor: theme.vars?.palette.background.paper,
            border: `1px solid ${theme.vars?.palette.divider}`,
            borderLeft: `2px solid ${theme.vars?.palette.primary.main}`,
            zIndex: 1001,
            display: "flex",
            flexDirection: "column",
            boxShadow: "-4px 0 20px rgba(0, 0, 0, 0.1)",
          }}
        >
          {/* Header */}
          <Box
            sx={{
              p: 3,
              borderBottom: `1px solid ${theme.vars?.palette.divider}`,
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              backgroundColor: theme.vars?.palette.background.default,
            }}
          >
            <Box>
              <Typography variant="h6" color="text.secondary" sx={{ mb: 1 }}>
                Thread Details
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Channel: {thread.destination}
              </Typography>
            </Box>
            <IconButton
              onClick={onClose}
              sx={{
                color: theme.vars?.palette.text.secondary,
                "&:hover": {
                  backgroundColor: theme.vars?.palette.action.hover,
                },
              }}
            >
              <CloseIcon />
            </IconButton>
          </Box>

          {/* Messages Container */}
          <Box
            sx={{
              flex: 1,
              overflow: "auto",
              p: 3,
            }}
          >
            {/* Original Message */}
            <ThreadMessage
              message={{
                username: "Bot",
                reactions: [],
                message: thread.message || "No message content",
              }}
              isOriginal={true}
              showReactions={false}
            />

            {/* Replies Section */}
            {hasReplies ? (
              <>
                <Typography
                  variant="subtitle1"
                  sx={{
                    mt: 3,
                    mb: 2,
                    fontWeight: "bold",
                    color: theme.vars?.palette.text.secondary,
                  }}
                >
                  User Replies ({thread.userRepliedMessages?.length})
                </Typography>
                
                {thread.userRepliedMessages.map((reply, index) => (
                  <ThreadMessage
                    key={index}
                    message={reply}
                    isOriginal={false}
                    showReactions={true}
                  />
                ))}
              </>
            ) : (
              <Box
                sx={{
                  mt: 3,
                  p: 3,
                  textAlign: "center",
                  backgroundColor: theme.vars?.palette.background.default,
                  borderRadius: 2,
                  border: `1px solid ${theme.vars?.palette.divider}`,
                }}
              >
                <Typography variant="body2" color="text.secondary">
                  No user replies found for this thread
                </Typography>
              </Box>
            )}
          </Box>

          {/* Footer */}
          <Box
            sx={{
              p: 3,
              borderTop: `1px solid ${theme.vars?.palette.divider}`,
              backgroundColor: theme.vars?.palette.background.default,
            }}
          >
            <Typography variant="caption" color="text.secondary">
              Sent on {new Date(thread.messageDate).toLocaleString()}
            </Typography>
          </Box>
        </Paper>
      </Slide>
    </>
  );
}
