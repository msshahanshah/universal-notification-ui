import { useState, useCallback } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { Typography, useTheme } from "@mui/material";
import { useSetAtom, useAtom } from "jotai";

import api from "src/lib/axios";
import { smsSectionsAtom } from "src/atoms/smsAtoms";
import { slackSectionsAtom } from "src/atoms/slackAtoms";
import {
  emailSectionsAtom,
  emailRawRecipientsAtom,
} from "src/atoms/emailAtoms";
import {
  whatsappSectionsAtom,
  whatsappRawRecipientsAtom,
} from "src/atoms/whatsappAtoms";
import { Select } from "src/components/select";
import Button from "src/components/button";
import { useSnackbar } from "src/provider/snackbar";
import { useMultipleNotificationService } from "src/hooks/useService";
import { logsKeys } from "src/api/queryKeys";
import { isBodyEmpty } from "src/utility/helper";
import { checkValidRecipientsforSMSWrapper } from "src/utility/sms";
import { validateAllServices } from "src/utility/validation";

import { SMSWrapper } from "./sms-wrapper";
import { EmailWrapper } from "./email-wrapper";
import { SlackWrapper } from "./slack-wrapper";
import { WhatsappWrapper } from "./whatsapp-wrapper";
import { ServiceType, MultipleNotificationPayload } from "./types";

