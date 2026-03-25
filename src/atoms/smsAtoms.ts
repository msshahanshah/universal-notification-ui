import { atom } from 'jotai';

// SMS interfaces
export interface SMSNumber {
  id: string;
  countryCode: string;
  number: string;
}

export interface SMSSection {
  id: string;
  numbers: SMSNumber[];
  message: string;
  separateMessage: boolean;
}

// Main SMS sections atom
export const smsSectionsAtom = atom<SMSSection[]>([
  {
    id: "1",
    numbers: [{ id: "1", countryCode: "+91", number: "" }],
    message: "",
    separateMessage: false,
  },
]);

// Computed atoms (replace useMemo)
export const smsPayloadAtom = atom((get) => {
  const sections = get(smsSectionsAtom);
  return sections
    .filter(section => section.numbers.some(num => num.number.trim() !== "") || section.separateMessage)
    .map(section => ({
      destination: section.numbers
        .filter(num => num.number.trim() !== "")
        .map(num => `${num.countryCode}${num.number}`)
        .join(', '), // Join multiple numbers with comma
      message: section.separateMessage ? section.message : "", // Only include message if separateMessage is true
    }));
});

export const smsDestinationsAtom = atom((get) => {
  const payload = get(smsPayloadAtom);
  return payload.flatMap(section => 
    section.destination.split(', ').filter(dest => dest.trim() !== '')
  );
});

export const smsMessagesAtom = atom((get) => {
  const payload = get(smsPayloadAtom);
  return payload.map(section => section.message);
});

// Combined callback data atom (for parent communication)
export const smsCallbackDataAtom = atom((get) => {
  const destinations = get(smsDestinationsAtom);
  const messages = get(smsMessagesAtom);
  const sections = get(smsPayloadAtom);
  
  return {
    destination: destinations,
    message: messages,
    sections: sections,
  };
});
