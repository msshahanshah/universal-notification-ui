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
import {
  whatsappCallbackDataAtom,
  whatsappSectionsAtom,
} from "src/atoms/whatsappAtoms";

type ViewMode = "editor" | "preview";

interface WhatsappWrapperProps {
  showBody: boolean;
  onValueChange?: (values: { recipients: WhatsappRecipient[] }) => void;
  maxBlocks?: number;
}

export function WhatsappWrapper({
  showBody,
  onValueChange,
  maxBlocks = 5,
}: WhatsappWrapperProps) {
  const theme = useTheme();
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
  const [recipients, setRecipients] = useAtom(whatsappSectionsAtom);
  const [callbackData] = useAtom(whatsappCallbackDataAtom);
  const [attachmentInput, setAttachmentInput] = useState<
    Record<string, string>
  >({});
  const [view, setView] = useState<ViewMode>("editor");

  // Generate unique key for WhatsApp attachments
  const generateUniqueKey = (to: string, index: number) => {
    if (!to) return `whatsapp-${index + 1}`;

    const emailId = to
      .split("@")[0]
      .toLowerCase()
      .replace(/[^a-z0-9]/g, "");

    return `${emailId}-${index + 1}`;
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
        to: "",
        body: "",
        attachments: [],
        separateMessage: false,
        uniqueKey: "",
      },
    ]);
    // Initialize attachment input for new section
    setAttachmentInput((prev) => ({
      ...prev,
      [newId]: "",
    }));
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
    console.log("recipients", recipients);
    console.log("REC id", id);
    console.log("field", field, "value", value);
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
    if (recipient && recipient.to && urlArray.length > 0) {
      const index = recipients.findIndex((r) => r.id === recipientId);
      const uniqueKey = generateUniqueKey(recipient.to, index);
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

  return (
    <div className="email-wrapper">
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

          <Input
            label="To"
            type="number"
            id={`to-${recipient.id}`}
            placeholder="To"
            value={recipient.to}
            onChange={(e) => updateSection(recipient.id, "to", e.target.value)}
            required
            showAsteric={true}
            style={inputStyle}
          />

          <Input
            label="Template Id"
            type="text"
            id={`templateId-${recipient.id}`}
            placeholder="Template Id"
            value={recipient.templateId || ""}
            onChange={(e) =>
              updateSection(recipient.id, "templateId", e.target.value)
            }
            required
            // showAsteric={true}
            style={inputStyle}
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
            className="add-btn"
            style={{ width: "100%" }}
          >
            {recipient.separateMessage
              ? "Use common message"
              : "Send separate message"}
          </button>

          {recipient.separateMessage && (
            <div style={{ marginTop: 12 }}>
              <EmailEditor
                value={recipient.body}
                onChange={(value) => updateSection(recipient.id, "body", value)}
              />
            </div>
          )}

          {/* Attachments Section */}
          <div style={{ marginTop: 16 }}>
            <label
              style={{
                marginBottom: 4,
                fontSize: "12px",
                display: "block",
                color: theme.vars?.palette.text.secondary,
              }}
            >
              Attachments (URLs, comma-separated)
            </label>
            <div style={{ display: "flex", flexDirection: "row",alignItems:'flex-start' }}>
              <textarea
                className="sms-textarea"
                placeholder="Enter attachment URLs separated by commas..."
                value={attachmentInput[recipient.id] ?? ""}
                onChange={(e) =>
                  handleAttachmentUrlChange(recipient.id, e.target.value)
                }
                rows={3}
                style={{
                  width: "100%",
                  padding: "8px",
                  border: `1px solid ${theme.vars?.palette.divider}`,
                  borderRadius: "6px",
                  backgroundColor: theme.vars?.palette.background.paper,
                  color: theme.vars?.palette.text.secondary,
                  fontSize: "14px",
                  resize: "vertical",
                }}
              />
              {recipient.attachments && recipient.attachments.length > 0 && (
                <button
                  onClick={() => clearAttachments(recipient.id)}
                  className="remove-btn"
                  style={{ marginTop: 8 }}
                >
                  x
                </button>
              )}
            </div>
          </div>
        </div>
      ))}

      <AddButton
        title="Whatsapp"
        onClick={addSection}
        data={recipients}
        maxBlocks={maxBlocks}
      />
    </div>
  );
}
