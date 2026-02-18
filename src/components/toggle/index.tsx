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
      {options.map((opt) => {
        const isActive = value === opt.value;
        return (
          <button
            key={opt.value}
            onClick={() => onChange(opt.value)}
            style={{
              padding: "6px 12px",
              cursor: "pointer",
              border: "none",
              fontSize: 14,
              transition: "0.2s ease",
              backgroundColor: isActive
                ? theme.palette.primary.main
                : theme.palette.background.paper,
              color: isActive
                ? theme.palette.primary.contrastText
                : theme.palette.text.secondary,
              fontWeight: isActive ? "bold" : 500,
            }}
          >
            {opt.label}
          </button>
        );
      })}
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
