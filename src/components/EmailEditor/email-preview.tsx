import { useTheme } from "@mui/system";
import COLORS from "src/utility/colors";

import AttachmentSection from "src/layouts/dashboard/services/email/attachmentSection";
import { GmailPreviewHeader } from "./gmail-preview-header";

type Props = {
  html: string;
  from?: string;
  to: string;
  subject: string;
  cc?: string;
  bcc?: string;
  attachments: Attachment[];
  handleAttachmentChange: (files: FileList) => void;
  removeAttachment: (id: string) => void;
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
}: any) {
  const theme = useTheme();

  const bgValue = COLORS.WHITE;

  const textColor = "hsl(220, 15%, 30%)";

  const cleanEmailHtml = html
    .replace(/bgcolor=["']?#ffffff["']?/gi, "")
    .replace(/background-color:\s*#ffffff;?/gi, "")
    .replace(/background:\s*#ffffff;?/gi, "");

  return (
    <div
      style={{
        ...previewShell,
        background: bgValue,
      }}
    >
      {/* Gmail-style header */}
      <GmailPreviewHeader
        from={from}
        to={to}
        subject={subject}
        cc={cc}
        bcc={bcc}
        bgValue={bgValue}
        textValue={textColor}
      />

      {/* Email body */}
      <iframe
        key={theme.palette.mode}
        title="email-preview"
        style={{ ...iframe, background: bgValue }}
        srcDoc={`
    <html>
      <head>
        <style>
          html {
            background-color: ${bgValue} !important;
          }

          body {
            background-color: ${bgValue} !important;
            color: ${textColor};
            margin: 0;
            padding: 16px;
            font-family: "Inter", sans-serif;
            font-size: 14px;
            line-height: 1.6;
          }

          /* REMOVE ALL background colors inside email */
          * {
            background-color: transparent !important;
          }

          a { color: #8ab4f8; }
          img { max-width: 100%; }
        </style>
      </head>
      <body>
        <div style="max-width:600px;margin:auto">
          ${cleanEmailHtml}
        </div>
      </body>
    </html>
  `}
      />
      <AttachmentSection
        attachments={attachments}
        onAdd={handleAttachmentChange}
        onRemove={removeAttachment}
        style={{
          background: bgValue,
          marginTop: 0,
        }}
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
  minHeight: "600px",
};

const iframe: React.CSSProperties = {
  flex: 1,
  border: "none",
  background: "#202124",
};
