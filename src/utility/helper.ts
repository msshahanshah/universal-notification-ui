import { emailRegex } from "./constants";

const validateSingleEmail = (email: string) => emailRegex.test(email.trim());

const validateMultipleEmails = (value: string) =>
  value
    .split(",")
    .map((e) => e.trim())
    .filter(Boolean)
    .every(validateSingleEmail);

export { validateMultipleEmails, validateSingleEmail };
