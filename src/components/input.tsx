import { ChangeEvent, forwardRef, InputHTMLAttributes } from "react";

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  value: string | number;
  id: string;
  onChange: (e: ChangeEvent<HTMLInputElement>) => void;
  autoComplete?: string;
  dataTestId?: string;
  showAsteric?: boolean;
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
      ...props
    },
    ref,
  ) => {
    return (
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          alignItems: "flex-start",
          width: "100%",
        }}
      >
        {label && (
          <label style={{ marginBottom: 4, fontSize: "12px" }} htmlFor={id}>
            {label}
            {showAsteric && (
              <span style={{ color: "red", marginLeft: 2 }}>*</span>
            )}
          </label>
        )}
        <input
          ref={ref}
          id={id}
          aria-label={label}
          style={{
            marginBottom: 5,
            width: "100%",
            height: "2.5rem",
            paddingLeft: "10px",
            border: "hsla(220, 35%, 3%, 0.4)",
            fontSize: "12px",
          }}
          value={value}
          onChange={onChange}
          autoComplete={autoComplete}
          data-testid={dataTestId}
          {...props}
        />
      </div>
    );
  },
);

export default Input;
