import { useEffect, useState } from "react";

import {
  validateMultipleEmails,
  validateSingleEmail,
} from "src/utility/helper";

import Input from "../input";

type Props = {
  from: string;
  to: string;
  cc: string;
  bcc: string;
  subject: string;
  setFrom: (v: string) => void;
  setTo: (v: string) => void;
  setCc: (v: string) => void;
  setBcc: (v: string) => void;
  setSubject: (v: string) => void;
  onValidationChange: (hasErrors: boolean) => void;
  attachments: Attachment[];
  setAttachments: (attachments: Attachment[]) => void;
};

type Attachment = {
  file: File;
  id: string;
  previewUrl?: string; // for images
};

export function GmailShell({
  from,
  to,
  cc,
  bcc,
  subject,
  setFrom,
  setTo,
  setCc,
  setBcc,
  setSubject,
  onValidationChange,
}: Props) {
  const [errors, setErrors] = useState({
    from: "",
    to: "",
    cc: "",
    bcc: "",
  });

  const [subjectError, setSubjectError] = useState("");

  useEffect(() => {
    const hasErrors = Object.values(errors).some(Boolean) || !!subjectError;
    onValidationChange(hasErrors);
  }, [errors, onValidationChange, subjectError]);

  const handleFromChange = (val: string) => {
    setFrom(val);
    setErrors((e) => ({
      ...e,
      from: val && !validateSingleEmail(val) ? "Invalid email address" : "",
    }));
  };

  const handleMultiChange = (
    val: string,
    field: "to" | "cc" | "bcc",
    setter: (v: string) => void,
  ) => {
    setter(val);
    setErrors((e) => ({
      ...e,
      [field]:
        val && !validateMultipleEmails(val)
          ? "One or more emails are invalid"
          : "",
    }));
  };

  const ErrorText = ({ children }: { children: string }) => (
    <div
      style={{
        fontSize: 11,
        color: "#d32f2f",
        marginTop: -4,
      }}
    >
      {children}
    </div>
  );

  return (
    <div style={shellStyle}>
      {/* From */}
      <Input
        label="From"
        id="from"
        value={from}
        onChange={(e) => handleFromChange(e.target.value)}
        placeholder="From"
        className="sms-input"
        showAsteric={true}
      />
      {errors.from && <ErrorText>{errors.from}</ErrorText>}

      <Input
        label="To"
        id="to"
        value={to}
        onChange={(e) => handleMultiChange(e?.target?.value, "to", setTo)}
        placeholder="To"
        className="sms-input"
        showAsteric={true}
      />
      {errors.to && <ErrorText>{errors.to}</ErrorText>}
      <Input
        label="Cc"
        id="cc"
        value={cc}
        onChange={(v) => handleMultiChange(v.target.value, "cc", setCc)}
        placeholder="Cc"
        className="sms-input"
      />
      {errors.cc && <ErrorText>{errors.cc}</ErrorText>}
      <Input
        label="Bcc"
        id="bcc"
        value={bcc}
        onChange={(v) => handleMultiChange(v.target.value, "bcc", setBcc)}
        placeholder="Bcc"
        className="sms-input"
      />
      {errors.bcc && <ErrorText>{errors.bcc}</ErrorText>}
      <Input
        label="Subject"
        id="subject"
        value={subject}
        onChange={(e) => {
          const value = e.target.value.trim();
          if (value?.length > 255) {
            setSubjectError("Subject must not exceed 255 characters.");
          } else {
            if (!!subjectError) {
              setSubjectError("");
            }
          }
          setSubject(e.target.value);
        }}
        placeholder="Subject"
        className="sms-input"
        showAsteric
      />
      {subjectError && <ErrorText>{subjectError}</ErrorText>}
    </div>
  );
}

const shellStyle: React.CSSProperties = {
  display: "flex",
  flexDirection: "column",
  gap: 8,
  marginBottom: 12,
};