import "./index.css";

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

      const urls = presigned?.urls;

      if (!urls?.length) continue;

      for (let j = 0; j < urls.length; j++) {
        const urlEntry = urls[j];

        // Find the file that matches this URL's filename
        const filenameFromUrl = urlEntry.s3.fields?.key?.split("/").pop();
        const fileObj = attachmentsCopy.find(
          (file: any) => file.name === filenameFromUrl,
        );

        if (!fileObj) {
          console.warn(
            `No file found for URL with filename: ${filenameFromUrl}`,
          );
          continue;
        }

        const formData = new FormData();

        // Append S3 fields
        Object.entries(urlEntry.s3.fields).forEach(([key, value]) => {
          formData.append(key, value as string);
        });

        // File MUST be last
        formData.append("file", fileObj);

        try {
          await api.post(urlEntry.s3.url, formData, {
            headers: {
              "Content-Type": "multipart/form-data",
              Authorization: ``,
            },
          });
          queryClient.invalidateQueries({
            queryKey: logsKeys.all,
          });
        } catch (err) {
          console.error("❌ Upload failed:", fileObj.name, err);

          setTimeout(() => {
            showSnackbar("Email: Failed to upload attachments", "error");
          }, 30000);
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
    whatsapp: boolean;
  }>({
    sms: false,
    email: false,
    slack: false,
    whatsapp: false,
  });

  // Remove service from selectedServices
  const removeService = (serviceType: ServiceType) => {
    setSelectedServices((prev) =>
      prev.filter((service) => service !== serviceType),
    );
  };

  // Atom setters for resetting service fields
  const setSmsSections = useSetAtom(smsSectionsAtom);
  const setSlackSections = useSetAtom(slackSectionsAtom);
  const setEmailSections = useSetAtom(emailSectionsAtom);
  const setWhatsappSections = useSetAtom(whatsappSectionsAtom);

  // Raw recipients for file uploads
  const [emailRawRecipients] = useAtom(emailRawRecipientsAtom);
  const [whatsappRawRecipients] = useAtom(whatsappRawRecipientsAtom);

  // Reset functions for each service
  const resetSmsFields = useCallback(() => {
    setSmsSections([
      {
        id: "1",
        numbers: [{ id: "1", countryCode: "+91", number: "" }],
        message: "",
        separateMessage: false,
      },
    ]);
  }, [setSmsSections]);

  const resetSlackFields = useCallback(() => {
    setSlackSections([
      {
        id: "1",
        channelID: "",
        message: "",
        separateMessage: false,
      },
    ]);
  }, [setSlackSections]);

  const resetEmailFields = useCallback(() => {
    setEmailSections([
      {
        id: "1",
        from: "",
        to: "",
        cc: "",
        bcc: "",
        subject: "",
        body: "",
        attachments: [],
        separateMessage: false,
      },
    ]);
  }, [setEmailSections]);

  const resetWhatsappFields = useCallback(() => {
    setWhatsappSections([
      {
        id: "1",
        numbers: [{ id: "1", countryCode: "+91", number: "" }],
        message: "",
        attachments: [],
        separateMessage: false,
        attachmentType: "url",
        variableValues: {},
        toggleType: "template",
      },
    ]);
  }, [setWhatsappSections]);

  // Main function to reset service fields
  const resetServiceFields = useCallback(
    (services: ServiceType[]) => {
      services.forEach((service) => {
        switch (service) {
          case "sms":
            resetSmsFields();
            break;
          case "slack":
            resetSlackFields();
            break;
          case "email":
            resetEmailFields();
            break;
          case "whatsapp":
            resetWhatsappFields();
            break;
        }
      });
    },
    [resetSmsFields, resetSlackFields, resetEmailFields, resetWhatsappFields],
  );

  // Handle service selection with field reset
  const handleServiceSelection = useCallback(
    (newServices: ServiceType[]) => {
      const currentServices = selectedServices;

      // Find newly added services
      const newlyAddedServices = newServices.filter(
        (service) => !currentServices.includes(service),
      );

      // Reset fields for newly selected services
      if (newlyAddedServices.length > 0) {
        resetServiceFields(newlyAddedServices);
      }

      // Update selected services
      setSelectedServices(newServices);
    },
    [selectedServices, resetServiceFields],
  );

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
    whatsapp: {
      recipients: {
        id: string;
        destination: string;
        body: string;
        attachments: any[];
        separateMessage: boolean;
        templateId: string | null;
        variableValues: Record<string, string>;
      }[];
    } | null;
  }>({
    sms: null,
    email: null,
    slack: null,
    whatsapp: null,
  });

  const serviceOptions = [
    { label: "SMS", value: "sms" },
    { label: "Email", value: "email" },
    { label: "Slack", value: "slack" },
    { label: "WhatsApp", value: "whatsapp" },
  ];

  // Validation logic
  const validationResult = validateAllServices(
    selectedServices,
    wrapperValues.email,
    wrapperValues.sms,
    wrapperValues.slack,
    wrapperValues.whatsapp,
    commonMessage,
  );

  const isSendButtonDisabled = isPending || !validationResult.isFormValid;

  const toggleSeparateMessage = (
    service: "sms" | "email" | "slack" | "whatsapp",
  ) => {
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

  const handleWhatsappValueChange = useCallback(
    (values: { recipients: [] }) => {
      setWrapperValues((prev) => ({
        ...prev,
        whatsapp: values,
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
      const isDisabled = checkValidRecipientsforSMSWrapper(
        wrapperValues.sms?.sections || [],
        commonMessage,
      );

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
        payload.email = wrapperValues.email.recipients
          .filter((rec: any) => rec?.destination?.trim() !== "")
          .map((rec: any, index: number) => {
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

    // Add Slack to payload if selected
    if (selectedServices.includes("slack")) {
      // !! Do not remove, need for staging branch
      // Use the new section-based structure from Slack wrapper
      if (wrapperValues?.slack?.sections) {
        payload.slack = wrapperValues.slack.sections.map((section: any) => {
          const slackSection: any = { destination: section.destination };

          if (section.message) {
            slackSection.message = section.message;
          }

          return slackSection;
        });
      }
    }
    // Add WhatsApp to payload if selected
    if (selectedServices.includes("whatsapp")) {
      if (wrapperValues.whatsapp && wrapperValues.whatsapp.recipients) {
        payload.whatsapp = wrapperValues.whatsapp.recipients
          .filter(
            (rec: any) =>
              rec?.destination?.trim() !== "" ||
              // rec?.numbers?.some((num: any) => num.number.trim() !== "") ||
              rec?.templateId ||
              rec?.separateMessage,
          )
          .map((rec: any) => {
            const whatsappSection: any = {
              destination: rec.destination,
            };

            // Only include uniqueKey if it exists
            if (rec.uniqueKey) {
              whatsappSection.uniqueKey = rec.uniqueKey;
            }

            // Only include attachments if they exist and are not empty
            if (rec.attachments && rec.attachments.length > 0) {
              whatsappSection.attachments = rec.attachments.map(
                (att: any) => att.url || att,
              );
            }

            // Add body if separateMessage is true or if no common message
            if (
              !rec?.templateId &&
              (rec.separateMessage || !commonMessage.trim())
            ) {
              whatsappSection.message = rec.message || "";
            }
            if (rec?.templateId) {
              whatsappSection.templateId = rec.templateId;
              whatsappSection.variableValues = rec.variableValues;
            }

            return whatsappSection;
          });
      }
    }

    // // Check if there are any attachments in the payload
    const hasAttachments =
      payload.email?.some(
        (email) => email.attachments && email.attachments.length > 0,
      ) ||
      false ||
      payload.whatsapp?.some(
        (whatsapp) => whatsapp.attachments && whatsapp.attachments.length > 0,
      ) ||
      false;

    // Collect all attachments for upload
    const allAttachments: any[] = [];

    payload.email?.forEach((email) => {
      if (email.attachments && email.attachments.length > 0) {
        // Find the corresponding recipient to get the actual file objects
        const recipient = emailRawRecipients.find(
          (rec) =>
            rec.to === email.destination ||
            rec.destination === email.destination,
        );
        if (recipient) {
          // Extract only the actual File objects from attachment objects
          const fileObjects = recipient.attachments
            .map(att => att.file)
            .filter(file => file instanceof File);
          allAttachments.push(...fileObjects);
        }
      }
    });

    // Collect WhatsApp attachments for upload
    payload.whatsapp?.forEach((whatsapp) => {
      if (whatsapp.attachments && whatsapp.attachments.length > 0) {
        // Find the corresponding recipient to get the actual file objects
        const recipient = whatsappRawRecipients.find(
          (rec) =>
            rec.to === whatsapp.destination ||
            rec.destination === whatsapp.destination,
        );
        if (recipient) {
          // Extract only the actual File objects from attachment objects
          const fileObjects = recipient.attachments
            .map((att) => att.file)
            .filter((file) => file instanceof File);
          allAttachments.push(...fileObjects);

        }}})

    sendNotifications(payload, {
      onSuccess: async ({ data }) => {
        // Reset form
        setCommonMessage("");
        setSelectedServices([]);
        setSeparateMessages({
          sms: false,
          email: false,
          slack: false,
          whatsapp: false,
        });

        // Create detailed status message for each service
        const statusMessages = [];

        if (selectedServices.includes("sms")) {
          const smsStatus = data?.sms?.success
            ? `SMS: ${data?.sms?.message || "Notification request accepted and queued."}`
            : `SMS: ${data?.sms?.message || "Failed to send notification"}`;
          statusMessages.push(smsStatus);
        }

        if (selectedServices.includes("email")) {
          const emailStatus = data?.email?.success
            ? `Email: ${data?.email?.message || "Notification request accepted and queued."}`
            : `Email: ${data?.email?.message || "Failed to send notification"}`;
          statusMessages.push(emailStatus);
        }

        if (selectedServices.includes("slack")) {
          const slackStatus = data?.slack?.success
            ? `Slack: ${data?.slack?.message || "Notification request accepted and queued."}`
            : `Slack: ${data?.slack?.message || "Failed to send notification"}`;
          statusMessages.push(slackStatus);
        }

        if (selectedServices.includes("whatsapp")) {
          const whatsappStatus = data?.whatsapp?.success
            ? `Whatsapp: ${data?.whatsapp?.message || "Notification request accepted and queued."}`
            : `Whatsapp: ${data?.whatsapp?.message || "Failed to send notification"}`;
          statusMessages.push(whatsappStatus);
        }

        // Show combined status message
        const combinedMessage = statusMessages.join("\n");
        const hasAnyFailure = statusMessages.some((msg) =>
          msg.includes("Failed"),
        );

        showSnackbar(
          combinedMessage,
          hasAnyFailure ? "error" : "success",
          30000,
        );

        const attachmentsCopy = [...allAttachments];

        if (!hasAttachments || attachmentsCopy.length === 0) {
          queryClient.invalidateQueries({
            queryKey: logsKeys.all,
          });
        } else if (data?.email?.success) {
          await uploadToS3FromAttachments(data, attachmentsCopy);
        }
      },
      onError: (error: any) => {
        console.info(
          "error",
          error?.data?.email,
          "error?.response?.data",
          "error?.response?.data",
          "error?.message",
          error?.message,
        );

        // Handle error case with detailed service status
        const errorData = error?.data || {};
        const statusMessages = [];

        if (selectedServices.includes("sms")) {
          if (errorData?.sms?.success === false) {
            const smsStatus = `SMS: ${errorData?.sms?.message || "Failed to send notification"}`;
            statusMessages.push(smsStatus);
          }
        }

        if (selectedServices.includes("email")) {
          if (errorData?.email?.success === false) {
            const emailStatus = `Email: ${errorData?.email?.message || "Failed to send notification"}`;
            statusMessages.push(emailStatus);
          }
        }

        if (selectedServices.includes("slack")) {
          if (errorData?.slack?.success === false) {
            const slackStatus = `Slack: ${errorData?.slack?.message || "Failed to send notification"}`;
            statusMessages.push(slackStatus);
          }
        }
        
        if (selectedServices.includes("whatsapp")) {
          if (errorData?.whatsapp?.success === false) {
            const whatsappStatus = `Whatsapp: ${errorData?.whatsapp?.message || "Failed to send notification"}`;
            statusMessages.push(whatsappStatus);
          }
        }

        const combinedMessage = statusMessages.join("\n");
        const hasAnyFailure = statusMessages.some((msg) =>
          msg.includes("Failed"),
        );

        showSnackbar(combinedMessage, "error", 30000);
      },
    });
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
            onChange={(val) => handleServiceSelection(val as ServiceType[])}
            options={serviceOptions}
            placeholder="Select services..."
            multiple
            style={{
              color: "text.secondary",
              backgroundColor: theme.vars?.palette.background.paper,
            }}
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
            className="sms-textarea"
            rows={6}
          />
        </div>

        {/* SMS Section */}
        {selectedServices.includes("sms") && (
          <div
            className="service-section"
            style={{
              border: `1px solid ${theme.vars?.palette.divider}`,
              borderRadius: "8px",
              padding: "16px",
              marginBottom: "16px",
            }}
          >
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                margin: "0 0 16px 0",
              }}
            >
              <h3
                style={{
                  margin: 0,
                  color: theme.vars?.palette.text.secondary,
                }}
              >
                SMS
              </h3>
              <button
                onClick={() => removeService("sms")}
                className="remove-btn"
                aria-label="Remove SMS service"
              >
                ×
              </button>
            </div>
            <SMSWrapper
              showMessage={separateMessages.sms}
              onValueChange={handleSMSValueChange}
              maxBlocks={5}
            />
            {validationResult?.sms?.errors?.sms &&
              Array.isArray(validationResult?.sms?.errors?.sms) &&
              validationResult?.sms?.errors?.sms?.length && (
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
              border: `1px solid ${theme.vars?.palette.divider}`,
              borderRadius: "8px",
              padding: "16px",
              marginBottom: "16px",
            }}
          >
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                margin: "0 0 16px 0",
              }}
            >
              <h3
                style={{
                  margin: 0,
                  color: theme.vars?.palette.text.secondary,
                }}
              >
                Email
              </h3>
              <button
                onClick={() => removeService("email")}
                className="remove-btn"
                aria-label="Remove Email service"
              >
                ×
              </button>
            </div>
            <EmailWrapper
              showBody={separateMessages.email}
              onValueChange={handleEmailValueChange}
              maxBlocks={5}
            />
            {validationResult?.email?.errors?.email &&
              Array.isArray(validationResult?.email?.errors?.email) &&
              validationResult?.email?.errors?.email?.length && (
                <div style={{ color: "red", fontSize: "12px", marginTop: 20 }}>
                  {validationResult.email.errors.email?.[0]}
                </div>
              )}
          </div>
        )}

        {/* Slack Section */}
        {selectedServices.includes("slack") && (
          <div
            className="service-section"
            style={{
              border: `1px solid ${theme.vars?.palette.divider}`,
              borderRadius: "8px",
              padding: "16px",
              marginBottom: "16px",
            }}
          >
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                margin: "0 0 16px 0",
              }}
            >
              <h3
                style={{
                  margin: 0,
                  color: theme.vars?.palette.text.secondary,
                }}
              >
                Slack
              </h3>
              <button
                onClick={() => removeService("slack")}
                className="remove-btn"
                aria-label="Remove Slack service"
              >
                ×
              </button>
            </div>
            <SlackWrapper
              onValueChange={handleSlackValueChange}
              maxBlocks={5}
            />
            {validationResult?.slack?.errors?.slack &&
              Array.isArray(validationResult?.slack?.errors?.slack) &&
              validationResult?.slack?.errors?.slack?.length && (
                <div style={{ color: "red", fontSize: "12px" }}>
                  {validationResult.slack.errors.slack?.[0]}
                </div>
              )}
          </div>
        )}

        {selectedServices.includes("whatsapp") && (
          <div
            className="service-section"
            style={{
              border: `1px solid ${theme.vars?.palette.divider}`,
              borderRadius: "8px",
              padding: "16px",
              marginBottom: "16px",
            }}
          >
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                margin: "0 0 16px 0",
              }}
            >
              <h3
                style={{
                  margin: 0,
                  color: theme.vars?.palette.text.secondary,
                }}
              >
                WhatsApp
              </h3>
              <button
                onClick={() => removeService("whatsapp")}
                className="remove-btn"
                aria-label="Remove WhatsApp service"
              >
                ×
              </button>
            </div>
            <WhatsappWrapper
              showBody={separateMessages.whatsapp}
              onValueChange={handleWhatsappValueChange}
              maxBlocks={5}
            />
            {validationResult?.whatsapp?.errors?.whatsapp &&
              Array.isArray(validationResult?.whatsapp?.errors?.whatsapp) &&
              validationResult?.whatsapp?.errors?.whatsapp?.length && (
                <div style={{ color: "red", fontSize: "12px" }}>
                  {validationResult.whatsapp.errors.whatsapp?.[0]}
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
              disabled={isSendButtonDisabled}
              onClick={handleSendToAllServices}
            />
          </div>
        )}

        {/* WhatsApp Section */}
      </div>
    </div>
  );
}
