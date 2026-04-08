import { useTheme } from "@mui/material";
import "./switch.css";

interface SwitchProps {
  checked: boolean;
  onChange: (checked: boolean) => void;
  disabled?: boolean;
  label?: string;
  title?: string;
  sx?: React.CSSProperties;
}

export default function Switch({
  checked,
  onChange,
  disabled = false,
  label,
  title,
  sx
}: SwitchProps) {
  const theme = useTheme();

  const handleChange = () => {
    if (!disabled) {
      onChange(!checked);
    }
  };

  return (
    <div
      className="switch-container"
      title={title}
      style={{
        display: "flex",
        alignItems: "center",
        gap: 8,
        opacity: disabled ? 0.5 : 1,
        cursor: disabled ? "not-allowed" : "pointer",
        ...sx,
      }}
    >
      <div
        className={`switch ${checked ? "checked" : ""} ${disabled ? "disabled" : ""}`}
        onClick={handleChange}
        role="switch"
        aria-checked={checked}
        aria-disabled={disabled}
        style={{
          backgroundColor: checked
            ? theme.vars?.palette.success.main || "#10b981"
            : theme.vars?.palette.action.disabled || "#6b7280",
          border: "1px solid rgba(255, 255, 255, 0.15)",
          boxShadow:
            "rgba(0, 0, 0, 0.6) 0px 4px 5px, rgba(255, 255, 255, 0.04) 0px 0px 0px 1px, rgba(0, 210, 255, 0.25) 0px 0px 20px",
        }}
      >
        <div className="switch-thumb" />
      </div>
      {label && <span className="switch-label" style={{ color: theme.vars?.palette.text.secondary }}>{label}</span>}
    </div>
  );
}
