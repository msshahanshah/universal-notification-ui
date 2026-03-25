import { ButtonHTMLAttributes } from "react";
import Loader from "./loader";
import "./button.css";

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  label: string;
  className?: string;
  isLoading?: boolean;
  style?: React.CSSProperties;
}

const Button = ({
  label,
  className,
  isLoading,
  style,
  ...props
}: ButtonProps) => {
  return (
    <button
      {...props}
      className={className}
      style={{ marginBottom: 5, ...style }}
    >
      {isLoading ? (
        <div className="button-container">
          <div className="label">{label}</div>
          <div style={{ marginLeft: 10 }}>
            <Loader size={20} />
          </div>
        </div>
      ) : (
        <div className="button-container">
          <div className="label">{label}</div>
        </div>
      )}
    </button>
  );
};

export default Button;
