// Remove if not needed!

import { useState } from "react";
import SMS from "../SMS";
import EmailComposer from "../email";
import Slack from "../slack";

type ServiceKey = "slack" | "email" | "sms";

const services = [
  { key: "slack", label: "Slack" },
  { key: "email", label: "Email" },
  { key: "sms", label: "SMS" },
  { key: "slacka", label: "Slack" },
  { key: "emaialaa", label: "Email" },
  { key: "smsaaaa", label: "SMS" },
  { key: "slacaaaaka", label: "Slack" },
  { key: "emaiala", label: "Email" },
  { key: "smsa", label: "SMS" },
];

export default function ServicesLayout() {
  const [activeService, setActiveService] = useState<any>("slack");

  const SlackContent = () => <Slack />;

  const EmailContent = () => <EmailComposer />;

  const SmsContent = () => <SMS />;

  return (
    <div style={styles.wrapper}>
      {/* LEFT */}
      <div style={styles.sidebar}>
        {" "}
        {services.map((service) => (
          <div
            key={service.key}
            onClick={() => setActiveService(service.key as ServiceKey)}
            style={{
              ...styles.card,
              ...(activeService === service.key ? styles.activeCard : {}),
            }}
          >
            {service.label}

            {activeService === service.key && <span style={styles.connector} />}
          </div>
        ))}
      </div>

      {/* RIGHT */}
      <div style={styles.content}>
        {activeService === "slack" && <SlackContent />}
        {activeService === "email" && <EmailContent />}
        {activeService === "sms" && <SmsContent />}
        {activeService === "slacka" && <SlackContent />}
        {activeService === "emaila" && <EmailContent />}
        {activeService === "smsa" && <SmsContent />}
        {activeService === "slackaa" && <SlackContent />}
        {activeService === "emailaa" && <EmailContent />}
        {activeService === "smsaa" && <SmsContent />}
        {activeService === "slackaa" && <SlackContent />}
        {activeService === "emaiala" && <EmailContent />}
        {activeService === "smsaa" && <SmsContent />}
        {activeService === "slackaa" && <SlackContent />}
        {activeService === "emaaila" && <EmailContent />}
        {activeService === "smsaaa" && <SmsContent />}
        {activeService === "emaaiaaa" && <EmailContent />}
        {activeService === "smsaaaa" && <SmsContent />}
        {activeService === "slackaaa" && <SlackContent />}
        {activeService === "emaiaaala" && <EmailContent />}
        {activeService === "smsaaaa" && <SmsContent />}
        {activeService === "slackaaa" && <SlackContent />}
        {activeService === "emaaiala" && <EmailContent />}
        {activeService === "smsaaa" && <SmsContent />}
      </div>
    </div>
  );
}

const styles: Record<string, React.CSSProperties> = {
  wrapper: {
    display: "flex",
    height: "100vh",
    gap: 24,
    overflowY: "auto",
    position: "relative",
  },

  sidebar: {
    width: 260,
    display: "flex",
    flexDirection: "column",
    gap: 16,
    position: "relative",
  },

  card: {
    position: "relative",
    padding: "18px 20px",
    borderRadius: 14,
    background: "rgba(255,255,255,0.04)",
    color: "#fff",
    cursor: "pointer",
    border: "1px solid rgba(255,255,255,0.08)",
    transition: "all 0.25s ease",
  },

  activeCard: {
    background: "linear-gradient(135deg, #0b3c5d, #051c2c)",
    boxShadow: "0 0 20px rgba(0,210,255,0.35)",
    border: "1px solid rgba(0,210,255,0.4)",
  },

  connector: {
    position: "absolute",
    top: "50%",
    right: -24,
    width: 24,
    height: 2,
    background: "linear-gradient(90deg, rgba(0,210,255,0.8), transparent)",
  },

  content: {
    flex: 1,
    padding: 24,
    borderRadius: 16,
    background: "rgba(255,255,255,0.03)",
    border: "1px solid rgba(255,255,255,0.08)",
  },
};