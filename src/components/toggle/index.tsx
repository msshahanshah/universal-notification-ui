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
  return (
    <div style={toggleContainer}>
      {options.map((opt) => (
        <button
          key={opt.value}
          onClick={() => onChange(opt.value)}
          style={{
            ...toggleButton,
            ...(value === opt.value ? activeButton : {}),
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
  backgroundColor: "#121212",
  fontSize: 14,
};

const activeButton: React.CSSProperties = {
  backgroundColor: "hsla(220, 80%, 55%, 0.25)",
  color: "#fff",
  fontWeight: "bold",
  fontSize: 14,
};
