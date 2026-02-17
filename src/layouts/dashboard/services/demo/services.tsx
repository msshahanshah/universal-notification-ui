import { Typography } from "@mui/material";
import { useState } from "react";
import Button from "src/components/button";
import Input from "src/components/input";
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
  //   { key: "slaaaacks", label: "Slack" },
  //   { key: "emailm", label: "Email" },
  //   { key: "smsm", label: "SMS" },
  //   { key: "slacksa", label: "Slack" },
  //   { key: "emaiala", label: "Email" },
  //   { key: "smsa", label: "SMS" },
  //   { key: "slackaaa", label: "Slack" },
  //   { key: "emaiala", label: "Email" },
  //   { key: "smsa", label: "SMS" },
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

// const styles: Record<string, React.CSSProperties> = {
//   wrapper: {
//     display: "flex",
//     // height: "100vh",
//     gap: 24,
//     overflowY: "auto",
//     position: "relative",
//   },

//   sidebar: {
//     width: 260,
//     display: "flex",
//     flexDirection: "column",
//     gap: 16,
//     position: "relative",
//   },

// //   card: {
// //     position: "relative",
// //     padding: "18px 20px",
// //     borderRadius: 14,
// //     // background: "hsla(220, 35%, 3%, 0.4)",
// //     color: "#fff",
// //     cursor: "pointer",
// //     border: "1px solid rgba(255,255,255,0.08)",
// //     transition: "all 0.25s ease",
// //   },

// //   activeCard: {
// //     // background: "hsla(220, 35%, 3%, 0.4)",
// //     // border: "1px solid rgba(255, 255, 255, 0.15)",
// //     // marginBottom: 10,
// //     // boxShadow:
// //     //   "rgba(0, 0, 0, 0.6) 0px 4px 18px, rgba(255, 255, 255, 0.04) 0px 0px 0px 1px, rgba(0, 210, 255, 0.25) 0px 0px 20px",
// //     background: "#0b0f1a",
// //     borderRadius: 14,
// //     padding: 16,
// //     border: "1px solid rgba(255, 255, 255, 0.08)",
// //     transition: "all 0.2s ease",
// //     // flexShrink: 0,
// //     // boxShadow: '0 0 0 1px hsla(220, 35%, 3%, 0.4), 0 0 8px rgba(0, 210, 255, 0.5)'
// //   },

// card: {
//     padding: "18px 20px",
//     borderRadius: 14,
//     background: "rgba(255,255,255,0.04)",
//     color: "#fff",
//     cursor: "pointer",
//     border: "1px solid rgba(255,255,255,0.08)",
//     transition: "all 0.25s ease",
//   },

//   activeCard: {
//     background: "linear-gradient(135deg, #0b3c5d, #051c2c)",
//     boxShadow: "0 0 20px rgba(0,210,255,0.35)",
//     border: "1px solid rgba(0,210,255,0.4)",
//   },

//   connector: {
//     position: "absolute",
//     top: "50%",
//     right: -24,
//     width: 24,
//     height: 2,
//     background: 'rgba(255,255,255,0.2)',
//   },

//   content: {
//     flex: 1,
//     padding: 24,
//     borderRadius: 16,
//     background: "rgba(255,255,255,0.03)",
//     border: "1px solid rgba(255,255,255,0.08)",
//     // height: "94%",
//   },
// };
