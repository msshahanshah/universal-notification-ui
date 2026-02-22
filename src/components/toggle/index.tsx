import { useTheme } from "@mui/material";
import COLORS from "src/utility/colors";

type ToggleOption<T extends string> = {
  label: string;
  value: T;
};

type ToggleProps<T extends string> = {
  value: T;
  options: ToggleOption<T>[];
  onChange: (value: T) => void;
};

export function Toggle<T extends string>({
  value,
  options,
  onChange,
}: ToggleProps<T>) {
  const theme = useTheme();
  return (
    <div style={toggleContainer}>
      {options.map((opt) => (
        <button
          key={opt.value}
          onClick={() => onChange(opt.value)}
          style={{
            ...toggleButton,
            ...(value === opt.value ? activeButton : {}),
            backgroundColor: theme.vars?.palette.primary.dark,
            color: theme.vars?.palette.primary.contrastText,
          }}
        >
          {opt.label}
        </button>
      ))}
    </div>
  );
}

const toggleContainer: React.CSSProperties = {
  display: "inline-flex",
  width: "fit-content",
  borderRadius: 6,
  overflow: "hidden",
  border: "1px solid #ddd",
  cursor: "pointer",
};

const toggleButton: React.CSSProperties = {
  padding: "6px 12px",
  cursor: "pointer",
  border: "none",
  backgroundColor: (theme) => theme.vars?.palette.background.paper,
  fontSize: 14,
};

const activeButton: React.CSSProperties = {
  backgroundColor: (theme) => theme.vars?.palette.primary.main,
  color: COLORS.WHITE,
  fontWeight: "bold",
  fontSize: 14,
};
