import { atom } from 'jotai';

// Slack interfaces
export interface SlackChannel {
  id: string;
  channelID: string;
  message: string;
  separateMessage: boolean;
}

// Main Slack sections atom
export const slackSectionsAtom = atom<SlackChannel[]>([
  {
    id: "1",
    channelID: "",
    message: "",
    separateMessage: false,
  },
]);

// Computed atoms (replace useMemo)
export const slackPayloadAtom = atom((get) => {
  const sections = get(slackSectionsAtom);
  return sections
    .filter(section => section.channelID.trim() !== "" || section.separateMessage)
    .map(section => {
      const payloadSection: any = {
        destination: section.channelID,
      };
      
      // Only include message key if separateMessage is true
      if (section.separateMessage) {
        payloadSection.message = section.message;
      }
      
      return payloadSection;
    });
});

export const slackDestinationsAtom = atom((get) => {
  const payload = get(slackPayloadAtom);
  return payload
    .map(section => section.destination)
    .filter(dest => dest.trim() !== "");
});

export const slackMessagesAtom = atom((get) => {
  const payload = get(slackPayloadAtom);
  return payload.map(section => section.message || "");
});

// Combined callback data atom (for parent communication)
export const slackCallbackDataAtom = atom((get) => {
  const destinations = get(slackDestinationsAtom);
  const messages = get(slackMessagesAtom);
  const sections = get(slackPayloadAtom);
  
  return {
    destination: destinations,
    message: messages,
    sections: sections,
  };
});
