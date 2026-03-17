import { useState, useCallback } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { Typography, useTheme } from "@mui/material";
import api from "src/lib/axios";

import { Select } from "src/components/select";
import Button from "src/components/button";
import { useSnackbar } from "src/provider/snackbar";
import { useMultipleNotificationService } from "src/hooks/useService";
import { logsKeys } from "src/api/queryKeys";
import { SMSWrapper } from "./sms-wrapper";
import { EmailWrapper } from "./email-wrapper";
import { SlackWrapper } from "./slack-wrapper";
import { ServiceType, MultipleNotificationPayload } from "./types";
import { isBodyEmpty } from "src/utility/helper";
import { checkValidRecipientsforSMSWrapper } from "src/utility/sms";
import { validateAllServices } from "src/utility/validation";
import "./index.css";
import { runValidator } from "src/validators/runValidator";

export default function MultipleNotification() {
  const theme = useTheme();
  const queryClient = useQueryClient();

  const { mutate: sendNotifications, isPending } =
    useMultipleNotificationService();

  const showSnackbar = useSnackbar();

  //  const [smsErrors, setSmsErrors] = useAtom(smsErrorsAtom);

  const uploadToS3FromAttachments = async (data: any, attachmentsCopy: any) => {
    const preSignedUrls = data?.email?.preSignedUrls;
    if (!preSignedUrls?.length) return;

    for (let i = 0; i < preSignedUrls.length; i++) {
      const presigned = preSignedUrls[i];
      console.log("presigned", presigned);
      const urls = presigned?.urls;

      if (!urls?.length) continue;
      console.log("urls found,", urls);

      for (let j = 0; j < urls.length; j++) {
        const urlEntry = urls[j];
        const fileObj = attachmentsCopy[i];
        console.log("file found", fileObj);

        if (!fileObj) continue;

        const formData = new FormData();

        // Append S3 fields
        Object.entries(urlEntry.s3.fields).forEach(([key, value]) => {
          console.log("key", key, "value", value);
          formData.append(key, value as string);
        });

        console.log("urlEntry.s3.url", urlEntry.s3.url);
        // File MUST be last
        formData.append("file", fileObj);

        try {
          await api.post(urlEntry.s3.url, formData, {
            headers: {
              "Content-Type": "multipart/form-data",
              Authorization: ``,
            },
          });

          showSnackbar("Notification request accepted and queued.", "success");
          queryClient.invalidateQueries({
            queryKey: logsKeys.all,
          });
        } catch (err) {
          console.error("❌ Upload failed:", fileObj.name, err);
          showSnackbar("Failed to upload attachments", "error");
          throw err;
        }
      }
    }
  };

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
    sms: { destination: string[]; message: string[]; sections: any[] } | null;
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
    slack: { destination: string[]; message: string[]; sections: any[] } | null;
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

  // Validation logic
  const validationResult = validateAllServices(
    selectedServices,
    wrapperValues.email,
    wrapperValues.sms,
    wrapperValues.slack,
    commonMessage,
  );

  console.log("validationResult", validationResult?.slack?.errors?.slack);
  console.log("wrapperValues.slack",wrapperValues.slack)

  const isSendButtonDisabled = isPending || !validationResult.isFormValid;

  const toggleSeparateMessage = (service: "sms" | "email" | "slack") => {
    setSeparateMessages((prev) => ({
      ...prev,
      [service]: !prev[service],
    }));
  };

  // Callback handlers for wrapper value changes
  const handleSMSValueChange = useCallback(
    (values: { destination: string[]; message: string[]; sections: any[] }) => {
      // setSmsErrors("")
      setWrapperValues((prev) => ({
        ...prev,
        sms: values,
      }));
    },
    [],
  );

  const handleEmailValueChange = useCallback(
    (values: {
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
      setWrapperValues((prev) => ({
        ...prev,
        email: values,
      }));
    },
    [],
  );

  const handleSlackValueChange = useCallback(
    (values: { destination: string[]; message: string[]; sections: any[] }) => {
      setWrapperValues((prev) => ({
        ...prev,
        slack: values,
      }));
    },
    [],
  );

  const handleSendToAllServices = () => {
    const payload: MultipleNotificationPayload = {
      commonMessage,
    };

    // Add SMS to payload if selected
    if (selectedServices.includes("sms")) {
      console.log("wrapperValues.sms?.sections", wrapperValues.sms?.sections);
      const isDisabled = checkValidRecipientsforSMSWrapper(
        wrapperValues.sms?.sections || [],
        commonMessage,
      );
      console.log("isDisabled", isDisabled);
      if (isDisabled) {
        showSnackbar("SMS validations failed", "error");
        return;
      }
      // Use the new section-based structure from SMS wrapper
      if (wrapperValues.sms && wrapperValues.sms.sections) {
        payload.sms = wrapperValues.sms.sections.map(
          (section: any, index: number) => ({
            destination: section.destination,
            message: section.message, // Use section message directly since it's already filtered by separateMessage in atoms
          }),
        );
      }
    }

    // Add Email to payload if selected
    if (selectedServices.includes("email")) {
      // Use the new section-based structure from Email wrapper
      if (wrapperValues.email && wrapperValues.email.recipients) {
        console.log("wrapperValues.email", wrapperValues.email);
        payload.email = wrapperValues.email.recipients
          .filter((rec: any) => rec?.destination?.trim() !== "")
          .map((rec: any, index: number) => {
            console.log("rec", rec);
            // Generate unique key for each recipient
            const emailId = rec.destination
              .split("@")[0]
              .toLowerCase()
              .replace(/[^a-z0-9]/g, "");
            const cleanSubject = rec.subject
              .toLowerCase()
              .replace(/[^a-z0-9\s]/g, "")
              .replace(/\s+/g, "-");
            const uniqueKey = `${cleanSubject}-${emailId}-${index + 1}`;

            const emailSection: any = {
              destination: rec.destination,
              subject: rec.subject,
              fromEmail: rec.fromEmail,
              uniqueKey,
              cc: rec.cc,
              bcc: rec.bcc,
              attachments:
                rec.attachments?.map(
                  (att: any) => typeof att === "string" && att,
                ) || [],
            };

            // Always include body key if separateMessage is true (even if empty)

            if (isBodyEmpty(rec.body)) {
              emailSection.body = "";
            } else {
              emailSection.body = rec.body;
            }

            // If separateMessage is false and no common message, don't include body key

            return emailSection;
          });
      }
    }

    console.log("selectedServices",selectedServices)
    // Add Slack to payload if selected
    if (selectedServices.includes("slack")) {
      // windsurf rules
       console.log("wrapperValues.slack", wrapperValues.slack);
       if (wrapperValues.slack && wrapperValues.slack.sections) {
        payload.slack = wrapperValues.slack.sections.map(
          (section: any) => ({
            destination: section.destination,
            message: section.message, // Use section message directly since it's already filtered by separateMessage in atoms
          }),
        );
      }

      const { isValid, errors } = runValidator("slack", payload);
      console.log("isValid", isValid, "errors", errors);

      // !! Do not remove, need for staging branch
      // Use the new section-based structure from Slack wrapper
      // if (wrapperValues?.slack?.sections) {
      //   payload.slack = wrapperValues.slack.sections.map((section: any) => {
      //     const slackSection: any = { destination: section.destination };

      //     if (section.message) {
      //       slackSection.message = section.message;
      //     }

      //     return slackSection;
      //   });
      // }
    }

    console.log("payload", payload);

    // // Check if there are any attachments in the payload
    const hasAttachments =
      payload.email?.some(
        (email) => email.attachments && email.attachments.length > 0,
      ) || false;

    // Collect all attachments for upload
    const allAttachments: any[] = [];
    payload.email?.forEach((email) => {
      if (email.attachments && email.attachments.length > 0) {
        // Find the corresponding recipient to get the actual file objects
        const recipient = wrapperValues.email?.recipients.find(
          (rec) =>
            rec.to === email.destination ||
            rec.destination === email.destination,
        );
        if (recipient) {
          console.log("recipient", recipient);
          allAttachments.push(...recipient.attachments);
        }
      }
    });

    // sendNotifications(payload, {
    //   onSuccess: async ({ data }) => {
    //     // Reset form
    //     setCommonMessage("");
    //     setSelectedServices([]);
    //     setSeparateMessages({
    //       sms: false,
    //       email: false,
    //       slack: false,
    //     });

    //     // Create detailed status message for each service
    //     const statusMessages = [];

    //     if (selectedServices.includes("sms")) {
    //       const smsStatus = data?.sms?.success
    //         ? `SMS: ${data?.sms?.message || "Notification request accepted and queued."}`
    //         : `SMS: ${data?.sms?.message || "Failed to send notification"}`;
    //       statusMessages.push(smsStatus);
    //     }

    //     if (selectedServices.includes("email")) {
    //       const emailStatus = data?.email?.success
    //         ? `Email: ${data?.email?.message || "Notification request accepted and queued."}`
    //         : `Email: ${data?.email?.message || "Failed to send notification"}`;
    //       statusMessages.push(emailStatus);
    //     }

    //     if (selectedServices.includes("slack")) {
    //       const slackStatus = data?.slack?.success
    //         ? `Slack: ${data?.slack?.message || "Notification request accepted and queued."}`
    //         : `Slack: ${data?.slack?.message || "Failed to send notification"}`;
    //       statusMessages.push(slackStatus);
    //     }

    //     // Show combined status message
    //     const combinedMessage = statusMessages.join("\n");
    //     const hasAnyFailure = statusMessages.some((msg) =>
    //       msg.includes("Failed"),
    //     );

    //     showSnackbar(
    //       combinedMessage,
    //       hasAnyFailure ? "error" : "success",
    //       30000,
    //     );

    //     if (!hasAttachments || allAttachments.length === 0) {
    //       queryClient.invalidateQueries({
    //         queryKey: logsKeys.all,
    //       });
    //     } else if (data?.email?.success) {
    //       await uploadToS3FromAttachments(data, allAttachments);
    //     }
    //   },
    //   onError: (error: any) => {
    //     console.info(
    //       "error",
    //       error?.data?.email,
    //       "error?.response?.data",
    //       "error?.response?.data",
    //       "error?.message",
    //       error?.message,
    //     );

    //     // Handle error case with detailed service status
    //     const errorData = error?.data || {};
    //     const statusMessages = [];

    //     if (selectedServices.includes("sms")) {
    //       if (errorData?.sms?.success === false) {
    //         const smsStatus = `SMS: ${errorData?.sms?.message || "Failed to send notification"}`;
    //         statusMessages.push(smsStatus);
    //       }
    //     }

    //     if (selectedServices.includes("email")) {
    //       if (errorData?.email?.success === false) {
    //         const emailStatus = `Email: ${errorData?.email?.message || "Failed to send notification"}`;
    //         statusMessages.push(emailStatus);
    //       }
    //     }

    //     if (selectedServices.includes("slack")) {
    //       if (errorData?.slack?.success === false) {
    //         const slackStatus = `Slack: ${errorData?.slack?.message || "Failed to send notification"}`;
    //         statusMessages.push(slackStatus);
    //       }
    //     }

    //     const combinedMessage = statusMessages.join("\n");
    //     const hasAnyFailure = statusMessages.some((msg) =>
    //       msg.includes("Failed"),
    //     );

    //     showSnackbar(combinedMessage, "error", 30000);
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
            style={{ color: "text.secondary" }}
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
          <div
            className="service-section"
            style={{
              border: `1px solid rgba(255, 255, 255, 0.15)`,
              borderRadius: "8px",
              padding: "16px",
              marginBottom: "16px",
            }}
          >
            <h3
              style={{
                margin: "0 0 16px 0",
                color: theme.vars?.palette.text.secondary,
              }}
            >
              SMS
            </h3>
            <SMSWrapper
              showMessage={separateMessages.sms}
              onValueChange={handleSMSValueChange}
              maxBlocks={5}
            />
            {validationResult?.sms?.errors?.sms &&
              Array.isArray(validationResult?.sms?.errors?.sms) && (
                <div style={{ color: "red", fontSize: "12px" }}>
                  {validationResult.sms.errors.sms?.[0]}
                </div>
              )}
          </div>
        )}

        {/* Email Section */}
        {selectedServices.includes("email") && (
          <div
            className="service-section"
            style={{
              border: `1px solid rgba(255, 255, 255, 0.15)`,
              borderRadius: "8px",
              padding: "16px",
              marginBottom: "16px",
            }}
          >
            <h3
              style={{
                margin: "0 0 16px 0",
                color: theme.vars?.palette.text.secondary,
              }}
            >
              Email
            </h3>
            <EmailWrapper
              showBody={separateMessages.email}
              onValueChange={handleEmailValueChange}
              maxBlocks={5}
            />
          </div>
        )}

        {/* Slack Section */}
        {selectedServices.includes("slack") && (
          <div
            className="service-section"
            style={{
              border: `1px solid rgba(255, 255, 255, 0.15)`,
              borderRadius: "8px",
              padding: "16px",
              marginBottom: "16px",
            }}
          >
            <h3
              style={{
                margin: "0 0 16px 0",
                color: theme.vars?.palette.text.secondary,
              }}
            >
              Slack
            </h3>
            <SlackWrapper
              onValueChange={handleSlackValueChange}
              maxBlocks={5}
            />
            {validationResult?.slack?.errors?.slack &&
              Array.isArray(validationResult?.slack?.errors?.slack) && (
                <div style={{ color: "red", fontSize: "12px" }}>
                  {validationResult.slack.errors.slack?.[0]}
                </div>
              )}
          </div>
        )}

        {/* Common Send Button */}
        {selectedServices.length > 0 && (
          <div
            style={{
              marginTop: 24,
              padding: "16px",
              borderTop: `1px solid rgba(255, 255, 255, 0.15)`,
            }}
          >
            <Button
              label={isPending ? "Sending..." : "Send to All Services"}
              className={isPending ? "button-disabled" : "send-button"}
              // disabled={isSendButtonDisabled}
              onClick={handleSendToAllServices}
            />
          </div>
        )}
      </div>
    </div>
  );
}
