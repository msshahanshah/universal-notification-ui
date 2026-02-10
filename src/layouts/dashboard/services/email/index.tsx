import { useState } from "react";

import { GmailShell } from "src/components/EmailEditor/gmail-shell";
import { EmailEditor } from "src/components/EmailEditor/tiptap-email-editor";
import { EmailPreview } from "src/components/EmailEditor/email-preview";
import { Toggle } from "src/components/toggle";
import Button from "src/components/button";
import { useEmailService } from "src/hooks/useService";
import { useSnackbar } from "src/provider/snackbar";

import "./index.css";

type ViewMode = "editor" | "preview";

export default function EmailComposer() {
  const [view, setView] = useState<ViewMode>("editor");
  const [from, setFrom] = useState("");
  const [to, setTo] = useState("");
  const [cc, setCc] = useState("");
  const [bcc, setBcc] = useState("");
  const [subject, setSubject] = useState("");
  const [body, setBody] = useState("");
  const [hasErrors, setHasErrors] = useState(false);

  const { mutate } = useEmailService();

  const showSnackbar = useSnackbar();

  function isBodyEmpty(html: any) {
    if (!html) return true;

    const div = document.createElement("div");
    div.innerHTML = html;

    // Get text content and trim whitespace
    return div.textContent.trim().length === 0;
  }

  const handleSend = () => {
    mutate(
      {
        service: "email",
        destination: to?.toLocaleLowerCase(),
        subject,
        body,
        fromEmail: from,
        attachments: false
      },
      {
        onSuccess: (data) => {
          setTo("");
          setFrom("");
          setSubject("");
          setBody("");
          showSnackbar(
            data?.message || "Notification request accepted and queued.",
            "info",
          );
        },
        onError: () => {
          showSnackbar("Failed to send email", "error");
        },
      },
    );
  };

  console.log("body",body)
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
            />
            <EmailEditor value={body} onChange={setBody} />
          </>
        )}

        {view === "preview" && (
          <EmailPreview html={body} from={from} to={to} subject={subject} />
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
