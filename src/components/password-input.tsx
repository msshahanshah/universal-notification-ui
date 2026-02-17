import { useState, ChangeEvent } from "react";
import { Visibility, VisibilityOff } from "@mui/icons-material";

import Input from "./input";
import { useTheme } from "@mui/material";

interface PasswordInputProps {
  label: string;
  value: string;
  id: string;
  onChange: (e: ChangeEvent<HTMLInputElement>) => void;
  autoComplete?: string;
  className?: string;
  dataTestId?: string;
  name?: string;
  style?: React.CSSProperties;
}

const PasswordInput = ({
  label,
  value,
  id,
  onChange,
  autoComplete,
  className,
  dataTestId,
  name,
  style
}: PasswordInputProps) => {
  const theme = useTheme();
  const [showPassword, setShowPassword] = useState(false);

  return (
    <div
      style={{
        position: "relative",
        width: "100%",
      }}
    >
      <Input
        label={label}
        value={value}
        id={id}
        type={showPassword ? "text" : "password"}
        onChange={onChange}
        autoComplete={autoComplete}
        className={className}
        dataTestId={dataTestId}
        name={name}
        style={style}
      />

      <button
        type="button"
        aria-label={showPassword ? "Hide password" : "Show password"}
        onClick={() => setShowPassword((prev) => !prev)}
        style={{
          position: "absolute",
          right: "0.5rem",
          top: "30px",
          background: "none",
          border: "none",
          cursor: "pointer",
        }}
      >
        {showPassword ? (
          <VisibilityOff style={{ color: theme.palette.text.secondary }} />
        ) : (
          <Visibility style={{ color: theme.palette.text.secondary }} />
        )}
      </button>
    </div>
  );
};

export default PasswordInput;
