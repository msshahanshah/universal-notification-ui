import { ChangeEvent, forwardRef, InputHTMLAttributes } from "react";

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  value: string | number;
  id: string;
  onChange: (e: ChangeEvent<HTMLInputElement>) => void;
  autoComplete?: string;
}

const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ label, value, id, onChange, autoComplete, ...props }, ref) => {
    return (
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          alignItems: "flex-start",
        }}
      >
        {label && (
          <label style={{ marginBottom: 4 }} htmlFor={id}>
            {label}
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
          }}
          value={value}
          onChange={onChange}
          autoComplete={autoComplete}
          {...props}
        />
      </div>
    );
  },
);

export default Input;
