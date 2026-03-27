import { MAX_EMAIL_SIZE } from "./constants";

/**
 * Validates attachment size for email service (max 20MB)
 */
export const validateEmailAttachmentSize = (
  attachment: File,
): string | null => {
  if (attachment?.size !== undefined && attachment?.size > MAX_EMAIL_SIZE) {
    return `Email attachment "${attachment?.name}" must be ≤ 20 MB (current size: ${(attachment?.size / (1024 * 1024)).toFixed(2)}MB)`;
  }
  return null;
};
