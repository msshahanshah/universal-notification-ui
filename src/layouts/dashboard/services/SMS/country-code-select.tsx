// import { useEffect, useRef, useState } from "react";

// import { COUNTRY_CODES } from "./country-codes";
// import "./sms-composer.css";

// type Props = {
//   value: string;
//   onChange: (code: string) => void;
// };

// export function CountryCodeSelect({ value, onChange }: Props) {
//   const [open, setOpen] = useState(false);
//   const containerRef = useRef<HTMLDivElement>(null);

//   useEffect(() => {
//     const onEsc = (e: KeyboardEvent) => {
//       if (e.key === "Escape") setOpen(false);
//     };

//     const handleClickOutside = (e: MouseEvent) => {
//       if (
//         containerRef.current &&
//         !containerRef.current.contains(e.target as Node)
//       ) {
//         setOpen(false);
//       }
//     };

//     document.addEventListener("mousedown", handleClickOutside);
//     document.addEventListener("keydown", onEsc);
//     return () => {
//       document.removeEventListener("mousedown", handleClickOutside);
//       document.removeEventListener("keydown", onEsc);
//     };
//   }, []);

//   return (
//     <div
//       className="country-select"
//       data-testid="country-code-select"
//       ref={containerRef}
//     >
//       <button
//         type="button"
//         className="country-select-btn"
//         onClick={() => setOpen(!open)}
//         aria-haspopup="listbox"
//       >
//         {value}
//         <span className="caret">▼</span>
//       </button>

//       {open && (
//         <div className="country-select-list" role="listbox">
//           {COUNTRY_CODES.map((c) => {
//             const selectedValue = c.code === value;
//             return (
//               <div
//                 key={c.code}
//                 role="option"
//                 onClick={() => {
//                   onChange(c.code);
//                   setOpen(false);
//                 }}
//                 data-testid={`country-option-${c.iso}`}
//                 className={
//                   selectedValue
//                     ? "country-code-selected"
//                     : "country-code-option"
//                 }
//               >
//                 {c.country} ({c.code})
//               </div>
//             );
//           })}
//         </div>
//       )}
//     </div>
//   );
// }

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
  const [dropdownPos, setDropdownPos] = useState({ top: 0, left: 0 });
  const containerRef = useRef<HTMLDivElement>(null);
  const buttonRef = useRef<HTMLButtonElement>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const theme = useTheme();

  const updateDropdownPos = () => {
    if (buttonRef.current) {
      const rect = buttonRef.current.getBoundingClientRect();
      setDropdownPos({
        top: rect.bottom + window.scrollY + 8,
        left: rect.left + window.scrollX,
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

    document.addEventListener("mousedown", handleClickOutside);
    document.addEventListener("keydown", onEsc);
    window.addEventListener("scroll", handleScroll, true);

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      document.removeEventListener("keydown", onEsc);
      window.removeEventListener("scroll", handleScroll, true);
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
              top: `${dropdownPos.top}px`,
              left: `${dropdownPos.left}px`,
              color: theme.vars?.palette.text.secondary,
              border: `1px solid ${theme.vars?.palette.divider}`,
              width: "40%",
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
                    ? "country-code-selected"
                    : "country-code-option"
                }
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