import { useState } from "react";
import { Mail, Slack as SlackIcon, MessageSquare } from "lucide-react";
import SMS from "../SMS";
import EmailComposer from "../email";
import Slack from "../slack";

type ServiceKey = "slack" | "email" | "sms";

interface Service {
  key: ServiceKey;
  label: string;
  icon: React.ComponentType<{ size?: number; className?: string }>;
  description: string;
  status: "healthy" | "unhealthy" | "pending";
}

const services: Service[] = [
  {
    key: "slack",
    label: "Slack",
    icon: SlackIcon,
    description: "Send messages to Slack channels",
    status: "healthy",
  },
  {
    key: "email",
    label: "Email",
    icon: Mail,
    description: "Send transactional emails",
    status: "healthy",
  },
  {
    key: "sms",
    label: "SMS",
    icon: MessageSquare,
    description: "Send SMS notifications",
    status: "healthy",
  },
];

export default function ServicesAccordion() {
  const [activeService, setActiveService] = useState<ServiceKey>("slack");
  const [toggles, setToggles] = useState<Record<ServiceKey, boolean>>({
    slack: true,
    email: true,
    sms: true,
  });

  const handleToggle = (service: ServiceKey) => {
    setToggles((prev) => ({ ...prev, [service]: !prev[service] }));
  };

  const renderServiceContent = () => {
    switch (activeService) {
      case "slack":
        return <Slack />;
      case "email":
        return <EmailComposer />;
      case "sms":
        return <SMS />;
      default:
        return null;
    }
  };

  const getStatusColor = (status: Service["status"]) => {
    switch (status) {
      case "healthy":
        return "#10b981";
      case "unhealthy":
        return "#ef4444";
      case "pending":
        return "#f59e0b";
      default:
        return "#6b7280";
    }
  };

  return (
    <div style={styles.wrapper}>
      {/* LEFT SIDEBAR - Services List */}
      <div style={styles.sidebar}>
        <div style={styles.sidebarHeader}>
          <h3 style={styles.sidebarTitle}>Services</h3>
        </div>

        <div style={styles.servicesList}>
          {services.map((service) => {
            const Icon = service.icon;
            const isActive = activeService === service.key;
            const isEnabled = toggles[service.key];

            return (
              <div
                key={service.key}
                onClick={() => setActiveService(service.key)}
                style={{
                  ...styles.serviceCard,
                  ...(isActive ? styles.activeServiceCard : {}),
                  //   ...(isEnabled ? {} : styles.disabledServiceCard),
                }}
              >
                <div style={styles.serviceHeader}>
                  <div style={styles.serviceInfo}>
                    <Icon size={20} className="service-icon" />
                    <div>
                      <div style={styles.serviceLabel}>{service.label}</div>
                      <div style={styles.serviceDescription}>{service.description}</div>
                    </div>
                  </div>
                  
                  <div style={styles.serviceStatus}>
                    <div 
                      style={{
                        ...styles.statusDot,
                        backgroundColor: getStatusColor(service.status),
                      }}
                    />
                    <span style={styles.statusText}>{service.status}</span>
                  </div>
                </div>
                
                <div style={styles.serviceActions}>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleToggle(service.key);
                    }}
                    style={{
                      ...styles.toggleButton,
                      backgroundColor: isEnabled ? '#10b981' : '#374151',
                    }}
                  >
                    <div style={{
                      ...styles.toggleSlider,
                      transform: isEnabled ? 'translateX(20px)' : 'translateX(2px)',
                    }} />
                  </button>
                  
                  {/* <Button
                    label="Send"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleSend(service.key);
                    }}
                    disabled={!isEnabled}
                    style={{
                      ...styles.sendButton,
                      opacity: isEnabled ? 1 : 0.5,
                      cursor: isEnabled ? 'pointer' : 'not-allowed',
                    }}
                  /> */}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* RIGHT CONTENT - Active Service Details */}
      <div style={styles.content}>
        <div style={styles.contentHeader}>
          <div style={styles.contentTitle}>
            {services.find(s => s.key === activeService)?.label}
          </div>
          <div style={styles.contentDescription}>
            {services.find(s => s.key === activeService)?.description}
          </div>
        </div>
        
        <div style={styles.contentBody}>
          {renderServiceContent()}
        </div>
      </div>
    </div>
  );
}

const styles: Record<string, React.CSSProperties> = {
  wrapper: {
    display: "flex",
    height: "100vh",
    backgroundColor: "#0a0e1a",
    color: "#ffffff",
    overflow: "hidden",
  },

  sidebar: {
    width: 320,
    backgroundColor: "rgba(255, 255, 255, 0.02)",
    borderRight: "1px solid rgba(255, 255, 255, 0.08)",
    display: "flex",
    flexDirection: "column",
    overflowY: "auto",
  },

  sidebarHeader: {
    padding: "24px 20px 20px",
    borderBottom: "1px solid rgba(255, 255, 255, 0.08)",
  },

  sidebarTitle: {
    margin: 0,
    fontSize: "18px",
    fontWeight: 600,
    color: "#ffffff",
  },

  servicesList: {
    padding: "16px",
    display: "flex",
    flexDirection: "column",
    gap: "12px",
  },

  serviceCard: {
    backgroundColor: "rgba(255, 255, 255, 0.04)",
    border: ".5px solid transparent",
    borderRadius: "12px",
    padding: "16px",
    cursor: "pointer",
    transition: "all 0.2s ease",
    position: "relative",
    opacity: .5
  },

  activeServiceCard: {
    backgroundColor: "rgb(10, 14, 26)",
    borderColor: "rgba(0, 210, 255, 0.4)",
    boxShadow: "0 0 20px rgba(0, 210, 255, 0.2)",
    border: "1px solid rgba(255, 255, 255, 0.08)",
    opacity: 1
  },

  disabledServiceCard: {
    opacity: 0.6,
  },

  serviceHeader: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: "12px",
  },

  serviceInfo: {
    display: "flex",
    alignItems: "flex-start",
    gap: "12px",
    flex: 1,
  },

  serviceIcon: {
    color: "#60a5fa",
    flexShrink: 0,
    marginTop: "2px",
  },

  serviceLabel: {
    fontSize: "16px",
    fontWeight: 600,
    marginBottom: "4px",
  },

  serviceDescription: {
    fontSize: "13px",
    color: "rgba(255, 255, 255, 0.6)",
    lineHeight: "1.4",
  },

  serviceStatus: {
    display: "flex",
    alignItems: "center",
    gap: "6px",
  },

  statusDot: {
    width: "8px",
    height: "8px",
    borderRadius: "50%",
    flexShrink: 0,
  },

  statusText: {
    fontSize: "12px",
    textTransform: "capitalize",
    color: "rgba(255, 255, 255, 0.8)",
  },

  serviceActions: {
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    gap: "12px",
  },

  toggleButton: {
    width: "44px",
    height: "24px",
    borderRadius: "12px",
    border: "none",
    cursor: "pointer",
    position: "relative",
    transition: "background-color 0.2s ease",
    outline: "none",
  },

  toggleSlider: {
    position: "absolute",
    top: "2px",
    left: "2px",
    width: "20px",
    height: "20px",
    backgroundColor: "#ffffff",
    borderRadius: "50%",
    transition: "transform 0.2s ease",
    boxShadow: "0 2px 4px rgba(0, 0, 0, 0.2)",
  },

  sendButton: {
    padding: "6px 16px",
    fontSize: "13px",
    borderRadius: "6px",
    border: "1px solid rgba(0, 210, 255, 0.4)",
    backgroundColor: "transparent",
    color: "#60a5fa",
    cursor: "pointer",
    transition: "all 0.2s ease",
  },

  content: {
    flex: 1,
    display: "flex",
    flexDirection: "column",
    overflow: "hidden",
    backgroundColor: "#0a0e1a",
  },

  contentHeader: {
    padding: "24px 32px 20px",
    borderBottom: "1px solid rgba(255, 255, 255, 0.08)",
  },

  contentTitle: {
    fontSize: "28px",
    fontWeight: 700,
    marginBottom: "8px",
    background: "linear-gradient(135deg, #60a5fa, #0ea5e9)",
    WebkitBackgroundClip: "text",
    WebkitTextFillColor: "transparent",
    backgroundClip: "text",
  },

  contentDescription: {
    fontSize: "16px",
    color: "rgba(255, 255, 255, 0.6)",
  },

  contentBody: {
    flex: 1,
    overflowY: "auto",
    padding: "24px 32px",
  },
};

// Add CSS for the service icon
const styleSheet = document.createElement("style");
styleSheet.textContent = `
  .service-icon {
    color: rgb(79, 195, 247);
    flex-shrink: 0;
    margin-top: 2px;
  }
`;
if (typeof document !== "undefined") {
  document.head.appendChild(styleSheet);
}
