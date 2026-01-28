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
        right: "0%",
        backgroundColor: bgColorMap[type],
        color: "#fff",
        padding: "10px 16px",
        borderRadius: 4,
        boxShadow: "0px 3px 10px rgba(0,0,0,0.3)",
        zIndex: 9999,
        textAlign: "left",
        marginRight: 10,
        minWidth: 320,
        maxWidth: "calc(100vw - 32px)",
      }}
    >
      {message}
      <span
        onClick={onClose}
        style={{
          marginLeft: 12,
          cursor: "pointer",
          fontSize: 16,
          fontWeight: "bold",
          opacity: 0.8,
          position: "absolute",
          right: 15,
          top: "50%",
          transform: "translateY(-50%)",
        }}
      >
        ×
      </span>
    </div>
  );
};

export default Snackbar;
