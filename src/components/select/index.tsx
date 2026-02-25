import { useEffect, useRef, useState } from "react";

import "./select.css";

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
};

export function Select({
  value,
  onChange,
  options,
  placeholder = "Select option",
  dataTestId,
  multiple = false,
}: Props) {
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
      return options
        .filter((opt) => value.includes(opt.value))
        .map((opt) => opt.label)
        .join(", ");
    }

    const selected = options.find((opt) => opt.value === value);
    return selected?.label || placeholder;
  };

  const selectedOption = options.find((opt) => opt.value === value);

  return (
    <div className="country-select" data-testid={dataTestId} ref={containerRef}>
      <button
        type="button"
        className="country-select-btn"
        onClick={() => setOpen((prev) => !prev)}
        aria-haspopup="listbox"
      >
        {getDisplayValue()}
        <span className="caret">▼</span>
      </button>

      {open && (
        <div className="country-select-list" role="listbox">
          {options.map((option) => {
            const selected = isSelected(option.value);

            return (
              <div
                key={option.value}
                role="option"
                className={
                  selected ? "select-option selected" : "select-option"
                }
                onClick={() => handleSelect(option.value)}
                style={{ display: "flex", alignItems: "center" }}
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
