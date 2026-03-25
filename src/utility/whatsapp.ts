// WhatsApp utility functions for phone number formatting

export interface WhatsAppNumber {
  id: string;
  countryCode: string;
  number: string;
}

// Format single number object to string
export const formatPhoneNumber = (num: WhatsAppNumber): string => {
  return `${num.countryCode}${num.number}`;
};

// Format numbers array for uniqueKey generation
export const formatNumbersForUniqueKey = (numbers: WhatsAppNumber[]): string => {
  const validNumbers = numbers.filter(num => num.number.trim() !== "");
  if (validNumbers.length === 0) return "";
  
  // Use first number for uniqueKey to keep it simple
  const firstNumber = validNumbers[0];
  return formatPhoneNumber(firstNumber);
};
