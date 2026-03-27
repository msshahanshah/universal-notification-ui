// WhatsApp utility functions for phone number formatting

import { MAX_WHATSAPP_SIZE } from "./constants";

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
export const formatNumbersForUniqueKey = (
  numbers: WhatsAppNumber[],
): string => {
  const validNumbers = numbers.filter((num) => num.number.trim() !== "");
  if (validNumbers.length === 0) return "";

  // Use first number for uniqueKey to keep it simple
  const firstNumber = validNumbers[0];
  return formatPhoneNumber(firstNumber);
};

/**
 * Validates attachment size for WhatsApp service (max 16MB)
 */
export const validateWhatsAppAttachmentSize = (
  attachment: File,
): string | null => {
  if (attachment?.size !== undefined&& attachment?.size > MAX_WHATSAPP_SIZE) {
    return `WhatsApp attachment "${attachment?.name}" must be ≤ 16 MB (current size: ${(attachment?.size / (1024 * 1024)).toFixed(2)}MB)`;
  }
  return null;
};
