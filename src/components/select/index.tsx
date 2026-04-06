import { useEffect, useRef, useState } from "react";
import { useTheme } from "@mui/material/styles";

import "./select.css";
import "@/components/index.css";

type Option = {
  label: string;
  value: string;
};

type Props = {
  value: string | string[];
  onChange: (value: string | string[]) => void;
  options: Option[];
  placeholder?: string;
  dataTestId?: string;
  multiple?: boolean;
  style?: object;
  dropdownStyle?: object;
};

export function Select({
  value,
  onChange,
  options,
  placeholder = "Select option",
  dataTestId,
  multiple = false,
  style,
  dropdownStyle,
}: Props) {
  const theme = useTheme();
  const [open, setOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const onEsc = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };

    const handleClickOutside = (e: MouseEvent) => {
      if (
        containerRef.current &&
        !containerRef.current.contains(e.target as Node)
      ) {
        setOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    document.addEventListener("keydown", onEsc);

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      document.removeEventListener("keydown", onEsc);
    };
  }, []);

  const isSelected = (val: string) => {
    if (multiple && Array.isArray(value)) {
      return value.includes(val);
    }
    console.log("value", value, "val", val);
    return value === val;
  };

  const handleSelect = (val: string) => {
    if (multiple) {
      const current = Array.isArray(value) ? value : [];

      if (current.includes(val)) {
        onChange(current.filter((v) => v !== val));
      } else {
        onChange([...current, val]);
      }
    } else {
      onChange(val);
      setOpen(false);
    }
  };

  const getDisplayValue = () => {
    if (multiple && Array.isArray(value)) {
      if (!value.length) return placeholder;
      return null; // Will render chips instead
    }

    const selected = options.find((opt) => opt.value === value);
    return selected?.label || placeholder;
  };

  const getSelectedLabels = () => {
    if (multiple && Array.isArray(value)) {
      return options
        .filter((opt) => value.includes(opt.value))
        .map((opt) => opt.label);
    }
    return [];
  };

  const handleRemoveChip = (e: React.MouseEvent, val: string) => {
    e.stopPropagation();
    if (multiple && Array.isArray(value)) {
      onChange(value.filter((v) => v !== val));
    }
  };

  return (
    <div
      className="common-select"
      style={style}
      data-testid={dataTestId}
      ref={containerRef}
    >
      <button
        type="button"
        className="country-select-btn"
        onClick={() => setOpen((prev) => !prev)}
        aria-haspopup="listbox"
        style={{
          display: "flex",
          alignItems: "center",
          flexWrap: "wrap",
          gap: "6px",
          minHeight: "2.5rem",
          paddingTop: "0px",
          justifyContent: "space-between",
        }}
      >
        {multiple && Array.isArray(value) && value.length > 0 ? (
          <>
            {getSelectedLabels().map((label) => (
              <span
                key={label}
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  gap: "6px",
                  backgroundColor: "rgba(255, 255, 255, 0.15)",
                  padding: "4px 8px",
                  borderRadius: "4px",
                  fontSize: "12px",
                  whiteSpace: "nowrap",
                }}
              >
                {label}
                <button
                  type="button"
                  onClick={(e) => {
                    const valueToRemove = options.find(
                      (opt) => opt.label === label,
                    )?.value;
                    if (valueToRemove) handleRemoveChip(e, valueToRemove);
                  }}
                  style={{
                    background: "none",
                    border: "none",
                    color: "#fff",
                    cursor: "pointer",
                    padding: "0",
                    display: "flex",
                    alignItems: "center",
                    fontSize: "14px",
                  }}
                >
                  ✕
                </button>
              </span>
            ))}
            <span className="caret" style={{ marginLeft: "auto" }}>
              ▼
            </span>
          </>
        ) : (
          <>
            {getDisplayValue()}
            <span className="caret">▼</span>
          </>
        )}
      </button>

      {open && (
        <div
          className="select-list"
          role="listbox"
          style={{
            backgroundColor: theme.vars?.palette.background.paper,
            border: `1px solid ${theme.vars?.palette.divider}`,
            zIndex: 9999,
            ...dropdownStyle,
          }}
        >
          {options.map((option) => {
            const selected = isSelected(option.value);

            return (
              <div
                key={option.value}
                role="option"
                className={selected ? "item-active" : "item-inactive"}
                onClick={() => handleSelect(option.value)}
                style={{
                  display: "flex",
                  alignItems: "center",
                  padding: 10,
                  color: selected
                    ? "hsl(210, 98%, 48%)"
                    : theme.vars?.palette.text.secondary,
                  backgroundColor: selected
                    ? theme.vars?.palette.background.default
                    : "transparent",
                }}
              >
                {multiple && (
                  <input type="checkbox" checked={selected} readOnly />
                )}
                {option.label}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
