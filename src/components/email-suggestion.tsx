import { useEffect, useRef, useState } from "react";
import { GKMIT_EMAILS } from "src/emails/constant";
import Input from "./input";

type Props = {
  value: string;
  onChange: (val: string) => void;
  placeholder?: string;
};

const styles = {
  input: {
    width: "100%",
    fontSize: 12,
    height: "2.5rem",
    paddingLeft: 10,
  },
  dropdown: {
    position: "absolute" as const,
    top: "100%",
    left: 0,
    right: 0,
    background: "#fff",
    border: "1px solid #dadce0",
    borderRadius: 6,
    boxShadow: "0 4px 12px rgba(0,0,0,0.15)",
    zIndex: 10,
    maxHeight: 180,
    overflowY: "auto" as const,
  },
  item: {
    padding: "8px 12px",
    cursor: "pointer",
    fontSize: 12,
    color: "black",
  },
};

export function EmailSuggestion({ value, onChange, placeholder }: Props) {
  const containerRef = useRef<HTMLDivElement>(null);

  const [showList, setShowList] = useState(false);
  const [query, setQuery] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const onEsc = (e: KeyboardEvent) => {
      if (e.key === "Escape") setShowList(false);
    };

    const handleClickOutside = (e: MouseEvent) => {
      if (
        containerRef.current &&
        !containerRef.current.contains(e.target as Node)
      ) {
        setShowList(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    document.addEventListener("keydown", onEsc);    
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      document.removeEventListener("keydown", onEsc);
    };
  }, []);

  const filteredEmails = GKMIT_EMAILS.filter((email) =>
    email.toLowerCase().includes(query.toLowerCase()),
  );

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    onChange(val);

    const lastAt = val.lastIndexOf("@");
    if (lastAt !== -1) {
      setQuery(val.slice(lastAt + 1));
      setShowList(true);
    } else {
      setShowList(false);
    }
  };

  const selectEmail = (email: string) => {
    const text = value;
    const lastAt = text.lastIndexOf("@");

    const updated = text.slice(0, lastAt) + email + ", ";

    onChange(updated);
    setShowList(false);
    inputRef.current?.focus();
  };

  return (
    <div style={{ position: "relative", width: "100%" }} ref={containerRef}>
      <Input
        ref={inputRef}
        value={value}
        onChange={handleChange}
        placeholder={placeholder}
        style={styles.input}
        id="to"
      />

      {showList && filteredEmails.length > 0 && (
        <div style={styles.dropdown}>
          {filteredEmails.map((email) => (
            <div
              key={email}
              style={styles.item}
              onClick={() => selectEmail(email)}
            >
              {email}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
