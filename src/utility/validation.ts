/**
 * Validation utilities for multiple notification services
 */

import { useAtom } from "jotai";
import { slackSectionsAtom } from "src/atoms/slackAtoms";
import { smsSectionsAtom } from "src/atoms/smsAtoms";

export interface ValidationResult {
  isFormValid: boolean;
  errors: Record<string, string[]>;
}

export interface ServiceValidation {
  email: ValidationResult;
  sms: ValidationResult;
  slack: ValidationResult;
  isFormValid: boolean;
  errors: Record<string, string[]>;
}

/**
 * Validates all selected services and their requirements
 */
export const validateAllServices = (
  selectedServices: string[],
  emailData: any,
  smsData: any,
  slackData: any,
  commonMessage: string,
): ServiceValidation => {
  const [smsInputData, _] = useAtom(smsSectionsAtom);
  const [slackInputData, __] = useAtom(slackSectionsAtom);
  const validation: ServiceValidation = {
    email: { isFormValid: true, errors: {} },
    sms: { isFormValid: true, errors: {} },
    slack: { isFormValid: true, errors: {} },
    isFormValid: true,
    errors: {},
  };

  // Email validation
  if (selectedServices.includes("email")) {
    const emailErrors: string[] = [];

    if (!emailData || typeof emailData !== "object") {
      validation.email.isFormValid = false;
      emailErrors.push("Email service data is missing");
    } else {
      const recipients = (emailData as any)?.recipients || [];
      const hasValidRecipients = recipients.some(
        (rec: any) => rec.to?.trim() !== "",
      );

      if (!hasValidRecipients) {
        validation.email.isFormValid = false;
        emailErrors.push("At least one email recipient is required");
      }

      // Check for required fields
      recipients.forEach((rec: any, index: number) => {
        if (!rec.to?.trim()) {
          emailErrors.push(`Email ${index + 1}: Recipient email is required`);
        }
        if (!rec.subject?.trim()) {
          emailErrors.push(`Email ${index + 1}: Subject is required`);
        }
      });

      // Check message requirements
      const hasSeparateMessages = recipients.some(
        (rec: any) => rec.separateMessage,
      );
      const allHaveMessages = recipients.every((rec: any) =>
        rec.separateMessage ? rec.body?.trim() !== "" : true,
      );

      if (hasSeparateMessages && !allHaveMessages) {
        validation.email.isFormValid = false;
        emailErrors.push("All separate messages must have content");
      }

      if (!hasSeparateMessages && !commonMessage.trim()) {
        validation.email.isFormValid = false;
        emailErrors.push(
          "Common message is required when separate messages are empty",
        );
      }

      if (emailErrors.length > 0) {
        validation.email.errors = { email: emailErrors };
      }
    }
  }

  // SMS validation
  if (selectedServices.includes("sms")) {
    const smsErrors: string[] = [];

    console.log("smsData", smsData);

    if (!smsData || typeof smsData !== "object") {
      validation.sms.isFormValid = false;
      smsErrors.push("SMS service data is missing");
    } else {
      const sections = (smsData as any).sections || [];
      console.log("SMS sections", sections);
      console.log("smsInputData", smsInputData);
      const hasValidDestination = sections?.some(
        ({ destination }: any) => destination?.trim() !== "",
      );

      // console.log("hasValidSections",hasValidSections)

      if (!hasValidDestination) {
        validation.sms.isFormValid = false;
        smsErrors.push("At least one Phone Number is required");
      }

      // Check for sections with country code but missing phone number
      smsInputData.forEach((section: any, sectionIndex: number) => {
        if (section.numbers) {
          section.numbers.forEach((num: any, numIndex: number) => {
            const hasCountryCode =
              num.countryCode && num.countryCode.trim() !== "";
            const hasPhoneNumber = num.number && num.number.trim() !== "";

            if (hasCountryCode && !hasPhoneNumber) {
              validation.sms.isFormValid = false;
              smsErrors.push(
                `SMS Section ${sectionIndex + 1}, Number ${numIndex + 1}: Invalid phone number`,
              );
            }
          });
        }

        if (!section.message.trim() && !commonMessage.trim()) {
          validation.sms.isFormValid = false;
          smsErrors.push(
            `SMS Section ${sectionIndex + 1}: A message is required when common message is not provided`,
          );
        }
      });

      // Validate phone number formats
      sections.forEach((section: any, sectionIndex: number) => {
        section.numbers?.forEach((num: any, numIndex: number) => {
          if (num.number && !/^\d{8,15}$/.test(num.number)) {
            smsErrors.push(
              `SMS Section ${sectionIndex + 1}: Invalid phone number`,
            );
          }
        });
      });
    }

    if (smsErrors.length > 0) {
      validation.sms.errors = { sms: smsErrors };
    }
  }

  // Slack validation
  if (selectedServices.includes("slack")) {
    const slackErrors: string[] = [];

    if (!slackData || typeof slackData !== "object") {
      validation.slack.isFormValid = false;
      slackErrors.push("Slack service data is missing");
    } else {
      const sections = (slackData as any).sections || [];

      // At least one destination must be provided
      const hasValidDestination = sections?.some(
        ({ destination, channelID }: any) =>
          destination?.trim() !== "" || channelID?.trim() !== "",
      );

      if (!hasValidDestination) {
        validation.slack.isFormValid = false;
        slackErrors.push(
          "At least one Channel ID is required",
        );
      }

      // Each section must have a message, or commonMessage must be provided
      slackInputData.forEach((section: any, sectionIndex: number) => {
        if (!section.message?.trim() && !commonMessage.trim()) {
          validation.slack.isFormValid = false;
          slackErrors.push(
            `Slack Section ${sectionIndex + 1}: A message is required when common message is not provided`,
          );
        }

        // Destination must not be empty if the section exists
        if (!section.destination?.trim() && !section.channelID?.trim()) {
          validation.slack.isFormValid = false;
          slackErrors.push(
            `Slack Section ${sectionIndex + 1}: Destination is required`,
          );
        }
      });
    }

    if (slackErrors.length > 0) {
      validation.slack.errors = { slack: slackErrors };
    }
  }

  // Common message validation
  if (selectedServices.length > 0 && !commonMessage.trim()) {
    // Add common message error to all services
    if (validation.email.isFormValid) {
      validation.email.isFormValid = false;
      validation.email.errors = {
        ...validation.email.errors,
        commonMessage: [
          "A message is required when common message is not provided",
        ],
      };
    }

    if (validation.sms.isFormValid) {
      validation.sms.isFormValid = false;
      validation.sms.errors = {
        ...validation.sms.errors,
        commonMessage: [
          "A message is required when common message is not provided",
        ],
      };
    }

    if (validation.slack.isFormValid) {
      validation.slack.isFormValid = false;
      validation.slack.errors = {
        ...validation.slack.errors,
        commonMessage: [
          "A message is required when common message is not provided",
        ],
      };
    }
  }

  // Overall validation
  const overallValid =
    validation.email.isFormValid &&
    validation.sms.isFormValid &&
    validation.slack.isFormValid;

  return {
    email: validation.email,
    sms: validation.sms,
    slack: validation.slack,
    isFormValid: overallValid,
    errors: {
      email: Object.values(validation.email.errors).flat(),
      sms: Object.values(validation.sms.errors).flat(),
      slack: Object.values(validation.slack.errors).flat(),
    },
  };
};
