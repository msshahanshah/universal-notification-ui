import AttachmentSection from "src/layouts/dashboard/services/email/attachmentSection";
import { GmailPreviewHeader } from "./gmail-preview-header";

type Props = {
  html: string;
  from: string;
  to: string;
  subject: string;
  cc?: string;
  bcc?: string;
  attachments: Attachment[];
};

type Attachment = {
  file: File;
  id: string;
  previewUrl?: string; // for images
};

export function EmailPreview({
  html,
  from,
  to,
  subject,
  cc,
  bcc,
  attachments,
  handleAttachmentChange,
  removeAttachment,
}: Props) {
  return (
    <div style={previewShell}>
      {/* Gmail-style header */}
      <GmailPreviewHeader
        from={from}
        to={to}
        subject={subject}
        cc={cc}
        bcc={bcc}
      />

      {/* Email body */}
      <iframe
        title="email-preview"
        style={iframe}
        srcDoc={`
          <html>
      <head>
        <style>
          body {
            font-family: "Inter", sans-serif;
            font-size: 14px;
            line-height: 1.6;
            padding: 16px;
            margin: 0;

            /* 🌙 DARK MODE */
            background: #202124;
            color: #e8eaed;
          }

          a { color: #8ab4f8; }
          hr { border-color: #3c4043; }
          table { color: #e8eaed; }

          /* Fix pasted email inline backgrounds */
          [style*="background"],
          [bgcolor] {
            background: transparent !important;
          }

          /* Images don't look washed */
          img { max-width: 100%; }
        </style>
      </head>
      <body>
        ${html}
      </body>
    </html>
        `}
      />
      <AttachmentSection
        attachments={attachments}
        onAdd={handleAttachmentChange}
        onRemove={removeAttachment}
        style={{ background: "#202124", marginTop: 0 }}
        hideBtn
      />
    </div>
  );
}

const previewShell: React.CSSProperties = {
  display: "flex",
  flexDirection: "column",
  height: "100%",
  border: "1px solid #dadce0",
  borderRadius: 8,
  overflow: "hidden",
  background: "#D3E3FD",
};

const iframe: React.CSSProperties = {
  flex: 1,
  border: "none",
};
