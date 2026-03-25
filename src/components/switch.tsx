import { useTheme } from "@mui/material";
import "./switch.css";

interface SwitchProps {
  checked: boolean;
  onChange: (checked: boolean) => void;
  disabled?: boolean;
  label?: string;
  title?: string;
}

export default function Switch({
  checked,
  onChange,
  disabled = false,
  label,
  title,
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
        }}
      >
        <div className="switch-thumb" />
      </div>
      {label && <span className="switch-label">{label}</span>}
    </div>
  );
}
