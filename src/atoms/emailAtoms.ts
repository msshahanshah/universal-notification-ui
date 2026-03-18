import { atom } from 'jotai';

// Email interfaces
export interface EmailRecipient {
  id: string;
  from: string;
  to: string;
  cc: string;
  bcc: string;
  subject: string;
  body: string;
  attachments: any[];
  separateMessage: boolean;
}

// Main Email sections atom
export const emailSectionsAtom = atom<EmailRecipient[]>([
  {
    id: "1",
    from: "",
    to: "",
    cc: "",
    bcc: "",
    subject: "",
    body: "",
    attachments: [],
    separateMessage: false,
  },
]);

// Computed atoms (replace useMemo)
export const emailPayloadAtom = atom((get) => {
  const sections = get(emailSectionsAtom);
  return sections
    .filter(section => section.to.trim() !== "" || section.separateMessage)
    .map(section => {
      const payloadSection: any = {
        destination: section.to,
        cc: section.cc,
        bcc: section.bcc,
        subject: section.subject,
        fromEmail: section.from,
        uniqueKey: `email-${section.id}`,
        attachments: section.attachments?.map((att: any) => att.name || att.fileName) || [],
      };
      
      // Always include body key if separateMessage is true (even if empty)
      if (section.separateMessage) {
        payloadSection.body = section.body || "";
      }
      
      return payloadSection;
    });
});

export const emailDestinationsAtom = atom((get) => {
  const payload = get(emailPayloadAtom);
  return payload
    .map(section => section.destination)
    .filter(dest => dest.trim() !== "");
});

export const emailBodiesAtom = atom((get) => {
  const payload = get(emailPayloadAtom);
  return payload.map(section => section.body || "");
});

// Combined callback data atom (for parent communication)
export const emailCallbackDataAtom = atom((get) => {
  const sections = get(emailPayloadAtom);
  const fromEmail = get(emailSectionsAtom)[0]?.from || "";
  
  return {
    from: fromEmail,
    recipients: sections,
  };
});
