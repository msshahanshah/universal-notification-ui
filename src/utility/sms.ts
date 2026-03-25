/**
 * Validates recipients and message for a standard SMS send operation.
 *
 * @param data - Array of recipient objects to validate.
 * @param message - The common message string to be sent.
 * @returns `true` if the form should be disabled (invalid), `false` if valid and ready to send.
 *
 * @example
 * const disabled = checkValidRecipients(
 *   [{ countryCode: '+1', number: '1234567890' }],
 *   'Hello!'
 * );
 * // disabled => false
 */
const checkValidRecipients = (data: any, message: string): boolean => {
  const isValidRecipients =
    data.length > 0 &&
    data.every(
      (r: any) => r.countryCode && r.number && /^\d{8,15}$/.test(r.number),
    );

  const isDisabled = !message.trim() || !isValidRecipients;

  return isDisabled;
};

/**
 * Validates recipients for an SMS wrapper flow, where each recipient
 * may carry an individual message or rely on a shared common message.
 *
 * A recipient is considered valid when it has a `destination` and at least
 * one of the following is non-empty: its own `message` or the `commonMsg`.
 *
 * @param data - Array of recipient objects to validate.
 * @param commonMsg - Optional fallback message shared across all recipients.
 * @returns `true` if the form should be disabled (no valid recipient found), `false` otherwise.
 *
 * @example
 * const disabled = checkValidRecipientsforSMSWrapper(
 *   [{ destination: '+11234567890', message: 'Hi there' }],
 *   ''
 * );
 * // disabled => false
 */
const checkValidRecipientsforSMSWrapper = (
  data: any,
  commonMsg?: string,
): boolean => {
  const isValidRecipients =
    data.length > 0 &&
    data.find(
      (r: any) =>
        r.destination &&
        (r?.message?.trim() !== "" || commonMsg?.trim() !== ""),
    );

  const isDisabled = !isValidRecipients;

  return isDisabled;
};

export { checkValidRecipients, checkValidRecipientsforSMSWrapper };