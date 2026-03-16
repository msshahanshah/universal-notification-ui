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
import AttachmentSection from "../email/attachmentSection";

import "../SMS/sms-composer.css";
import {
  emailSectionsAtom,
  emailCallbackDataAtom,
  type EmailRecipient as EmailRecipientType,
} from "src/atoms/emailAtoms";

type ViewMode = "editor" | "preview";

type Attachment = {
  file: File;
  id: string;
  previewUrl?: string;
};

interface EmailWrapperProps {
  showBody: boolean;
  onValueChange?: (values: {
    from: string;
    recipients: EmailRecipientType[];
  }) => void;
  maxBlocks?: number;
}

export function EmailWrapper({
  showBody,
  onValueChange,
  maxBlocks = 5,
}: EmailWrapperProps) {
  // Replace local state with atoms
  const [recipients, setRecipients] = useAtom(emailSectionsAtom);
  const [callbackData] = useAtom(emailCallbackDataAtom);
  const [view, setView] = useState<ViewMode>("editor");

  // Generate unique key for each recipient
  const generateUniqueKey = (recipient: EmailRecipientType, index: number) => {
    if (recipient.to && recipient.subject) {
      // Extract email ID before @
      const emailId = recipient.to
        .split("@")[0]
        .toLowerCase()
        .replace(/[^a-z0-9]/g, "");
      // Clean subject (remove special chars, replace spaces with hyphens)
      const cleanSubject = recipient.subject
        .toLowerCase()
        .replace(/[^a-z0-9\s]/g, "")
        .replace(/\s+/g, "-");
      // Generate sequence number based on index + 1
      const sequence = index + 1;
      return `${cleanSubject}-${emailId}-${sequence}`;
    }
    return `email-${index + 1}`;
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

  function isBodyEmpty(html: any) {
    if (!html) return true;
    const div = document.createElement("div");
    div.innerHTML = html;
    return div.textContent.trim().length === 0;
  }

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
  };

  const removeSection = (id: string) => {
    if (recipients.length > 1) {
      setRecipients(recipients.filter((recipient) => recipient.id !== id));
    }
  };

  const updateSection = (
    id: string,
    field: keyof EmailRecipientType,
    value: any,
  ) => {
    setRecipients(
      recipients.map((recipient) =>
        recipient.id === id ? { ...recipient, [field]: value } : recipient,
      ),
    );
  };

  const handleAttachmentChange = (
    recipientId: string,
    e: React.ChangeEvent<HTMLInputElement>,
  ) => {
    const files = Array.from(e.target.files || []);

    if (!files.length) return;

    const newAttachments = files.map((file) => {
      const isImage = file.type.startsWith("image/");

      return {
        id: crypto.randomUUID(),
        name: file.name,
        size: file.size,
        type: file.type,
        file, // 🔥 store real File
        previewUrl: isImage ? URL.createObjectURL(file) : undefined,
      };
    });

    updateSection(recipientId, "attachments", [
      ...(recipients.find((r) => r.id === recipientId)?.attachments || []),
      ...newAttachments,
    ]);

    // allow re-selecting same file again
    e.target.value = "";
  };

  const removeAttachment = (recipientId: string, attachmentId: string) => {
    const recipient = recipients.find((r) => r.id === recipientId);
    if (recipient) {
      updateSection(
        recipientId,
        "attachments",
        recipient.attachments.filter((a) => a.id !== attachmentId),
      );
    }
  };

  return (
    <div className="email-wrapper">
      <div style={{ marginTop: 20, marginBottom: 12 }}>
        <Toggle
          options={[
            { label: "Editor", value: "editor" },
            { label: "Preview", value: "preview" },
          ]}
          value={view}
          onChange={(value) => setView(value as ViewMode)}
        />
      </div>

      {view === "editor" && (
        <>
          {recipients.map((recipient, index) => (
            <div
              key={recipient.id}
              style={{
                marginBottom: 16,
                padding: "12px",
                border: "1px solid rgba(255,255,255,0.1)",
                borderRadius: "8px",
              }}
            >
              {recipients.length > 1 && (
                <div
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    marginBottom: 12,
                  }}
                >
                  <span style={{ fontSize: "14px", fontWeight: "bold" }}>
                    Email {index + 1}
                  </span>
                  <button
                    onClick={() => removeSection(recipient.id)}
                    style={{
                      background: "transparent",
                      border: "none",
                      color: "#ff4444",
                      cursor: "pointer",
                      fontSize: "16px",
                    }}
                  >
                    ×
                  </button>
                </div>
              )}
              <Input
                label="From"
                subLabel="The email address field can be filled only if the 'From Email' option is enabled."
                className="sms-input"
                type="email"
                id={`from-${recipient.id}`}
                placeholder="from"
                value={recipient.from}
                onChange={(e) =>
                  updateSection(recipient.id, "from", e.target.value)
                }
              />

              <Input
                label="To"
                className="sms-input"
                type="email"
                id={`to-${recipient.id}`}
                placeholder="to"
                value={recipient.to}
                onChange={(e) =>
                  updateSection(recipient.id, "to", e.target.value)
                }
                required
              />

              <Input
                label="Cc"
                className="sms-input"
                type="email"
                id={`cc-${recipient.id}`}
                placeholder="Cc"
                value={recipient.cc}
                onChange={(e) =>
                  updateSection(recipient.id, "cc", e.target.value)
                }
              />

              <Input
                label="Bcc"
                className="sms-input"
                type="email"
                id={`bcc-${recipient.id}`}
                placeholder="Bcc"
                value={recipient.bcc}
                onChange={(e) =>
                  updateSection(recipient.id, "bcc", e.target.value)
                }
              />

              <Input
                label="Subject"
                className="sms-input"
                type="text"
                id={`subject-${recipient.id}`}
                placeholder="Email subject"
                value={recipient.subject}
                onChange={(e) =>
                  updateSection(recipient.id, "subject", e.target.value)
                }
                required
              />

              {/* Separate Message Toggle for each Email section */}
              <button
                onClick={() =>
                  updateSection(
                    recipient.id,
                    "separateMessage",
                    !recipient.separateMessage,
                  )
                }
                style={{
                  padding: "4px 8px",
                  fontSize: "10px",
                  background: recipient.separateMessage
                    ? "rgba(76, 175, 80, 0.2)"
                    : "rgba(255, 255, 255, 0.1)",
                  border: `1px solid ${recipient.separateMessage ? "#4CAF50" : "rgba(255, 255, 255, 0.2)"}`,
                  color: recipient.separateMessage ? "#4CAF50" : "#fff",
                  borderRadius: "4px",
                  cursor: "pointer",
                  transition: "all 0.2s",
                  marginTop: 8,
                  marginBottom: 8,
                  width: "100%",
                }}
              >
                {recipient.separateMessage
                  ? "Use common message"
                  : "Send separate message"}
              </button>

              {recipient.separateMessage && (
                <div style={{ marginTop: 12 }}>
                  <EmailEditor
                    value={recipient.body}
                    onChange={(value) =>
                      updateSection(recipient.id, "body", value)
                    }
                  />
                </div>
              )}

              {/* Attachments Section */}
              <div style={{ marginTop: 16 }}>
                <AttachmentSection
                  attachments={recipient.attachments}
                  onAdd={(e) => handleAttachmentChange(recipient.id, e)}
                  onRemove={(id) => removeAttachment(recipient.id, id)}
                />
              </div>
            </div>
          ))}

          <button
            onClick={addSection}
            disabled={recipients.length >= maxBlocks}
            style={{
              padding: "6px 12px",
              fontSize: "12px",
              background:
                recipients.length >= maxBlocks
                  ? "rgba(128, 128, 128, 0.2)"
                  : "rgba(255, 255, 255, 0.1)",
              border: `1px solid ${recipients.length >= maxBlocks ? "rgba(128, 128, 128, 0.4)" : "rgba(255, 255, 255, 0.2)"}`,
              color: recipients.length >= maxBlocks ? "#888" : "#fff",
              borderRadius: "6px",
              cursor:
                recipients.length >= maxBlocks ? "not-allowed" : "pointer",
              transition: "all 0.2s",
              marginTop: 8,
            }}
          >
            {recipients.length >= maxBlocks
              ? `Max ${maxBlocks} emails reached`
              : `Add Another Email (${recipients.length}/${maxBlocks})`}
          </button>
        </>
      )}

      {view === "preview" && (
        <div>
          {recipients.map((recipient, index) => (
            <div
              key={recipient.id}
              style={{
                marginBottom: 24,
                padding: "12px",
                border: "1px solid rgba(255,255,255,0.1)",
                borderRadius: "8px",
              }}
            >
              <h4
                style={{ margin: "0 0 12px 0", color: "rgba(255,255,255,0.8)" }}
              >
                Email {index + 1}
              </h4>
              <EmailPreview
                html={recipient.body}
                from={recipient.from}
                to={recipient.to}
                subject={recipient.subject}
                cc={recipient.cc}
                bcc={recipient.bcc}
                attachments={recipient.attachments}
              />
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
