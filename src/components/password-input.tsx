import { useState, ChangeEvent } from "react";
import { Visibility, VisibilityOff } from "@mui/icons-material";

import Input from "./input";

interface PasswordInputProps {
  label: string;
  value: string;
  id: string;
  onChange: (e: ChangeEvent<HTMLInputElement>) => void;
  autoComplete?: string;
  className?: string;
  dataTestId?: string;
  name?: string;
}

const PasswordInput = ({
  label,
  value,
  id,
  onChange,
  autoComplete,
  className,
  dataTestId,
  name
}: PasswordInputProps) => {
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
        {showPassword ? <VisibilityOff /> : <Visibility />}
      </button>
    </div>
  );
};

export default PasswordInput;
