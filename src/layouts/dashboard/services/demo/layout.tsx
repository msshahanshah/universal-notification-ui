import { useEffect, useLayoutEffect, useRef, useState } from "react";
import { Mail, Slack, MessageSquare } from "lucide-react";

const services = [
  { key: "slack", label: "Slack", icon: Slack },
  { key: "email", label: "Email", icon: Mail },
  { key: "sms", label: "SMS", icon: MessageSquare },
];

export default function ServicesLayout() {
  const [activeIndex, setActiveIndex] = useState(1);
  const [connector, setConnector] = useState({ top: 0, left: 0, width: 0 });

  const activeRef = useRef<HTMLDivElement | null>(null);
  const contentRef = useRef<HTMLDivElement | null>(null);

  /* Keyboard navigation */
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === "ArrowDown") {
        setActiveIndex((i) => Math.min(i + 1, services.length - 1));
      }
      if (e.key === "ArrowUp") {
        setActiveIndex((i) => Math.max(i - 1, 0));
      }
    };

    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, []);

  /* Measure connector */
  useLayoutEffect(() => {
    if (!activeRef.current || !contentRef.current) return;

    const activeRect = activeRef.current.getBoundingClientRect();
    const contentRect = contentRef.current.getBoundingClientRect();

    const top = activeRect.top + activeRect.height / 2;
    const left = activeRect.right;
    const width = contentRect.left - activeRect.right;

    setConnector({ top, left, width });
  }, [activeIndex]);

  const activeService = services[activeIndex];

  return (
    <div style={styles.wrapper}>
      {/* LEFT RAIL */}
      <div style={styles.sidebar}>
        {services.map((service, index) => {
          const Icon = service.icon;
          const isActive = index === activeIndex;

          return (
            <div
              key={service.key}
              ref={isActive ? activeRef : null}
              onClick={() => setActiveIndex(index)}
              tabIndex={0}
              style={{
                ...styles.item,
                ...(isActive ? styles.activeItem : styles.inactiveItem),
              }}
            >
              <Icon size={18} />
              {isActive && <span>{service.label}</span>}
            </div>
          );
        })}
      </div>

      {/* CONNECTOR */}
      <div
        style={{
          ...styles.connector,
          top: connector.top,
          left: connector.left,
          width: connector.width,
        }}
      />

      {/* RIGHT CONTENT */}
      <div
        ref={contentRef}
        style={{
          ...styles.content,
          minWidth: activeRef.current?.offsetWidth
            ? activeRef.current.offsetWidth * 2
            : 420,
        }}
      >
        <h2 style={styles.title}>{activeService.label}</h2>
        <p style={styles.description}>
          Send transactional {activeService.label.toLowerCase()} messages.
        </p>
      </div>
    </div>
  );
}

const styles: Record<string, React.CSSProperties> = {
  wrapper: {
    position: "relative",
    display: "grid",
    gridTemplateColumns: "auto auto",
    gap: 64,
    padding: 24,
    height: "100vh",
    alignItems: "start",
  },

  sidebar: {
    zIndex: 3,
    display: "flex",
    flexDirection: "column",
    gap: 16,
  },

  item: {
    height: 48,
    borderRadius: 14,
    display: "flex",
    alignItems: "center",
    gap: 12,
    padding: "0 16px",
    cursor: "pointer",
    color: "#fff",
    transition: "all 250ms ease",
  },

  activeItem: {
    width: 180,
    background: "linear-gradient(135deg, #0b3c5d, #051c2c)",
    boxShadow: "0 8px 24px hsla(220, 35%, 3%, 0.4)",
    border: "1px solid rgba(0,210,255,0.35)",
  },

  inactiveItem: {
    width: 48,
    justifyContent: "center",
    opacity: 0.35,
    background: "rgba(255,255,255,0.03)",
  },

  connector: {
    position: "fixed",
    height: 1,
    background:
      "linear-gradient(90deg, rgba(0,210,255,0.8), rgba(0,210,255,0))",
    boxShadow: "0 0 8px rgba(0,210,255,0.6)",
    transform: "translateY(-50%)",
    transition: "all 250ms ease",
    zIndex: 2,
    pointerEvents: "none",
  },

  content: {
    zIndex: 1,
    padding: 32,
    borderRadius: 24,
    background: "rgba(255,255,255,0.03)",
    border: "1px solid rgba(255,255,255,0.08)",
    boxShadow: "0 16px 40px hsla(220, 35%, 3%, 0.4)",
  },

  title: {
    margin: 0,
    fontSize: 28,
  },

  description: {
    marginTop: 12,
    opacity: 0.8,
  },
};
