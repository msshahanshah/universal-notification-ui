import { useEffect } from "react";

interface SnackbarProps {
  open: boolean;
  message: string;
  duration?: number;
  onClose: () => void;
  type?: "success" | "error" | "info" | "warning";
}

const bgColorMap = {
  success: "#4caf50",
  error: "#d32f2f",
  info: "#0288d1",
  warning: "#ed6c02",
};

const Snackbar = ({
  open,
  message,
  duration = 3000,
  onClose,
  type = "info",
}: SnackbarProps) => {
  useEffect(() => {
    if (!open) return;
    const timer = setTimeout(onClose, duration);
    return () => clearTimeout(timer);
  }, [open, duration, onClose]);

  if (!open) return null;

  return (
    <div
      style={{
        position: "fixed",
        bottom: 40,
        right: 20,
        backgroundColor: bgColorMap[type],
        color: "#fff",
        padding: "12px 16px",
        borderRadius: 8,
        boxShadow: "0px 4px 20px rgba(0,0,0,0.25)",
        zIndex: 9999,

        /* 🔥 Dynamic width */
        width: "fit-content",
        maxWidth: "90vw",

        /* 🔥 Flex layout fix */
        display: "flex",
        alignItems: "center",
        gap: 12,
      }}
    >
      {/* Message */}
      <div
        style={{
          wordBreak: "break-word",
          whiteSpace: "pre-line", // Preserve line breaks
          lineHeight: 1.4,
          flex: 1,
        }}
      >
        {message}
      </div>

      {/* Close Button */}
      <span
        onClick={onClose}
        style={{
          cursor: "pointer",
          fontSize: 18,
          fontWeight: 600,
          opacity: 0.85,
          flexShrink: 0,
        }}
      >
        ×
      </span>
    </div>
  );
};

export default Snackbar;
