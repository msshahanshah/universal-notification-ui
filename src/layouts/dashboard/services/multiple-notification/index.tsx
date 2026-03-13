import { useState, useCallback } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { Typography, useTheme } from "@mui/material";

import { Select } from "src/components/select";
import Button from "src/components/button";
import { useSnackbar } from "src/provider/snackbar";
import { useMultipleNotificationService } from "src/hooks/useService";
import { logsKeys } from "src/api/queryKeys";
import { SMSWrapper } from "./sms-wrapper";
import { EmailWrapper } from "./email-wrapper";
import { SlackWrapper } from "./slack-wrapper";
import { ServiceType, MultipleNotificationPayload } from "./types";

import "./index.css";

export default function MultipleNotification() {
  const theme = useTheme();
  const queryClient = useQueryClient();
  const showSnackbar = useSnackbar();
  const { mutate: sendNotifications, isPending } =
    useMultipleNotificationService();

  const [selectedServices, setSelectedServices] = useState<ServiceType[]>([]);
  const [commonMessage, setCommonMessage] = useState("");
  const [separateMessages, setSeparateMessages] = useState<{
    sms: boolean;
    email: boolean;
    slack: boolean;
  }>({
    sms: false,
    email: false,
    slack: false,
  });

  // Store wrapper values
  const [wrapperValues, setWrapperValues] = useState<{
    sms: { destination: string[]; message: string } | null;
    email: { 
      from: string; 
      recipients: {
        id: string;
        from: string;
        to: string;
        cc: string;
        bcc: string;
        subject: string;
        body: string;
        attachments: { fileName: string }[];
      }[];
    } | null;
    slack: { destination: string[]; message: string[] } | null;
  }>({
    sms: null,
    email: null,
    slack: null,
  });

  const serviceOptions = [
    { label: "SMS", value: "sms" },
    { label: "Email", value: "email" },
    { label: "Slack", value: "slack" },
  ];

  const toggleSeparateMessage = (service: "sms" | "email" | "slack") => {
    setSeparateMessages((prev) => ({
      ...prev,
      [service]: !prev[service],
    }));
  };

  // Callback handlers for wrapper value changes
  const handleSMSValueChange = useCallback((values: { destination: string[]; message: string }) => {
    setWrapperValues(prev => ({
      ...prev,
      sms: values
    }));
  }, []);

  const handleEmailValueChange = useCallback((values: { 
    from: string; 
    recipients: {
      id: string;
      from: string;
      to: string;
      cc: string;
      bcc: string;
      subject: string;
      body: string;
      attachments: { fileName: string }[];
    }[];
  }) => {
    setWrapperValues(prev => ({
      ...prev,
      email: values
    }));
  }, []);

  const handleSlackValueChange = useCallback((values: { destination: string[]; message: string[] }) => {
    setWrapperValues(prev => ({
      ...prev,
      slack: values
    }));
  }, []);

  // Validate wrapper values
  const areWrapperValuesValid = () => {
    if (selectedServices.includes("sms") && (!wrapperValues.sms?.destination.length || (separateMessages.sms && !wrapperValues.sms?.message))) {
      return false;
    }
    if (selectedServices.includes("email")) {
      const hasValidRecipients = wrapperValues.email?.recipients?.some(rec => 
        rec.to.trim() !== "" && (!separateMessages.email || rec.body.trim() !== "")
      );
      if (!hasValidRecipients) {
        return false;
      }
    }
    if (selectedServices.includes("slack") && (!wrapperValues.slack?.destination.length || (separateMessages.slack && !wrapperValues.slack?.message.length))) {
      return false;
    }
    return true;
  };

  const handleSendToAllServices = () => {
    const payload: MultipleNotificationPayload = {
      commonMessage,
    };

    // Add SMS to payload if selected
    if (selectedServices.includes("sms")) {
      payload.sms = wrapperValues.sms?.destination.map(dest => ({
        destination: dest,
        message: separateMessages.sms ? wrapperValues.sms?.message || "" : commonMessage,
      })) || [];
    }

    // Add Email to payload if selected
    if (selectedServices.includes("email")) {
      payload.email = wrapperValues.email?.recipients
        .filter(rec => rec.to.trim() !== "")
        .map((rec, index) => {
          // Generate unique key for each recipient
          const emailId = rec.to.split('@')[0].toLowerCase().replace(/[^a-z0-9]/g, '');
          const cleanSubject = rec.subject.toLowerCase().replace(/[^a-z0-9\s]/g, '').replace(/\s+/g, '-');
          const uniqueKey = `${cleanSubject}-${emailId}-${index + 1}`;
          
          return {
            destination: rec.to,
            subject: rec.subject,
            body: separateMessages.email ? rec.body : commonMessage,
            attachments: rec.attachments.map(att => att.file.name),
            fromEmail: rec.from,
            uniqueKey,
            cc: rec.cc,
            bcc: rec.bcc,
          };
        }) || [];
    }

    // Add Slack to payload if selected
    if (selectedServices.includes("slack")) {
      payload.slack = wrapperValues.slack?.destination.map((dest, index) => ({
        destination: dest,
        message: separateMessages.slack ? (wrapperValues.slack?.message[index] || "") : commonMessage,
      })) || [];
    }

    console.log("payload", payload)

    // sendNotifications(payload, {
    //   onSuccess: (data) => {
    //     queryClient.invalidateQueries({ queryKey: logsKeys.all });
    //     showSnackbar(
    //       data?.message || "Notifications sent successfully!",
    //       "success"
    //     );

    //     // Reset form
    //     setCommonMessage("");
    //     setSelectedServices([]);
    //     setSeparateMessages({
    //       sms: false,
    //       email: false,
    //       slack: false,
    //     });
    //   },
    //   onError: (error: any) => {
    //     showSnackbar(
    //       error?.message || "Failed to send notifications",
    //       "error"
    //     );
    //   },
    // });
  };

  return (
    <div className="multiple-notification-container">
      <Typography variant="h6" sx={{ mt: 0, mb: 4, color: "text.secondary" }}>
        Send Notifications to Multiple Services
      </Typography>

      <div
        className="multiple-notification-wrapper"
        style={{ backgroundColor: theme.vars?.palette.background.paper }}
      >
        {/* Service Selection */}
        <div style={{ marginBottom: 24 }}>
          <label
            style={{
              fontSize: "12px",
              color: theme.vars?.palette.text.secondary,
              display: "block",
              marginBottom: 8,
            }}
          >
            Select Services
            <span style={{ color: "red", marginLeft: 2 }}>*</span>
          </label>
          <Select
            value={selectedServices}
            onChange={(val) => setSelectedServices(val as ServiceType[])}
            options={serviceOptions}
            placeholder="Select services..."
            multiple
            style={{ width: "30%" }}
          />
        </div>

        {/* Common Message */}
        <div style={{ marginBottom: 24 }}>
          <label
            style={{
              fontSize: "12px",
              color: theme.vars?.palette.text.secondary,
              display: "block",
              marginBottom: 8,
            }}
          >
            Common message
            <span style={{ color: "red", marginLeft: 2 }}>*</span>
          </label>
          <textarea
            value={commonMessage}
            onChange={(e) => setCommonMessage(e.target.value)}
            placeholder="Enter message to be sent across all selected services"
            style={{
              width: "100%",
              minHeight: 100,
              padding: "12px",
              borderRadius: "8px",
              background: "hsla(220, 35%, 3%, 0.4)",
              border: "1px solid rgba(255, 255, 255, 0.15)",
              color: "#fff",
              fontSize: "13px",
              fontFamily: '"Inter", sans-serif',
              resize: "vertical",
            }}
          />
        </div>

        {/* SMS Section */}
        {selectedServices.includes("sms") && (
          <div className="service-section" style={{ border: `1px solid rgba(255, 255, 255, 0.15)`, borderRadius: "8px", padding: "16px", marginBottom: "16px" }}>
            <h3 style={{ margin: "0 0 16px 0", color: theme.vars?.palette.text.primary }}>SMS</h3>
            {/* {!separateMessages.sms && (
              <div style={{ marginBottom: 16, padding: "12px", background: "rgba(255, 255, 255, 0.05)", borderRadius: "6px", fontSize: "12px", color: theme.vars?.palette.text.secondary }}>
                Using common message for all SMS recipients
              </div>
            )} */}
            <SMSWrapper showMessage={separateMessages.sms} onValueChange={handleSMSValueChange} />
            <button
              onClick={() => toggleSeparateMessage("sms")}
              style={{
                padding: "6px 12px",
                fontSize: "12px",
                background: separateMessages.sms ? "rgba(76, 175, 80, 0.2)" : "rgba(255, 255, 255, 0.1)",
                border: `1px solid ${separateMessages.sms ? "#4CAF50" : "rgba(255, 255, 255, 0.2)"}`,
                color: separateMessages.sms ? "#4CAF50" : "#fff",
                borderRadius: "6px",
                cursor: "pointer",
                transition: "all 0.2s",
                marginTop: 16,
              }}
            >
              {separateMessages.sms ? "✓ Using Separate Messages" : "I want to send separate message"}
            </button>
          </div>
        )}

        {/* Email Section */}
        {selectedServices.includes("email") && (
          <div className="service-section" style={{ border: `1px solid rgba(255, 255, 255, 0.15)`, borderRadius: "8px", padding: "16px", marginBottom: "16px" }}>
            <h3 style={{ margin: "0 0 16px 0", color: theme.vars?.palette.text.primary }}>Email</h3>
                        <EmailWrapper showBody={separateMessages.email} onValueChange={handleEmailValueChange} />
            <button
              onClick={() => toggleSeparateMessage("email")}
              style={{
                padding: "6px 12px",
                fontSize: "12px",
                background: separateMessages.email ? "rgba(76, 175, 80, 0.2)" : "rgba(255, 255, 255, 0.1)",
                border: `1px solid ${separateMessages.email ? "#4CAF50" : "rgba(255, 255, 255, 0.2)"}`,
                color: separateMessages.email ? "#4CAF50" : "#fff",
                borderRadius: "6px",
                cursor: "pointer",
                transition: "all 0.2s",
                marginTop: 16,
              }}
            >
              {separateMessages.email ? "✓ Using Separate Messages" : "I want to send separate message"}
            </button>
          </div>
        )}

        {/* Slack Section */}
        {selectedServices.includes("slack") && (
          <div className="service-section" style={{ border: `1px solid rgba(255, 255, 255, 0.15)`, borderRadius: "8px", padding: "16px", marginBottom: "16px" }}>
            <h3 style={{ margin: "0 0 16px 0", color: theme.vars?.palette.text.primary }}>Slack</h3>
            <SlackWrapper showMessage={separateMessages.slack} onValueChange={handleSlackValueChange} />
            <button
              onClick={() => toggleSeparateMessage("slack")}
              style={{
                padding: "6px 12px",
                fontSize: "12px",
                background: separateMessages.slack ? "rgba(76, 175, 80, 0.2)" : "rgba(255, 255, 255, 0.1)",
                border: `1px solid ${separateMessages.slack ? "#4CAF50" : "rgba(255, 255, 255, 0.2)"}`,
                color: separateMessages.slack ? "#4CAF50" : "#fff",
                borderRadius: "6px",
                cursor: "pointer",
                transition: "all 0.2s",
                marginTop: 16,
              }}
            >
              {separateMessages.slack ? "✓ Using Separate Messages" : "I want to send separate message"}
            </button>
          </div>
        )}

        {/* Common Send Button */}
        {selectedServices.length > 0 && (
          <div style={{ marginTop: 24, padding: "16px", borderTop: `1px solid rgba(255, 255, 255, 0.15)` }}>
            <Button
              label={isPending ? "Sending..." : "Send to All Services"}
              className={isPending ? "button-disabled" : "send-button"}
              // disabled={isPending || !commonMessage.trim() || !areWrapperValuesValid()}
              onClick={handleSendToAllServices}
            />
          </div>
        )}
      </div>
    </div>
  );
}
