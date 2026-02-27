import { emailRegex } from "./constants";

const validateSingleEmail = (email: string) => emailRegex.test(email.trim());

const validateMultipleEmails = (value: string) => {
  const trimmedValue = value?.trim();
  return trimmedValue
    .split(",")
    .map((e) => e.trim())
    .filter(Boolean)
    .every(validateSingleEmail);
};

const truncateString = (value: string, maxLength: number) => {
  if (!value) return "";
  if (value.length <= maxLength) return value;
  return value.slice(0, maxLength) + "...";
};

export { validateMultipleEmails, validateSingleEmail, truncateString };
