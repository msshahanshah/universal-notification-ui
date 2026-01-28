import { ButtonHTMLAttributes } from "react";
import Loader from "./loader";
import "./button.css";

// TODO: move types to different folder
interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  label: string;
  className?: string;
  isLoading?: boolean;
}

const Button = ({ label, className, isLoading, ...props }: ButtonProps) => {
  return (
    <button {...props} style={{ marginBottom: 5 }} className={className}>
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
