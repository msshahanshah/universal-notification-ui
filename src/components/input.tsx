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
              color: theme.palette.text.secondary,
              fontWeight: 500,
            }}
          >
            {label}
            {showAsteric && (
              <span style={{ color: theme.palette.error.main, marginLeft: 2 }}>
                *
              </span>
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
            color: theme.palette.text.primary,
            // backgroundColor: theme.palette.background.paper,
            border: `1px solid ${theme.palette.divider}`,

            transition: "all 0.2s ease",

            ...style,
          }}
          onFocus={(e) => {
            e.currentTarget.style.border = `1px solid ${theme.palette.primary.main}`;
          }}
          onBlur={(e) => {
            e.currentTarget.style.border = `1px solid ${theme.palette.divider}`;
          }}
        />
      </div>
    );
  },
);

export default Input;
