import { useTheme } from "@mui/material";
import emoji from "emoji-dictionary";

import { UserReplyMessage } from "src/api/types.api";
import COLORS from "src/utility/colors";

// Helper function to render message with highlighted mentions
const renderMessageWithMentions = (message: string, theme: any) => {
  if (!message) return null;
  
  // Split message by mentions (@ followed by word characters, optionally with spaces for multi-word names)
  // This regex will match @untest and @Shelly Agarwal separately, but not include "test"
  const parts = message.split(/(@\w+(?:\s+\w+)*?)(?=\s|$)/g);
  
  return parts.map((part, index) => {
    if (part.startsWith('@') && part.trim()) {
      const mention = part.substring(1).trim();
      const isUntest = mention.toLowerCase() === 'untest';
      
      return (
        <span
          key={index}
          style={{
            backgroundColor: isUntest ? COLORS.PASTEL_DARK_BLUE : '#63571C',
            color: isUntest ? COLORS.LIGHT_BLUE : '#FFD700',
            padding: '2px 6px',
            borderRadius: '4px',
            marginRight: '2px',
            fontWeight: 'bold',
            fontSize: '14px',
          }}
        >
          {part}
        </span>
      );
    }
    return part;
  });
};

// Helper function to check if reaction is a GIF and return its URL
const getGifUrl = (reaction: string): string | null => {
  // For known GIF reactions, return appropriate URLs
  // In production, you might want to use a GIF API like Giphy
  const gifMap: Record<string, string> = {
    'among_us_party': 'https://media.giphy.com/media/v1.Y2lkPTc5MGI3NjExdDQzZ2J0bGJzNmFxa3FqZ2NnaDQ3a3ZidjFoc3A4b3RqaW5uaDZqcyZlcD12MV9pbnRlcm5hbF9naWZfYnlfaWQmY3Q9Zw/JU7Asuy9xSv6gBjWv8/giphy.gif',
    'cool-doge': 'https://media.giphy.com/media/v1.Y2lkPTc5MGI3NjExMnM0b3Fpd3ZidjFoc3A4b3RqaW5uaDZqcyZlcD12MV9pbnRlcm5hbF9naWZfYnlfaWQmY3Q9Zw/3o7TKUMjIgbcEO7bwU/giphy.gif',
  };
  
  return gifMap[reaction] || null;
};

interface ThreadMessageProps {
  message: UserReplyMessage;
  isOriginal?: boolean;
  showReactions?: boolean;
}

export function ThreadMessage({
  message,
  isOriginal = false,
  showReactions = true,
}: ThreadMessageProps) {
  const theme = useTheme();

  return (
    <div
      style={{
        padding: "12px 16px",
        marginBottom: "8px",
        backgroundColor: isOriginal
          ? theme.vars?.palette.background.default
          : "transparent",
        border: isOriginal
          ? `1px solid ${theme.vars?.palette.divider}`
          : "none",
        borderRadius: "8px",
      }}
    >
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "flex-start",
          marginBottom: "8px",
        }}
      >
        <span
          style={{
            fontWeight: "bold",
            color: theme.vars?.palette.text.secondary,
            fontSize: "14px",
          }}
        >
          {isOriginal ? "Original Message" : message.username}
        </span>

        {showReactions && message.reactions.length > 0 && (
          <div
            style={{
              display: "flex",
              gap: "4px",
              alignItems: "center",
              flexWrap: "wrap",
            }}
          >
            {message.reactions.map((reaction, index) => {
              const gifUrl = getGifUrl(reaction);
              
              return (
                <span
                  key={index}
                  style={{
                    fontSize: "18px",
                    backgroundColor: theme.vars?.palette.background.paper,
                    padding: "4px 8px",
                    borderRadius: "16px",
                    display: "inline-flex",
                    alignItems: "center",
                    justifyContent: "center",
                    margin: "2px",
                  }}
                  title={reaction}
                >
                  {gifUrl ? (
                    <img
                      src={gifUrl}
                      alt={reaction}
                      style={{
                        width: "20px",
                        height: "20px",
                        objectFit: "contain",
                      }}
                      onError={(e) => {
                        // Fallback to Unicode emoji if GIF fails to load
                        const target = e.target as HTMLImageElement;
                        target.style.display = 'none';
                        if (target.nextElementSibling) {
                          (target.nextElementSibling as HTMLElement).style.display = 'inline';
                        }
                      }}
                    />
                  ) : null}
                  <span style={{ display: gifUrl ? 'none' : 'inline' }}>{emoji.getUnicode(reaction)}</span>
                </span>
              );
            })}
          </div>
        )}
      </div>

      {message.message ? (
        <p
          style={{
            margin: 0,
            color: theme.vars?.palette.text.secondary,
            fontSize: "14px",
            lineHeight: "1.4",
            whiteSpace: "pre-wrap",
          }}
        >
          {renderMessageWithMentions(message.message, theme)}
        </p>
      ) : (
        <p
          style={{
            margin: 0,
            color: theme.vars?.palette.text.disabled,
            fontSize: "14px",
            fontStyle: "italic",
          }}
        >
          {isOriginal ? "No message content" : "No reply message"}
        </p>
      )}
    </div>
  );
}
