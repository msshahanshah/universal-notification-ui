import { useEffect, useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { useAtom } from "jotai";

import { useEmailService } from "src/hooks/useService";
import Button from "src/components/button";
import Input from "src/components/input";
import { useSnackbar } from "src/provider/snackbar";
import { logsKeys } from "src/api/queryKeys";
import { EmailEditor } from "src/components/EmailEditor/tiptap-email-editor";
import { EmailPreview } from "src/components/EmailEditor/email-preview";
import { Toggle } from "src/components/toggle";

import "../SMS/sms-composer.css";
import "./index.css";
import { type WhatsappRecipient } from "src/atoms/whatsappAtoms";
import { useTheme } from "@mui/material/styles";
import { AddButton } from "./helper";
import AttachmentSection from "../email/attachmentSection";
import { renameDuplicateFiles } from "src/utility/helper";
import {
  whatsappCallbackDataAtom,
  whatsappSectionsAtom,
} from "src/atoms/whatsappAtoms";
import { useTemplates } from "src/hooks/useTemplates";
import { Template } from "src/api/service.api";
import { Select } from "src/components/select";
import { CountryCodeSelect } from "../SMS/country-code-select";
import { formatNumbersForUniqueKey, WhatsAppNumber } from "src/utility/whatsapp";

type ViewMode = "editor" | "preview";

type Attachment = {
  file: File;
  id: string;
  name: string;
  previewUrl?: string;
};

interface WhatsappWrapperProps {
  onValueChange?: (values: { recipients: WhatsappRecipient[] }) => void;
  maxBlocks?: number;
}

export function WhatsappWrapper({
  onValueChange,
  maxBlocks = 5,
}: WhatsappWrapperProps) {
  const theme = useTheme();
  const [recipients, setRecipients] = useAtom(whatsappSectionsAtom);
  const [attachmentInput, setAttachmentInput] = useState<
    Record<string, string>
  >({});

  // Fetch WhatsApp templates
  const {
    data: templates = [],
    isLoading: templatesLoading,
    error: templatesError,
  } = useTemplates("whatsapp");

  const inputStyle: React.CSSProperties = {
    backgroundColor: theme.vars?.palette.background.paper,
    color: theme.vars?.palette.text.secondary,
    border: `1px solid ${theme.vars?.palette.divider} !important`,
    width: "100%",
    height: 42,
    marginBottom: 12,
    padding: "0 12px",
    borderRadius: 6,
  };
  // Replace local state with atoms

  const [callbackData] = useAtom(whatsappCallbackDataAtom);

  // Generate unique key for WhatsApp attachments
  const generateUniqueKey = (numbers: WhatsAppNumber[], index: number) => {
    const phoneNumber = formatNumbersForUniqueKey(numbers);
    if (!phoneNumber) return `whatsapp-${index + 1}`;

    // Remove non-alphanumeric characters from phone number for clean key
    const cleanNumber = phoneNumber.replace(/[^a-z0-9]/gi, "");

    return `${cleanNumber}-${index + 1}`;
  };

  const queryClient = useQueryClient();
  const { mutate } = useEmailService();
  const showSnackbar = useSnackbar();

  // Pass values to parent whenever they change (using computed atom)
  useEffect(() => {
    if (onValueChange) {
      onValueChange(callbackData);
    }
  }, [callbackData, onValueChange]);

  const addSection = () => {
    if (recipients.length >= maxBlocks) {
      return; // Don't add more than maxBlocks
    }
    const newId = (
      Math.max(...recipients.map((r) => parseInt(r.id))) + 1
    ).toString();
    setRecipients([
      ...recipients,
      {
        id: newId,
        numbers: [{ id: "1", countryCode: "+91", number: "" }],
        message: "",
        attachments: [],
        separateMessage: false,
        uniqueKey: "",
        templateId: null,
        variableValues: {},
        attachmentType: "url",
        selectedTemplate: null,
        toggleType: "template",
      },
    ]);
    // Initialize attachment input for new section
    setAttachmentInput((prev) => ({
      ...prev,
      [newId]: "",
    }));
  };

  const handleTemplateSelect = (recipientId: string, templateId: string) => {
    const template = templates.find((t) => t.templateId === templateId);

    if (template) {
      // Update templateId and selectedTemplate
      updateSection(recipientId, "templateId", templateId);
      updateSection(recipientId, "selectedTemplate", template);

      // Generate variableValues from requiredFields
      const variableValues = template.requiredFields.reduce(
        (acc, field) => {
          acc[field.name] = "";
          return acc;
        },
        {} as Record<string, string>,
      );

      updateSection(recipientId, "variableValues", variableValues);
    } else {
      // Clear template and variables
      updateSection(recipientId, "templateId", null);
      updateSection(recipientId, "selectedTemplate", null);
      updateSection(recipientId, "variableValues", {});
    }
  };

  const handleToggleChange = (
    recipientId: string,
    toggleType: "template" | "non-template",
  ) => {
    updateSection(recipientId, "toggleType", toggleType);

    if (toggleType === "template") {
      // Clear non-template fields when switching to template mode
      updateSection(recipientId, "message", "");
      updateSection(recipientId, "attachments", []);
      updateSection(recipientId, "separateMessage", false);
      updateSection(recipientId, "uniqueKey", "");
    } else {
      // Clear template fields when switching to non-template mode
      updateSection(recipientId, "templateId", null);
      updateSection(recipientId, "selectedTemplate", null);
      updateSection(recipientId, "variableValues", {});
    }
  };

  // Number management functions within sections
  const addNumberToSection = (recipientId: string) => {
    setRecipients(
      recipients.map((recipient) => {
        if (recipient.id === recipientId) {
          const newId = (
            Math.max(...recipient.numbers.map((n) => parseInt(n.id))) + 1
          ).toString();
          return {
            ...recipient,
            numbers: [
              ...recipient.numbers,
              { id: newId, countryCode: "+91", number: "" },
            ],
          };
        }
        return recipient;
      }),
    );
  };

  const removeNumberFromSection = (recipientId: string, numberId: string) => {
    setRecipients(
      recipients.map((recipient) => {
        if (recipient.id === recipientId && recipient.numbers.length > 1) {
          return {
            ...recipient,
            numbers: recipient.numbers.filter((num) => num.id !== numberId),
          };
        }
        return recipient;
      }),
    );
  };

  const updateNumberInSection = (
    recipientId: string,
    numberId: string,
    field: keyof WhatsAppNumber,
    value: string,
  ) => {
    setRecipients(
      recipients.map((recipient) => {
        if (recipient.id === recipientId) {
          return {
            ...recipient,
            numbers: recipient.numbers.map((num) =>
              num.id === numberId ? { ...num, [field]: value } : num,
            ),
          };
        }
        return recipient;
      }),
    );
  };

  const removeSection = (id: string) => {
    if (recipients.length > 1) {
      setRecipients(recipients.filter((recipient) => recipient.id !== id));
      // Clean up attachment input state
      setAttachmentInput((prev) => {
        const newState = { ...prev };
        delete newState[id];
        return newState;
      });
    }
  };

  const updateSection = (
    id: string,
    field: keyof WhatsappRecipient,
    value: any,
  ) => {
    // ✅ prev is always the latest state, not a stale closure
    setRecipients((prev) =>
      prev.map((recipient) =>
        recipient.id == id ? { ...recipient, [field]: value } : recipient,
      ),
    );
  };

  const handleAttachmentUrlChange = (recipientId: string, value: string) => {
    // store raw input (this fixes typing issue)
    setAttachmentInput((prev) => ({
      ...prev,
      [recipientId]: value,
    }));

    const urlArray = value
      .split(",")
      .map((url) => url.trim())
      .filter(Boolean);

    const attachmentObjects = urlArray.map((url) => ({
      id: crypto.randomUUID(),
      name: url,
      url: url,
    }));

    updateSection(recipientId, "attachments", attachmentObjects);

    const recipient = recipients.find((r) => r.id === recipientId);
    if (recipient && recipient.numbers && urlArray.length > 0) {
      const index = recipients.findIndex((r) => r.id === recipientId);
      const uniqueKey = generateUniqueKey(recipient.numbers, index);
      updateSection(recipientId, "uniqueKey", uniqueKey);
    }
  };

  const clearAttachments = (recipientId: string) => {
    updateSection(recipientId, "attachments", []);
    updateSection(recipientId, "uniqueKey", "");
    // Clear the input field as well
    setAttachmentInput((prev) => ({
      ...prev,
      [recipientId]: "",
    }));
  };

  const handleFileAttachmentChange = (recipientId: string, files: FileList) => {
    const recipient = recipients.find((r) => r.id === recipientId);
    if (!recipient) return;

    // Check attachment limit (max 10)
    const currentCount = recipient.attachments.length;
    const newFilesCount = files.length;
    if (currentCount + newFilesCount > 10) {
      // Show error or limit to 10
      const allowedFiles = Array.from(files).slice(0, 10 - currentCount);
      processFiles(recipientId, allowedFiles);
      return;
    }

    processFiles(recipientId, Array.from(files));
  };

  const processFiles = (recipientId: string, files: File[]) => {
    const recipient = recipients.find((r) => r.id === recipientId);
    if (!recipient) return;

    // Rename duplicate files and create attachment objects
    const renamedFiles = renameDuplicateFiles(files, recipient.attachments);
    const attachmentObjects = renamedFiles.map((file) => ({
      id: crypto.randomUUID(),
      name: file.name,
      file: file,
      previewUrl: URL.createObjectURL(file),
    }));

    // Update attachments
    const updatedAttachments = [...recipient.attachments, ...attachmentObjects];
    updateSection(recipientId, "attachments", updatedAttachments);

    // Auto-generate uniqueKey when attachments are added
    if (recipient.numbers && updatedAttachments.length > 0) {
      const index = recipients.findIndex((r) => r.id === recipientId);
      const uniqueKey = generateUniqueKey(recipient.numbers, index);
      updateSection(recipientId, "uniqueKey", uniqueKey);
    }
  };

  const removeFileAttachment = (recipientId: string, attachmentId: string) => {
    const recipient = recipients.find((r) => r.id === recipientId);
    if (recipient) {
      const updatedAttachments = recipient.attachments.filter(
        (a) => a.id !== attachmentId,
      );
      updateSection(recipientId, "attachments", updatedAttachments);

      // Clear uniqueKey if no attachments remain
      if (updatedAttachments.length === 0) {
        updateSection(recipientId, "uniqueKey", "");
      }
    }
  };

  return (
    <div className="email-wrapper">
      {recipients.map((recipient, index) => {
        const hideFields = !recipient.selectedTemplate;
        return (
          <div
            key={recipient.id}
            style={{
              marginBottom: 16,
              padding: "12px",
              border: "1px solid rgba(255,255,255,0.1)",
              borderRadius: "8px",
            }}
          >
            {recipients.length >= 1 && (
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  marginBottom: 12,
                }}
              >
                <span
                  style={{
                    fontSize: "14px",
                    fontWeight: "bold",
                    color: theme.vars?.palette.text.secondary,
                  }}
                >
                  Whatsapp Section {index + 1}
                </span>
                {index !== 0 && (
                  <button
                    onClick={() => removeSection(recipient.id)}
                    className="remove-btn"
                  >
                    ×
                  </button>
                )}
              </div>
            )}
            <label
              style={{
                fontSize: "12px",
                color: theme.vars?.palette.text.secondary,
              }}
            >
              Phone number
              <span style={{ color: "red", marginLeft: 2 }}>*</span>
            </label>

            {recipient.numbers.map((num, numIndex) => (
              <div
                key={num.id}
                className="whatsapp-to-row"
                style={{ marginBottom: 8, display: "flex", gap: 8, alignItems: "center" }}
              >
                <CountryCodeSelect
                  value={num.countryCode}
                  onChange={(value) =>
                    updateNumberInSection(
                      recipient.id,
                      num.id,
                      "countryCode",
                      value,
                    )
                  }
                />
                <Input
                  id={`whatsapp-number-${num.id}`}
                  type="tel"
                  placeholder="Enter receiver number"
                  value={num.number}
                  inputMode="numeric"
                  onChange={(e) => {
                    const onlyNums = e.target.value.replace(/\D/g, ""); // remove non-digits
                    updateNumberInSection(recipient.id, num.id, "number", onlyNums);
                  }}
                  style={{ flex: 1, ...inputStyle }}
                />
                {recipient.numbers.length > 1 && (
                  <button
                    onClick={() => removeNumberFromSection(recipient.id, num.id)}
                    className="remove-btn"
                    style={{ marginLeft: 8 }}
                  >
                    ×
                  </button>
                )}
              </div>
            ))}
            <button
              label="Add Another Number"
              onClick={() => addNumberToSection(recipient.id)}
              className="add-btn"
              style={{ width: "100%", marginTop: 8 }}
            >
              Add Another Number
            </button>
            <div
              style={{
                marginTop: 16,
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
              }}
            >
              <label
                style={{
                  marginBottom: 4,
                  fontSize: "12px",
                  display: "block",
                  color: theme.vars?.palette.text.secondary,
                }}
              >
                Message Type
              </label>
              <Toggle<"template" | "non-template">
                value={recipient.toggleType}
                onChange={(value) => handleToggleChange(recipient.id, value)}
                options={[
                  { label: "Use Template", value: "template" },
                  { label: "Custom Message", value: "non-template" },
                ]}
                style={{ fontSize: 12 }}
                textStyle={{ fontSize: 12 }}
              />
            </div>
            {recipient.toggleType === "template" && (
              <div style={{ marginTop: 16 }}>
                <label
                  style={{
                    marginBottom: 4,
                    fontSize: "12px",
                    display: "block",
                    color: theme.vars?.palette.text.secondary,
                  }}
                >
                  Template
                </label>
                <Select
                  value={recipient.templateId || ""}
                  onChange={(value: string) =>
                    handleTemplateSelect(recipient.id, value)
                  }
                  options={[
                    { value: "", label: "Select a template" },
                    ...templates.map((template) => ({
                      value: template.templateId,
                      label: template.name,
                    })),
                  ]}
                  placeholder="Select a template"
                  disabled={templatesLoading}
                  style={{
                    width: "100%",
                    marginBottom: "12px",
                  }}
                  dropdownStyle={{
                    height: 100
                  }}
                />
                {templatesError && (
                  <div
                    style={{
                      color: "red",
                      fontSize: "12px",
                      marginBottom: "8px",
                    }}
                  >
                    Failed to load templates
                  </div>
                )}
                {recipient.selectedTemplate && (
                  <div
                    style={{
                      padding: "8px",
                      backgroundColor: theme.vars?.palette.background.default,
                      border: `1px solid ${theme.vars?.palette.divider}`,
                      borderRadius: "4px",
                      fontSize: "12px",
                      color: theme.vars?.palette.text.secondary,
                      marginBottom: "8px",
                    }}
                  >
                    <div style={{ fontWeight: "bold", marginBottom: "4px" }}>
                      Template Preview:
                    </div>
                    <div>{recipient.selectedTemplate.messageContent}</div>
                  </div>
                )}
              </div>
            )}
            {/* Variable Values Section */}
            {recipient.toggleType === "template" &&
              recipient.selectedTemplate && (
                <div style={{ marginTop: 16 }}>
                  <label
                    style={{
                      marginBottom: 8,
                      fontSize: "12px",
                      display: "block",
                      color: theme.vars?.palette.text.secondary,
                    }}
                  >
                    Template Variables
                  </label>
                  <div style={{ marginBottom: 8, marginInline: 20 }}>
                    {recipient.selectedTemplate.requiredFields.map(
                      (field, index) => (
                        <div
                          key={`${recipient.id}-${field.name}`}
                          style={{
                            display: "flex",
                            gap: 8,
                            marginBottom: 8,
                            alignItems: "center",
                          }}
                        >
                          <Input
                            id={`variableKey-${recipient.id}-${field.name}`}
                            label={`Parameter ${index + 1}`}
                            type="text"
                            placeholder={`{{${field.name}}}`}
                            value={`{{${field.name}}}`}
                            readOnly
                            style={{
                              flex: 1,
                              ...inputStyle,
                              backgroundColor:
                                theme.vars?.palette.background.default,
                              cursor: "not-allowed",
                            }}
                          />
                          <Input
                            id={`variableValue-${recipient.id}-${field.name}`}
                            label={`Value ${index + 1}`}
                            type="text"
                            placeholder="Enter value"
                            value={recipient.variableValues?.[field.name] || ""}
                            onChange={(e) => {
                              const newValues = { ...recipient.variableValues };
                              newValues[field.name] = e.target.value;
                              updateSection(
                                recipient.id,
                                "variableValues",
                                newValues,
                              );
                            }}
                            style={{ flex: 1, ...inputStyle }}
                          />
                        </div>
                      ),
                    )}
                  </div>
                </div>
              )}
            {/* Separate Message Toggle for each Email section - Show only in non-template mode */}
            {recipient.toggleType === "non-template" && (
              <button
                onClick={() =>
                  updateSection(
                    recipient.id,
                    "separateMessage",
                    !recipient.separateMessage,
                  )
                }
                className="add-btn"
                style={{ width: "100%" }}
              >
                {recipient.separateMessage
                  ? "Use common message"
                  : "Send separate message"}
              </button>
            )}

            {recipient.separateMessage &&
              recipient.toggleType === "non-template" && (
                <Input
                  label="Separate Message"
                  type="text"
                  id={`message-${recipient.message}`}
                  placeholder="Separate Message"
                  value={recipient.message}
                  onChange={(e) =>
                    updateSection(recipient.id, "message", e.target.value)
                  }
                  style={inputStyle}
                />
              )}
            {/* Attachment Type Dropdown - Show only in non-template mode */}
            {recipient.toggleType === "non-template" && (
              <div style={{ marginTop: 16 }}>
                <label
                  style={{
                    marginBottom: 4,
                    fontSize: "12px",
                    display: "block",
                    color: theme.vars?.palette.text.secondary,
                  }}
                >
                  Attachment Type
                </label>
                <Select
                  value={recipient.attachmentType}
                  onChange={(value: string) => {
                    // Clear attachments when switching types
                    updateSection(recipient.id, "attachments", []);
                    updateSection(recipient.id, "uniqueKey", "");
                    updateSection(
                      recipient.id,
                      "attachmentType",
                      value as "file" | "url",
                    );
                  }}
                  options={[
                    { value: "url", label: "Public URLs" },
                    { value: "file", label: "File Attachments" },
                  ]}
                  placeholder="Select attachment type"
                  style={{
                    width: "100%",
                  }}
                   dropdownStyle={{
                    height: 100
                  }}
                />
              </div>
            )}

            {/* Conditional Attachments Section - Show only in non-template mode */}
            {recipient.toggleType === "non-template" && (
              <div style={{ marginTop: 16 }}>
                {recipient.attachmentType === "url" ? (
                  <>
                    <label
                      style={{
                        marginBottom: 4,
                        fontSize: "12px",
                        display: "block",
                        color: theme.vars?.palette.text.secondary,
                      }}
                    >
                      Attachments (URLs, comma-separated) (Max 10)
                    </label>
                    <div
                      style={{
                        display: "flex",
                        flexDirection: "row",
                        alignItems: "flex-start",
                      }}
                    >
                      <textarea
                        className="sms-textarea"
                        placeholder="Enter attachment URLs separated by commas..."
                        value={attachmentInput[recipient.id] ?? ""}
                        onChange={(e) =>
                          handleAttachmentUrlChange(
                            recipient.id,
                            e.target.value,
                          )
                        }
                        rows={3}
                        style={{
                          width: "100%",
                          padding: "8px",
                          border: `1px solid ${theme.vars?.palette.divider}`,
                          borderRadius: "6px",
                          backgroundColor: theme.vars?.palette.background.paper,
                          color: theme.vars?.palette.text.secondary,
                          fontSize: "12px",
                          resize: "vertical",
                        }}
                      />
                      {recipient.attachments &&
                        recipient.attachments.length > 0 && (
                          <button
                            onClick={() => clearAttachments(recipient.id)}
                            className="remove-btn"
                            style={{ marginTop: 8 }}
                          >
                            x
                          </button>
                        )}
                    </div>
                  </>
                ) : (
                  recipient.toggleType === "non-template" && (
                    <>
                      <label
                        style={{
                          marginBottom: 4,
                          fontSize: "12px",
                          display: "block",
                          color: theme.vars?.palette.text.secondary,
                        }}
                      >
                        File Attachments (Max 10)
                      </label>
                      <AttachmentSection
                        attachments={recipient.attachments}
                        onAdd={(e) =>
                          handleFileAttachmentChange(
                            recipient.id,
                            e.target.files,
                          )
                        }
                        onRemove={(id) =>
                          removeFileAttachment(recipient.id, id)
                        }
                        hideBtn={recipient.attachments.length >= 10}
                      />
                    </>
                  )
                )}
              </div>
            )}
          </div>
        );
      })}

      <AddButton
        title="Whatsapp"
        onClick={addSection}
        data={recipients}
        maxBlocks={maxBlocks}
      />
    </div>
  );
}
