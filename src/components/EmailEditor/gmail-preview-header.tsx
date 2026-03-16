import { useTheme } from "@mui/material";

type Props = {
  from?: string;
  to: string;
  subject: string;
  cc?: string;
  bcc?: string;
  bgValue: string;
  textValue: string;
};

export function GmailPreviewHeader({
  from,
  to,
  subject,
  cc,
  bcc,
  bgValue,
  textValue,
}: Props) {
  return (
    <div
      style={{
        ...header,
        background: bgValue,
        color: textValue,
      }}
    >
      <div style={meta}>
        {from && (
          <div>
            <strong style={{ color: textValue }}>From:</strong> {from}
          </div>
        )}
        <div>
          <strong style={{ color: textValue }}>To:</strong> {to}
        </div>
        {cc && (
          <div>
            <strong style={{ color: textValue }}>Cc:</strong> {cc}
          </div>
        )}
        {bcc && (
          <div>
            <strong style={{ color: textValue }}>Bcc:</strong> {bcc}
          </div>
        )}
        <div>
          <strong style={{ color: textValue }}>Subject:</strong> {subject}
        </div>
      </div>
    </div>
  );
}

const header: React.CSSProperties = {
  padding: "12px 16px",
  borderBottom: "1px solid #e0e0e0",
};

const meta: React.CSSProperties = {
  fontSize: 13,
};
