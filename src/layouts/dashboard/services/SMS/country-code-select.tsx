import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { useTheme } from "@mui/material/styles";

import { COUNTRY_CODES } from "./country-codes";
import "./sms-composer.css";

type Props = {
  value: string;
  onChange: (code: string) => void;
  onOpen?: () => void;
  onClose?: () => void;
};

export function CountryCodeSelect({ value, onChange, onOpen, onClose }: Props) {
  const [open, setOpen] = useState(false);
  const [dropdownPos, setDropdownPos] = useState({ top: 0, left: 0, width: 0 });
  const containerRef = useRef<HTMLDivElement>(null);
  const buttonRef = useRef<HTMLButtonElement>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const theme = useTheme();

  const updateDropdownPos = () => {
    if (buttonRef.current) {
      const rect = buttonRef.current.getBoundingClientRect();
      // Use getBoundingClientRect which already accounts for scroll position
      setDropdownPos({
        top: rect.bottom + 4, // No need to add scrollY, getBoundingClientRect is relative to viewport
        left: rect.left, // No need to add scrollX
        width: rect.width, // Match button width
      });
    }
  };

  const openDropdown = () => {
    updateDropdownPos();
    setOpen(true);
    onOpen?.();
  };

  const closeDropdown = () => {
    setOpen(false);
    onClose?.();
  };

  const toggleDropdown = () => {
    if (open) closeDropdown();
    else openDropdown();
  };

  useEffect(() => {
    const onEsc = (e: KeyboardEvent) => {
      if (e.key === "Escape") closeDropdown();
    };

    const handleClickOutside = (e: MouseEvent) => {
      const target = e.target as Node;
      if (
        containerRef.current &&
        !containerRef.current.contains(target) &&
        !buttonRef.current?.contains(target) &&
        !dropdownRef.current?.contains(target)
      ) {
        closeDropdown();
      }
    };

    const handleScroll = () => {
      if (open) {
        updateDropdownPos();
      }
    };

    const handleResize = () => {
      if (open) {
        updateDropdownPos();
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    document.addEventListener("keydown", onEsc);
    window.addEventListener("scroll", handleScroll, true);
    window.addEventListener("resize", handleResize);

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      document.removeEventListener("keydown", onEsc);
      window.removeEventListener("scroll", handleScroll, true);
      window.removeEventListener("resize", handleResize);
    };
  }, [open]);

  return (
    <div
      className="country-select"
      data-testid="country-code-select"
      ref={containerRef}
    >
      <button
        type="button"
        className="country-select-btn"
        ref={buttonRef}
        onClick={toggleDropdown}
        aria-haspopup="listbox"
        // style={{ background: theme.vars?.palette.background.paper }}
      >
        {value}
        <span className="caret">▼</span>
      </button>

      {open &&
        createPortal(
          <div
            ref={dropdownRef}
            className="country-select-list"
            role="listbox"
            style={{
              position: "fixed",
              top: `${dropdownPos.top}px`,
              left: `${dropdownPos.left}px`,
              color: theme.vars?.palette.text.secondary,
              backgroundColor: theme.vars?.palette.background.paper,
              border: `1px solid ${theme.vars?.palette.divider}`,
              zIndex: 9999,
            }}
          >
            {" "}
            {COUNTRY_CODES.map((c) => {
              const selectedValue = c.code === value;
              return (
                <div
                  key={c.code}
                  role="option"
                  data-testid={`country-option-${c.iso}`}
                  onClick={() => {
                    onChange(c.code);
                    closeDropdown();
                  }}
                  className={
                    selectedValue
                      ? "item-active"
                      : "item-inactive"
                  }
                  style={{
                    backgroundColor: selectedValue
                      ? theme.vars?.palette.background.default
                      : "transparent",
                  }}
                >
                  {" "}
                  {c.country} ({c.code}){" "}
                </div>
              );
            })}{" "}
          </div>,
          document.body,
        )}
    </div>
  );
}
