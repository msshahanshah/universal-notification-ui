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
import { validateAllServices } from "src/layouts/dashboard/services/multiple-notification/validation";
import { formatNumbersForUniqueKey } from "src/utility/whatsapp";

import { SMSWrapper } from "./sms-wrapper";
import { EmailWrapper } from "./email-wrapper";
import { SlackWrapper } from "./slack-wrapper";
import { WhatsappWrapper } from "./whatsapp-wrapper";
import { ServiceType, MultipleNotificationPayload } from "./types";

import "./index.css";
import { useTextareaStyles } from "src/utility/styles";

export default function MultipleNotification() {
  const theme = useTheme();
  const queryClient = useQueryClient();
  const textAreaStyle = useTextareaStyles();

  const { mutate: sendNotifications, isPending } =
    useMultipleNotificationService();

  const showSnackbar = useSnackbar();

  const getFileFromUrl = (urlEntry: any, attachments: any[]) => {
    const filename = urlEntry.s3.fields?.key?.split("/").pop();

    const file = attachments.find((f: any) => f.name === filename);

    if (!file) {
      console.warn(`No file found for URL with filename: ${filename}`);
      return null;
    }

    return file;
  };

  const createFormData = (urlEntry: any, file: any) => {
    const formData = new FormData();

    Object.entries(urlEntry.s3.fields).forEach(([key, value]) => {
      formData.append(key, value as string);
    });

    formData.append("file", file);

    return formData;
  };

  const uploadFile = async (serviceKey: string, urlEntry: any, file: any) => {
    const formData = createFormData(urlEntry, file);

    try {
      await api.post(urlEntry.s3.url, formData, {
        headers: {
          "Content-Type": "multipart/form-data",
          Authorization: ``,
        },
      });
    } catch (err) {
      console.error(`❌ Upload failed for ${serviceKey}:`, file.name, err);

      setTimeout(() => {
        showSnackbar(
          `${serviceKey.charAt(0).toUpperCase() + serviceKey.slice(1)}: Failed to upload attachments`,
          "error",
        );
      }, 30000);

      throw err;
    }
  };

  const processUrls = async (
    serviceKey: string,
    urls: any[],
    attachments: any[],
  ) => {
    if (!urls?.length) return;

    for (const urlEntry of urls) {
      const file = getFileFromUrl(urlEntry, attachments);
      if (!file) continue;

      await uploadFile(serviceKey, urlEntry, file);
    }
  };

  const processPreSigned = async (
    serviceKey: string,
    preSignedUrls: any[],
    attachments: any[],
  ) => {
    if (!preSignedUrls?.length) return;

    for (const presigned of preSignedUrls) {
      await processUrls(serviceKey, presigned?.urls, attachments);
    }
  };

  const uploadToS3FromAttachments = async (data: any, attachmentsCopy: any) => {
    for (const [serviceKey, serviceData] of Object.entries(data || {})) {
      await processPreSigned(
        serviceKey,
        (serviceData as any)?.preSignedUrls,
        attachmentsCopy,
      );
    }

    queryClient.invalidateQueries({
      queryKey: logsKeys.all,
    });
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

  function renameDuplicateFiles(files: File[]): File[] {
    const nameCount = new Map<string, number>();

    return files.map((file) => {
      const originalName = file.name;
      const dotIndex = originalName.lastIndexOf(".");

      const baseName =
        dotIndex !== -1 ? originalName.slice(0, dotIndex) : originalName;

      const extension = dotIndex !== -1 ? originalName.slice(dotIndex) : "";

      // Initialize counter
      if (!nameCount.has(baseName)) {
        nameCount.set(baseName, 0);
        return file; // first occurrence stays same
      }

      // Increment count
      const count = nameCount.get(baseName)! + 1;
      nameCount.set(baseName, count);

      const newName = `${baseName}${count}${extension}`;

      return new File([file], newName, { type: file.type });
    });
  }

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

  const buildWhatsappPayload = () => {
    const recipients = wrapperValues.whatsapp?.recipients || [];

    return recipients
      .filter(
        (rec: any) =>
          rec?.destination?.trim() !== "" ||
          rec?.templateId ||
          rec?.separateMessage,
      )
      .map((rec: any, index: number) => {
        const whatsappSection: any = {
          destination: rec.destination,
        };

        const uniqueKey = `${rec.destination}-${index + 1}`;

        if (uniqueKey) {
          whatsappSection.uniqueKey = uniqueKey;
        }

        // Attachments
        if (rec.attachments && rec.attachments.length > 0) {
          whatsappSection.attachments = rec.attachments.map(
            (att: any) => att.url || att,
          );
        }

        // Message logic (same as original)
        if (
          !rec?.templateId &&
          (rec.separateMessage || !commonMessage.trim())
        ) {
          whatsappSection.message = rec.message || "";
        }

        // Template logic
        if (rec?.templateId) {
          whatsappSection.templateId = rec.templateId;
          whatsappSection.variableValues = rec.variableValues;
        }

        return whatsappSection;
      });
  };

  const buildEmailPayload = () => {
    const recipients = wrapperValues.email?.recipients || [];

    return recipients
      .filter((rec: any) => rec?.destination?.trim() !== "")
      .map((rec: any, index: number) => {
        const des = rec.destination
          .split("@")[0]
          .toLowerCase()
          .replace(/[^a-z0-9]/g, "");

        const cleanSubject = rec.subject
          .toLowerCase()
          .replace(/[^a-z0-9\s]/g, "")
          .replace(/\s+/g, "-");

        return {
          destination: rec.destination,
          subject: rec.subject,
          fromEmail: rec.fromEmail,
          uniqueKey: `${cleanSubject}-${des}-${index + 1}`,
          cc: rec.cc,
          bcc: rec.bcc,
          attachments:
            rec.attachments?.map((att: any) =>
              typeof att === "string" ? att : null,
            ) || [],
          body: isBodyEmpty(rec.body) ? "" : rec.body,
        };
      });
  };

  const buildSlackPayload = () => {
    const sections = wrapperValues.slack?.sections || [];

    return sections.map((section: any) => {
      const slackSection: any = {
        destination: section.destination,
      };

      if (section.message) {
        slackSection.message = section.message;
      }

      return slackSection;
    });
  };

  const buildSmsPayload = () => {
    const sections = wrapperValues.sms?.sections || [];

    const isDisabled = checkValidRecipientsforSMSWrapper(
      sections,
      commonMessage,
    );

    if (isDisabled) {
      showSnackbar("SMS validations failed", "error");
      return null; // important: caller should handle this
    }

    return sections.map((section: any) => ({
      destination: section.destination,
      message: section.message,
    }));
  };

  const buildPayload = (): MultipleNotificationPayload => {
    const payload: MultipleNotificationPayload = { commonMessage };

    if (selectedServices.includes("sms")) {
      const smsPayload = buildSmsPayload();
      if (!smsPayload) return null; // stop execution
      payload.sms = smsPayload;
    }

    if (selectedServices.includes("email")) {
      payload.email = buildEmailPayload();
    }

    if (selectedServices.includes("slack")) {
      payload.slack = buildSlackPayload();
    }

    if (selectedServices.includes("whatsapp")) {
      payload.whatsapp = buildWhatsappPayload();
    }

    return payload;
  };

  const processAttachments = (payload: any) => {
    const allFinalAttachments: any[] = [];

    const processEmailAttachments = () => {
      payload.email?.forEach((email: any) => {
        if (!email.attachments?.length) return;

        const recipient = emailRawRecipients.find(
          (rec) =>
            rec.to === email.destination ||
            rec.destination === email.destination,
        );

        if (!recipient) return;

        const files = recipient.attachments
          .map((att: any) => att.file)
          .filter((file: any) => file instanceof File);

        const renamed = renameDuplicateFiles(files);

        email.attachments = renamed.map((f) => f.name);
        allFinalAttachments.push(...renamed);
      });
    };

    const processWhatsappAttachments = () => {
      payload.whatsapp?.forEach((whatsapp: any) => {
        if (!whatsapp.attachments?.length) return;

        const firstNumber = whatsapp.destination.split(",")[0].trim();

        const recipient = whatsappRawRecipients.find(
          (rec) => formatNumbersForUniqueKey(rec.numbers) === firstNumber,
        );

        if (!recipient) return;

        const files = recipient.attachments
          .map((att: any) => att.file)
          .filter((file: any) => file instanceof File);

        const renamed = renameDuplicateFiles(files);

        whatsapp.attachments = renamed.map((f) => f.name);
        allFinalAttachments.push(...renamed);
      });
    };

    processEmailAttachments();
    processWhatsappAttachments();

    const hasAttachments = allFinalAttachments.length > 0;

    return { allFinalAttachments, hasAttachments };
  };

  const buildStatusMessages = (data: any) => {
    const services = ["sms", "email", "slack", "whatsapp"];

    return services
      .filter((s) => selectedServices.includes(s))
      .map((service) => {
        const res = data?.[service];

        if (!res) return null;

        const success = res.success;

        return `${service.toUpperCase()}: ${
          res.message ||
          (success
            ? "Notification request accepted and queued."
            : "Failed to send notification")
        }`;
      })
      .filter(Boolean);
  };

  const resetAllForms = () => {
    setCommonMessage("");

    setSelectedServices([]);

    setSeparateMessages({
      sms: false,
      email: false,
      slack: false,
      whatsapp: false,
    });

    resetEmailFields();
    resetSmsFields();
    resetSlackFields();
    resetWhatsappFields();
  };

  const handleSuccess = async (
    { data }: any,
    hasAttachments: boolean,
    attachments: any[],
  ) => {
    resetAllForms();

    const messages = buildStatusMessages(data);

    const hasFailure = messages.some((m) => m.includes("Failed"));

    showSnackbar(messages.join("\n"), hasFailure ? "error" : "success", 30000);

    if (!hasAttachments || attachments.length === 0) {
      queryClient.invalidateQueries({ queryKey: logsKeys.all });
    } else if (data?.email?.success || data?.whatsapp?.success) {
      await uploadToS3FromAttachments(data, attachments);
    }
  };

  const handleError = (error: any) => {
    const errorData = error?.data || {};
    const messages = buildStatusMessages(errorData, true);

    showSnackbar(messages.join("\n"), "error", 30000);
  };

  const handleSendToAllServices = () => {
    const payload = buildPayload();

    const { allFinalAttachments, hasAttachments } = processAttachments(payload);

    console.log("payload",payload)
    // sendNotifications(payload, {
    //   onSuccess: (res) =>
    //     handleSuccess(res, hasAttachments, allFinalAttachments),
    //   onError: handleError,
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
            style={textAreaStyle}
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
              validationResult?.sms?.errors?.sms?.length > 0 && (
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
              onValueChange={handleEmailValueChange}
              maxBlocks={5}
              commonMessage={commonMessage}
            />
            {validationResult?.email?.errors?.email &&
              Array.isArray(validationResult?.email?.errors?.email) &&
              validationResult?.email?.errors?.email?.length > 0 && (
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
              validationResult?.slack?.errors?.slack?.length > 0 && (
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
              validationResult?.whatsapp?.errors?.whatsapp?.length > 0 && (
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
