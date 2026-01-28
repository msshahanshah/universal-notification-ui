import { GmailPreviewHeader } from "./gmail-preview-header";

type Props = {
  html: string;
  from: string;
  to: string;
  subject: string;
  cc?: string;
  bcc?: string;
};

export function EmailPreview({ html, from, to, subject, cc, bcc }: Props) {
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
                  color: #202124;
                }
              </style>
            </head>
            <body>
              ${html}
            </body>
          </html>
        `}
      />
    </div>
  );
}

const previewShell: React.CSSProperties = {
  display: "flex",
  flexDirection: "column",
  height: "60%",
  border: "1px solid #dadce0",
  borderRadius: 8,
  overflow: "hidden",
  background: "#fff",
};

const iframe: React.CSSProperties = {
  flex: 1,
  border: "none",
};
