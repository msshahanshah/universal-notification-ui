import { emailRegex } from "./constants";

const validateSingleEmail = (email: string) => emailRegex.test(email.trim());

const validateMultipleEmails = (value: string) =>
  value
    .split(",")
    .map((e) => e.trim())
    .filter(Boolean)
    .every(validateSingleEmail);

function isBodyEmpty(html: any) {
  if (!html) return true;

  const div = document.createElement("div");
  div.innerHTML = html;

  // Get text content and trim whitespace
  return div.textContent.trim().length === 0;
}

export { validateMultipleEmails, validateSingleEmail, isBodyEmpty };
