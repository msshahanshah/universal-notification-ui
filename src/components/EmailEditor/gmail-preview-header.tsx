type Props = {
  from: string;
  to: string;
  subject: string;
  cc?: string;
  bcc?: string;
};

export function GmailPreviewHeader({
  from,
  to,
  subject,
  cc,
  bcc,
}: Props) {
  return (
    <div style={header}>

      <div style={meta}>
        <div>
          <strong>From:</strong> {from}
        </div>
        <div>
          <strong>To:</strong> {to}
        </div>
        {cc && (
          <div>
            <strong>Cc:</strong> {cc}
          </div>
        )}
        {bcc && (
          <div>
            <strong>Bcc:</strong> {bcc}
          </div>
        )}
        <div>
          <strong>Subject:</strong> {subject || "(No subject)"}
        </div>
      </div>
    </div>
  );
}

const header: React.CSSProperties = {
  padding: "12px 16px",
  borderBottom: "1px solid #e0e0e0",
  background: "#fff",
};

const subjectStyle: React.CSSProperties = {
  margin: 0,
  fontSize: 18,
  fontWeight: 500,
};

const meta: React.CSSProperties = {
  marginTop: 6,
  fontSize: 13,
  color: "#5f6368",
};
