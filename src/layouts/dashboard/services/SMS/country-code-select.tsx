import { useEffect, useRef, useState } from "react";

import { COUNTRY_CODES } from "./country-codes";
import './sms-composer.css'
import { useTheme } from "@mui/material/styles";

type Props = {
  value: string;
  onChange: (code: string) => void;
};

export function CountryCodeSelect({ value, onChange }: Props) {
  const [open, setOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  const theme = useTheme()

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

  return (
    <div className="country-select" data-testid="country-code-select" ref={containerRef}>
      <button
        type="button"
        className="country-select-btn"
        onClick={() => setOpen(!open)}
        aria-haspopup="listbox"
      >
        {value}
        <span className="caret">▼</span>
      </button>

      {open && (
        <div className="country-select-list" role="listbox" style={{color: theme.palette.text.secondary , backgroundColor: theme.palette.background.defaultBg}}>
          {COUNTRY_CODES.map((c) => {

            const selectedValue=c.code===value;
            return <div
              key={c.code}
              role="option"
              onClick={() => {
                onChange(c.code);
                setOpen(false);
              }}
              data-testid={`country-option-${c.iso}`}
              className={selectedValue?"country-code-selected":"country-code-option"}
            >
              {c.country} ({c.code})
            </div>
})}
        </div>
      )}
    </div>
  );
}
