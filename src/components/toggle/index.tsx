import { useTheme } from "@mui/material";

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
            backgroundColor: theme.palette.primary.dark,
            color: theme.palette.primary.contrastText,
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
  backgroundColor: (theme) => theme.palette.background.paper,
  fontSize: 14,
};

const activeButton: React.CSSProperties = {
  backgroundColor: (theme) => theme.palette.primary.main,
  color: "#fff",
  fontWeight: "bold",
  fontSize: 14,
};
