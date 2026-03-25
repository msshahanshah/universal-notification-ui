import { atom } from "jotai";
import { Template } from "src/api/service.api";

// WhatsApp interfaces
export interface WhatsAppNumber {
  id: string;
  countryCode: string;
  number: string;
}

export interface WhatsappRecipient {
  id: string;
  numbers: WhatsAppNumber[];
  message: string;
  attachments: Array<{
    id: string;
    name: string;
    url?: string;        // for URL attachments
    file?: File;         // for file attachments
  }>;
  separateMessage: boolean;
  uniqueKey?: string;
  templateId?: string | null;
  variableValues?: Record<string, string>;
  attachmentType: 'file' | 'url';
  selectedTemplate?: Template | null;
  toggleType: 'template' | 'non-template';
}

// Main Whatsapp sections atom
export const whatsappSectionsAtom = atom<WhatsappRecipient[]>([
  {
    id: "1",
    numbers: [{ id: "1", countryCode: "+91", number: "" }],
    message: "",
    attachments: [],
    separateMessage: false,
    uniqueKey: "",
    templateId: null,
    variableValues: {},
    attachmentType: 'url',
    selectedTemplate: null,
    toggleType: 'template',
  },
]);

// Computed atoms (replace useMemo)
export const whatsappPayloadAtom = atom((get) => {
  const sections = get(whatsappSectionsAtom);
  return sections
    .filter((section) => 
      section.numbers.some((num) => num.number.trim() !== "") || 
      section?.separateMessage ||
      section.toggleType === 'template'
    )
    .map((section, index) => {
      const payloadSection: any = {
        destination: section.numbers
          .filter((num) => num.number.trim() !== "")
          .map((num) => `${num.countryCode}${num.number}`)
          .join(', '), // Join multiple numbers with comma
      };

      // Only include attachments if they exist and are not empty
      if (section?.attachments && section.attachments.length > 0) {
        payloadSection.attachments = section.attachments.map((att: any) => {
          if (section.attachmentType === 'file') {
            return att.name; // For file attachments, send the filename
          } else {
            return att.url || att; // For URL attachments, send the URL
          }
        });
      }

      // Add uniqueKey if there are attachments
      if (
        section?.attachments &&
        section.attachments.length > 0 &&
        section?.uniqueKey?.trim()
      ) {
        payloadSection.uniqueKey = section.uniqueKey;
      }

      // Always include message key if separateMessage is true (even if empty)
      if (section?.separateMessage) {
        payloadSection.message = section?.message || "";
      }

      if (section?.templateId) {
        payloadSection.templateId = section?.templateId || "";
      }

      // Include variableValues if present
      if (section?.variableValues && Object.keys(section.variableValues).length > 0) {
        payloadSection.variableValues = section.variableValues;
      }

      return payloadSection;
    });
});

export const whatsappDestinationsAtom = atom((get) => {
  const payload = get(whatsappPayloadAtom);
  return payload.flatMap((section) => 
    section.destination.split(', ').filter((dest: string) => dest.trim() !== "")
  );
});

export const whatsappBodiesAtom = atom((get) => {
  const payload = get(whatsappPayloadAtom);
  return payload.map((section) => section.message || "");
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
