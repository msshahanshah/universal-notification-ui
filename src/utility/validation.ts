/**
 * Validation utilities for multiple notification services
 */

import { useAtom } from "jotai";
import { emailSectionsAtom } from "src/atoms/emailAtoms";
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
  const [emailInputData, ___] = useAtom(emailSectionsAtom);
  const validation: ServiceValidation = {
    email: { isFormValid: true, errors: {} },
    sms: { isFormValid: true, errors: {} },
    slack: { isFormValid: true, errors: {} },
    isFormValid: true,
    errors: {},
  };

  if (selectedServices.includes("email")) {
    const emailErrors: string[] = [];

    if (!emailData || typeof emailData !== "object") {
      validation.email.isFormValid = false;
      emailErrors.push("Email service data is missing");
    } else {
      const sections = (emailData as any).sections || [];
      // At least one destination must be provided
      const hasValidDestination = emailInputData?.some(
        ({ to }: any) => to?.trim() !== "",
      );

      if (!hasValidDestination) {
        validation.email.isFormValid = false;
        emailErrors.push("At least one recipient email address is required");
      }

      // Per-section validations
      emailInputData.forEach((section: any, sectionIndex: number) => {
        // Destination (To) is required

        // Validate fromEmail format
        if (
          section?.from?.trim() &&
          !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(section.from.trim())
        ) {
          validation.email.isFormValid = false;
          emailErrors.push(
            `Email Section ${sectionIndex + 1}: Email in fromEmail is invalid`,
          );
        }

        if (!section.to?.trim()) {
          validation.email.isFormValid = false;
          emailErrors.push(
            `Email Section ${sectionIndex + 1}: To can't be empty for email`,
          );
        }

        // Validate destination email format
        if (
          section.to?.trim() &&
          !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(section.to.trim())
        ) {
          validation.email.isFormValid = false;
          emailErrors.push(
            `Email Section ${sectionIndex + 1}: Email in To is invalid`,
          );
        }

        if (!section.subject?.trim()) {
          validation.email.isFormValid = false;
          emailErrors.push(
            `Email Section ${sectionIndex + 1}: Subject can't be empty for email`,
          );
        }

        // Validate CC format if provided
        if (
          section.cc?.trim() &&
          !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(section.cc.trim())
        ) {
          validation.email.isFormValid = false;
          emailErrors.push(
            `Email Section ${sectionIndex + 1}: Email in cc is invalid`,
          );
        }

        // Validate BCC format if provided
        if (
          section.bcc?.trim() &&
          !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(section.bcc.trim())
        ) {
          validation.email.isFormValid = false;
          emailErrors.push(
            `Email Section ${sectionIndex + 1}: Email in bcc is invalid`,
          );
        }

        // Body or commonMessage must be provided
        if (!section.body?.trim() && !commonMessage.trim()) {
          validation.email.isFormValid = false;
          emailErrors.push(
            `Email Section ${sectionIndex + 1}: A body is required when common message is not provided`,
          );
        }

        // attachments must be an array if present (do not alter existing attachment logic)
        if (
          section.attachments !== undefined &&
          !Array.isArray(section.attachments)
        ) {
          validation.email.isFormValid = false;
          emailErrors.push(
            `Email Section ${sectionIndex + 1}: Attachments must be a valid list`,
          );
        }
      });
    }

    if (emailErrors.length > 0) {
      validation.email.errors = { email: emailErrors };
    }
  }

  // // Email validation
  // if (selectedServices.includes("email")) {
  //   const emailErrors: string[] = [];

  //   console.log("emailData",emailData)
  //   if (!emailData || typeof emailData !== "object") {
  //     validation.email.isFormValid = false;
  //     emailErrors.push("Email service data is missing");
  //   } else {
  //     const recipients = (emailData as any)?.recipients || [];
  //     console.log("recipients",recipients)
  //     const hasValidRecipients = recipients.some(
  //       (rec: any) => rec.destination?.trim() !== "",
  //     );

  //     // if (!hasValidRecipients) {
  //     //   validation.email.isFormValid = false;
  //     //   emailErrors.push("At least one Email Recipient is required");
  //     // }

  //     // Check for required fields
  //     console.log("recipients",recipients)
  //     recipients.forEach((rec: any, index: number) => {
  //       if (!rec.destination?.trim()) {
  //         emailErrors.push(`Email ${index + 1}: Recipient email is required`);
  //       }
  //       if (!rec.subject?.trim()) {
  //         emailErrors.push(`Email ${index + 1}: Subject is required`);
  //       }
  //     });

  //     // Check message requirements
  //     const hasSeparateMessages = recipients.some(
  //       (rec: any) => rec.separateMessage,
  //     );
  //     const allHaveMessages = recipients.every((rec: any) =>
  //       rec.separateMessage ? rec.body?.trim() !== "" : true,
  //     );

  //     if (hasSeparateMessages && !allHaveMessages) {
  //       validation.email.isFormValid = false;
  //       emailErrors.push("All separate messages must have content");
  //     }

  //     if (!hasSeparateMessages && !commonMessage.trim()) {
  //       validation.email.isFormValid = false;
  //       emailErrors.push(
  //         "Common message is required when separate messages are empty",
  //       );
  //     }

  //     console.log("emailErrors",emailErrors)

  //     if (emailErrors.length > 0) {
  //       validation.email.errors = { email: emailErrors };
  //     }
  //   }
  // }

  // SMS validation
  if (selectedServices.includes("sms")) {
    const smsErrors: string[] = [];

    if (!smsData || typeof smsData !== "object") {
      validation.sms.isFormValid = false;
      smsErrors.push("SMS service data is missing");
    } else {
      const sections = (smsData as any).sections || [];

      const hasValidDestination = sections?.some(
        ({ destination }: any) => destination?.trim() !== "",
      );

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
        slackErrors.push("At least one Channel ID is required");
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
