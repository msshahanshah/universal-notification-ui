import { atom } from "jotai";

// Whatsapp interfaces
export interface WhatsappRecipient {
  id: string;
  to: string;
  body: string;
  attachments: Array<{
    id: string;
    name: string;
    url: string;
  }>;
  separateMessage: boolean;
  uniqueKey?: string;
  templateId?: string | null;
}

// Main Whatsapp sections atom
export const whatsappSectionsAtom = atom<WhatsappRecipient[]>([
  {
    id: "1",
    to: "",
    body: "",
    attachments: [],
    separateMessage: false,
    uniqueKey: "",
    templateId: null,
  },
]);

// Computed atoms (replace useMemo)
export const whatsappPayloadAtom = atom((get) => {
  const sections = get(whatsappSectionsAtom);
  return sections
    .filter((section) => section?.to?.trim() !== "" || section?.separateMessage)
    .map((section, index) => {
      const payloadSection: any = {
        destination: section?.to,
        attachments: section?.attachments?.map((att: any) => att) || [],
      };

      // Add uniqueKey if there are attachments
      if (
        section?.attachments &&
        section.attachments.length > 0 &&
        section?.uniqueKey?.trim()
      ) {
        payloadSection.uniqueKey = section.uniqueKey;
      }

      // Always include body key if separateMessage is true (even if empty)
      if (section?.separateMessage) {
        payloadSection.body = section?.body || "";
      }

      if (section?.templateId) {
        payloadSection.templateId = section?.templateId || "";
      }

      return payloadSection;
    });
});

export const whatsappDestinationsAtom = atom((get) => {
  const payload = get(whatsappPayloadAtom);
  return payload
    .map((section) => section.destination)
    .filter((dest) => dest.trim() !== "");
});

export const whatsappBodiesAtom = atom((get) => {
  const payload = get(whatsappPayloadAtom);
  return payload.map((section) => section.body || "");
});

// Combined callback data atom (for parent communication)
export const whatsappCallbackDataAtom = atom((get) => {
  const sections = get(whatsappPayloadAtom);
  return {
    recipients: sections, // Return processed sections (payload format)
  };
});

// Atom to access raw recipients with file objects for uploads
export const whatsappRawRecipientsAtom = atom((get) => {
  return get(whatsappSectionsAtom);
});
