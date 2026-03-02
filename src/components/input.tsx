import { useTheme } from "@mui/material";
import { ChangeEvent, forwardRef, InputHTMLAttributes } from "react";

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  value: string | number;
  id: string;
  onChange: (e: ChangeEvent<HTMLInputElement>) => void;
  autoComplete?: string;
  dataTestId?: string;
  showAsteric?: boolean;
  style?: React.CSSProperties;
  subLabel?: string;
}

const Input = forwardRef<HTMLInputElement, InputProps>(
  (
    {
      label,
      value,
      id,
      onChange,
      showAsteric = false,
      autoComplete,
      dataTestId,
      style,
      subLabel,
      ...props
    },
    ref,
  ) => {
    const theme = useTheme();

    return (
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          width: "100%",
        }}
      >
        {label && (
          <label
            htmlFor={id}
            style={{
              marginBottom: 6,
              fontSize: 12,
              color: theme.vars?.palette.text.secondary,
              fontWeight: 500,
            }}
          >
            {label}
            {showAsteric && (
              <span style={{ color: theme.vars?.palette.error.main, marginLeft: 2 }}>
                *
              </span>
            )}
            {subLabel && (
              <div style={{ fontSize: 10, color: theme.vars?.palette.text.disabled }}>
                ({subLabel})
              </div>
            )}
          </label>
        )}

        <input
          ref={ref}
          id={id}
          aria-label={label}
          value={value}
          onChange={onChange}
          autoComplete={autoComplete}
          data-testid={dataTestId}
          {...props}
          style={{
            width: "100%",
            height: "2.5rem",
            padding: "0 12px",
            borderRadius: 8,
            outline: "none",
            fontSize: 13,

            /* 🔥 THEME FIXES */
            color: theme.vars?.palette.text.secondary,
            border: `1px solid black`,
            transition: "all 0.2s ease",
            ...style,
          }}
          onFocus={(e) => {
            e.currentTarget.style.border = `1px solid ${theme.vars?.palette.primary.main}`;
          }}
          onBlur={(e) => {
            e.currentTarget.style.border = `1px solid ${theme.vars?.palette.divider}`;
          }}
        />
      </div>
    );
  },
);

export default Input;
