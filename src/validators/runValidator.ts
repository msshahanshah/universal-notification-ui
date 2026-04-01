import { validationRegistry } from "./validationRegistry";
import { validationRules, validationMessages } from "./validationRules";

interface ValidationResult {
  isValid: boolean;
  errors: Record<string, string>;
}

// ✅ Frontend validator — runs BEFORE API call
export const runValidator = (
  serviceName: string,
  payload: Record<string, any>,
): ValidationResult => {
  const serviceRules = validationRegistry[serviceName];

  if (!serviceRules) {
    console.warn(`No registry found for: "${serviceName}"`);
    return { isValid: true, errors: {} };
  }

  const errors: Record<string, string> = {};
  const messages = (validationMessages[serviceName] as any) || {};

  Object.entries(serviceRules).forEach(([field, rules]) => {
    for (const rule of rules as string[]) {
      const [ruleName, param] = rule.split(":");
      const ruleFunc = validationRules[ruleName];
      if (!ruleFunc) continue;

      const errorKey = ruleFunc(payload[field], param);
      console.log("field", field);
      if (errorKey) {
        const fieldMessages = messages[errorKey] || {};
        let msg =
          fieldMessages[field]?.replace("{value}", payload[field]) || errorKey; // e.g. "Invalid Slack channel ID: C0"

        // Special case for "required" rule on message field
        // Only show error if both individual message AND common message are empty
        if (ruleName === "required" && field === "message") {
          console.log("payload..", payload);
          const hasCommonMessage =
            payload?.commonMessage?.trim() !== "" &&
            payload?.message?.trim() !== "";
          if (hasCommonMessage) {
            // Don't show "required" error if common message exists
            continue;
          }
          msg = "Message cannot be empty";
        }

        // Special case for "required" rule on destination field
        // Only show error if destination is actually empty
        if (ruleName === "required" && field === "destination") {
          // Handle array structure for slack service
          const slackData = payload.slack;
          if (!slackData || !Array.isArray(slackData)) {
            continue;
          }

          console.log("slackData", slackData);
          // Check if any destination is empty
          console.log("Checking slackData items:", slackData);
          const hasEmptyChannel = slackData.some((item: any, index: number) => {
            console.log(
              `Item ${index}:`,
              item,
              `destination:`,
              item.destination,
              `trim():`,
              item.destination?.trim(),
            );
            return !item.destination || item.destination.trim() === "";
          });

          if (hasEmptyChannel) {
            msg = "Destination is required";
          } else {
            // Don't show "required" error if all channelIDs exist
            continue;
          }
        }

        if (msg) {
          errors[field] = msg;
          break;
        }
      }
    }
  });

  return {
    isValid: Object.keys(errors).length === 0,
    errors,
  };
};

// ✅ API response parser — maps API errors to same field-level error shape
export const parseApiValidationErrors = (
  apiResponse: Record<string, any>,
): Record<string, Record<string, string>> => {
  const errors: Record<string, Record<string, string>> = {};

  // apiResponse.data = { slack: { success, statusCode, message }, ... }
  Object.entries(apiResponse.data || {}).forEach(([service, result]: any) => {
    if (!result.success && result.statusCode === 400) {
      errors[service] = { _error: result.message };
    }
  });

  return errors;
  // e.g. { slack: { _error: "Message cannot be empty" } }
};
