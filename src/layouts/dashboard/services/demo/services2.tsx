import { useState } from "react";
import { Mail, MessageSquare, Slack } from "lucide-react";

const services = [
  { key: "slack", label: "Slack", icon: Slack },
  { key: "email", label: "Email", icon: Mail },
  { key: "sms", label: "SMS", icon: MessageSquare },
];


export default function ServicesSidebar() {
  const [active, setActive] = useState("slack");

  return (
    <div style={styles.sidebar}>
      {services.map((service) => {
        const Icon = service.icon;
        const isActive = active === service.key;

        return (
          <div
            key={service.key}
            onClick={() => setActive(service.key)}
            style={{
              ...styles.item,
              ...(isActive ? styles.activeItem : styles.inactiveItem),
            }}
          >
            <Icon size={20} />

            {/* Label only for active */}
            <span
              style={{
                ...styles.label,
                opacity: isActive ? 1 : 0,
                width: isActive ? "auto" : 0,
              }}
            >
              {service.label}
            </span>
          </div>
        );
      })}
    </div>
  );
}

const styles: Record<string, React.CSSProperties> = {
  sidebar: {
    width: 80,
    display: "flex",
    flexDirection: "column",
    gap: 14,
    padding: "16px 12px",
  },

  item: {
    display: "flex",
    alignItems: "center",
    gap: 12,
    height: 48,
    padding: "0 14px",
    borderRadius: 14,
    cursor: "pointer",
    transition: "all 0.3s ease",
    overflow: "hidden",
    whiteSpace: "nowrap",
  },

  activeItem: {
    width: 200,
    background: "linear-gradient(135deg, #0b3c5d, #051c2c)",
    color: "#fff",
    boxShadow: "0 8px 24px hsla(220, 35%, 3%, 0.4)",
    border: "1px solid rgba(0,210,255,0.35)",
  },

  inactiveItem: {
    width: 100,
    justifyContent: "center",
    background: "rgba(255,255,255,0.03)",
    color: "rgba(255,255,255,0.55)",
    border: "1px solid rgba(255,255,255,0.06)",
  },

  label: {
    fontSize: 14,
    fontWeight: 500,
    transition: "all 0.25s ease",
  },
};