import { useState } from "react";
import { useQueryClient } from "@tanstack/react-query";

import { GmailShell } from "src/components/EmailEditor/gmail-shell";
import { EmailEditor } from "src/components/EmailEditor/tiptap-email-editor";
import { EmailPreview } from "src/components/EmailEditor/email-preview";
import { Toggle } from "src/components/toggle";
import Button from "src/components/button";
import { useEmailService } from "src/hooks/useService";
import { useSnackbar } from "src/provider/snackbar";
import api from "src/lib/axios";
import { logsKeys } from "src/api/queryKeys";

import "./index.css";
import AttachmentSection from "./attachmentSection";

type ViewMode = "editor" | "preview";

type Attachment = {
  file: File;
  id: string;
  previewUrl?: string; // for images
};

type S3Item = {
  fileName: string;
  file: File; // your local file object
  s3: {
    url: string;
    fields: Record<string, string>;
  };
};

export default function EmailComposer() {
  const [view, setView] = useState<ViewMode>("editor");
  const [from, setFrom] = useState("");
  const [to, setTo] = useState("");
  const [cc, setCc] = useState("");
  const [bcc, setBcc] = useState("");
  const [subject, setSubject] = useState("");
  const [body, setBody] = useState("");
  const [attachments, setAttachments] = useState<Attachment[]>([]);
  const [hasErrors, setHasErrors] = useState(false);

  const queryClient = useQueryClient();

  const { mutate } = useEmailService();

  const showSnackbar = useSnackbar();

  function isBodyEmpty(html: any) {
    if (!html) return true;

    const div = document.createElement("div");
    div.innerHTML = html;

    // Get text content and trim whitespace
    return div.textContent.trim().length === 0;
  }

  const uploadToS3FromAttachments = async (data: any, attachmentsCopy: any) => {
    if (!data?.preSignedUrls?.length) return;

    for (let i = 0; i < data.preSignedUrls.length; i++) {
      const presigned = data.preSignedUrls[i];
      const fileObj = attachmentsCopy[i]?.file;

      if (!fileObj) continue;

      const formData = new FormData();

      // Append S3 fields
      Object.entries(presigned.s3.fields).forEach(([key, value]) => {
        formData.append(key, value as string);
      });

      // File MUST be last
      formData.append("file", fileObj);

      try {
        await api.post(presigned.s3.url, formData, {
          headers: { "Content-Type": "multipart/form-data", Authorization: `` },
        });

        setAttachments([]);
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
  };

  const handleSend = async () => {
    function sanitizeFileName(file: File) {
      return file.name;
    }

    const attachmentsCopy = [...attachments];

    const payload = {
      service: "email",
      destination: to.toLowerCase(),
      subject,
      body,
      fromEmail: from,
      cc,
      bcc,
      attachments: attachmentsCopy.map((a: any) => sanitizeFileName(a.file)), // ✅ only filenames
    };

    mutate(payload, {
      onSuccess: async (data) => {
        setTo("");
        setCc("");
        setBcc("");
        setFrom("");
        setSubject("");
        setBody("");

        if (
          (Array.isArray(attachmentsCopy) && !attachmentsCopy.length) ||
          attachmentsCopy.length === 0
        ) {
          queryClient.invalidateQueries({
            queryKey: logsKeys.all,
          });
          showSnackbar(data?.message || "Email sent successfully!", "success");
        } else {
          await uploadToS3FromAttachments(data, attachmentsCopy);
        }
      },
      onError: (error) => {
        showSnackbar(error?.message || "Failed to send email", "error");
      },
    });
  };

  const handleAttachmentChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);

    if (!files.length) return;

    setAttachments((prev) => [
      ...prev,
      ...files.map((file) => {
        const isImage = file.type.startsWith("image/");

        return {
          id: crypto.randomUUID(),
          name: file.name,
          size: file.size,
          type: file.type,
          file, // 🔥 store real File
          previewUrl: isImage ? URL.createObjectURL(file) : undefined,
        };
      }),
    ]);

    // allow re-selecting same file again
    e.target.value = "";
  };

  const removeAttachment = (id: string) => {
    setAttachments((prev) => prev.filter((a) => a.id !== id));
  };

  const isDisabled = !from || !subject || !to || isBodyEmpty(body) || hasErrors;

  return (
    <div style={pageStyle}>
      {/* Left column */}
      <div style={column}>
        <div
          style={{
            display: "flex",
            justifyContent: "center",
            marginBottom: 12,
          }}
        >
          <Toggle<ViewMode>
            value={view}
            onChange={setView}
            options={[
              { label: "Editor", value: "editor" },
              { label: "Preview", value: "preview" },
            ]}
          />
        </div>

        {view === "editor" && (
          <>
            <GmailShell
              from={from}
              to={to}
              cc={cc}
              bcc={bcc}
              subject={subject}
              setFrom={setFrom}
              setTo={setTo}
              setSubject={setSubject}
              setCc={setCc}
              setBcc={setBcc}
              onValidationChange={setHasErrors}
              attachments={attachments}
              setAttachments={setAttachments}
            />
            <EmailEditor value={body} onChange={setBody} />
            <AttachmentSection
              attachments={attachments}
              onAdd={handleAttachmentChange}
              onRemove={removeAttachment}
            />
          </>
        )}

        {view === "preview" && (
          <div style={{ display: view === "preview" ? "block" : "none" }}>
            <EmailPreview
              html={body}
              from={from}
              to={to}
              cc={cc}
              bcc={bcc}
              subject={subject}
              attachments={attachments}
            />
          </div>
        )}
        <div className="email-footer">
          <Button
            disabled={isDisabled}
            label="Send"
            className={isDisabled ? "button-disabled" : "send-btn"}
            onClick={handleSend}
          />
        </div>
      </div>
    </div>
  );
}

const pageStyle: React.CSSProperties = {
  display: "flex",
  gap: 16,
  height: "100vh",
  padding: 16,
};
const column: React.CSSProperties = {
  flex: 1,
  display: "flex",
  flexDirection: "column",
};
