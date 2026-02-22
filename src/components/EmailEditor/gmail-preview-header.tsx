import { useTheme } from "@mui/material";

type Props = {
  from: string;
  to: string;
  subject: string;
  cc?: string;
  bcc?: string;
};

export function GmailPreviewHeader({ from, to, subject, cc, bcc }: Props) {
  const theme = useTheme();
  return (
    <div style={{...header, background: theme.vars?.palette.background.paper, color: theme.vars?.palette.text.secondary}}>
      <div style={meta}>
        <div>
          <strong style={{ color: theme.vars?.palette.text.secondary }}>From:</strong> {from}
        </div>
        <div>
          <strong style={{ color: theme.vars?.palette.text.secondary }}>To:</strong> {to}
        </div>
        {cc && (
          <div>
            <strong style={{ color: theme.vars?.palette.text.secondary }}>Cc:</strong> {cc}
          </div>
        )}
        {bcc && (
          <div>
            <strong style={{ color: theme.vars?.palette.text.secondary }}>Bcc:</strong> {bcc}
          </div>
        )}
        <div>
          <strong style={{ color: theme.vars?.palette.text.secondary }}>Subject:</strong> {subject}
        </div>
      </div>
    </div>
  );
}

const header: React.CSSProperties = {
  padding: "12px 16px",
  borderBottom: "1px solid #e0e0e0",
  background: (theme: any) => theme.vars?.palette.background.paper,
};

const meta: React.CSSProperties = {
  fontSize: 13,
};
