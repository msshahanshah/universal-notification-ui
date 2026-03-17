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
        smsErrors.push("At least one phone number is required");
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
                `SMS Section ${sectionIndex + 1}, Number ${numIndex + 1}: Country code is selected but phone number is missing`,
              );
            }
          });
        }

        if (!section.message.trim() && !commonMessage.trim()) {
          validation.sms.isFormValid = false;
          smsErrors.push(
            `SMS Section ${sectionIndex + 1}, Common message is required when not using separate messages`,
          );
        }
      });

      // Validate phone number formats
      sections.forEach((section: any, sectionIndex: number) => {
        section.numbers?.forEach((num: any, numIndex: number) => {
          if (num.number && !/^\d{8,15}$/.test(num.number)) {
            smsErrors.push(
              `SMS Section ${sectionIndex + 1}, Number ${numIndex + 1}: Invalid phone number format`,
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
    // Types of Validations available for slack
    // 1. "Invalid Slack channel ID: C0" // "destination": "C0",
    // 2. "Destination is required" // "destination": ""
    const slackErrors: string[] = [];

    console.log("slackInputData",slackInputData)

    if (!slackData || typeof slackData !== "object") {
      validation.slack.isFormValid = false;
      slackErrors.push("Slack service data is missing");
    } else {
      const channels = (slackData as any).sections || [];
      console.log("channels",channels)
      const hasValidChannels = channels.some(
        (channel: any) => channel.channelID?.trim() !== "",
      );

      console.log("hasValidChannels",hasValidChannels)

      if (!hasValidChannels) {
        validation.slack.isFormValid = false;
        slackErrors.push("At least one Slack channel is required");
      }

      // Check message requirements
      const hasSeparateMessages = channels.some(
        (channel: any) => channel.separateMessage,
      );
      const allHaveMessages = channels.every((channel: any) =>
        channel.separateMessage ? channel.message?.trim() !== "" : true,
      );

      if (hasSeparateMessages && !allHaveMessages) {
        validation.slack.isFormValid = false;
        slackErrors.push("All separate messages must have content");
      }

      if (!hasSeparateMessages && !commonMessage.trim()) {
        validation.slack.isFormValid = false;
        slackErrors.push(
          "Common message is required when separate messages are empty",
        );
      }
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
          "Common message is required when not using separate messages",
        ],
      };
    }

    if (validation.sms.isFormValid) {
      validation.sms.isFormValid = false;
      validation.sms.errors = {
        ...validation.sms.errors,
        commonMessage: [
          "Common message is required when not using separate messages",
        ],
      };
    }

    if (validation.slack.isFormValid) {
      validation.slack.isFormValid = false;
      validation.slack.errors = {
        ...validation.slack.errors,
        commonMessage: [
          "Common message is required when not using separate messages",
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
