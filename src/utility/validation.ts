/**
 * Validation utilities for multiple notification services
 */

import { useAtom } from 'jotai';
import { emailSectionsAtom } from 'src/atoms/emailAtoms';
import { slackSectionsAtom } from 'src/atoms/slackAtoms';
import { smsSectionsAtom } from 'src/atoms/smsAtoms';
import { whatsappSectionsAtom } from 'src/atoms/whatsappAtoms';

export interface ValidationResult {
  isFormValid: boolean;
  errors: Record<string, string[]>;
}

export interface ServiceValidation {
  email: ValidationResult;
  sms: ValidationResult;
  slack: ValidationResult;
  whatsapp: ValidationResult;
  isFormValid: boolean;
  errors: Record<string, string[]>;
}

// Reusable file size validation function
const validateAttachmentFileSize = (
  attachment: any,
  maxSizeMB: number,
  sectionIndex: number,
  serviceName: string,
  errors: string[],
  markInvalid: () => void
) => {
  if (attachment.file && attachment.file.size) {
    const isImage = attachment.file.type.startsWith('image/');
    const isVideo = attachment.file.type.startsWith('video/');
    
    if (isImage || isVideo) {
      const maxSizeBytes = maxSizeMB * 1024 * 1024;
      const fileSizeMB = (attachment.file.size / (1024 * 1024)).toFixed(2);
      
      if (attachment.file.size > maxSizeBytes) {
        markInvalid();
        errors.push(
          `${serviceName} Section ${sectionIndex + 1}: File "${attachment.file.name}" (${fileSizeMB}MB) exceeds ${maxSizeMB}MB limit. ${isImage ? 'Image' : 'Video'} files must be ${maxSizeMB}MB or smaller.`
        );
      }
    }
  }
};

/**
 * Validates all selected services and their requirements
 */
export const validateAllServices = (
  selectedServices: string[],
  emailData: any,
  smsData: any,
  slackData: any,
  whatsappData: any,
  commonMessage: string,
): ServiceValidation => {
  const [smsInputData] = useAtom(smsSectionsAtom);
  const [slackInputData] = useAtom(slackSectionsAtom);
  const [emailInputData] = useAtom(emailSectionsAtom);
  const [whatsappInputData] = useAtom(whatsappSectionsAtom);
  const validation: ServiceValidation = {
    email: { isFormValid: true, errors: {} },
    sms: { isFormValid: true, errors: {} },
    slack: { isFormValid: true, errors: {} },
    whatsapp: { isFormValid: true, errors: {} },
    isFormValid: true,
    errors: {},
  };

  if (selectedServices.includes('email')) {
    const emailErrors: string[] = [];

    if (!emailData || typeof emailData !== 'object') {
      validation.email.isFormValid = false;
      emailErrors.push('Email service data is missing');
    } else {
      // At least one destination must be provided
      const hasValidDestination = emailInputData?.some(
        ({ to }: any) => to?.trim() !== '',
      );

      if (!hasValidDestination) {
        validation.email.isFormValid = false;
        emailErrors.push('At least one recipient email address is required');
      }

      // Per-section validations
      emailInputData.forEach((section: any, sectionIndex: number) => {
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
            `Email Section ${sectionIndex + 1}: A body is required when "common message" is not provided`,
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

        // Limit number of attachments (max 10)
        if (section.attachments && section.attachments.length > 10) {
          validation.email.isFormValid = false;
          emailErrors.push(
            `Email Section ${sectionIndex + 1}: Maximum 10 attachments allowed`,
          );
        }

        // Validate file sizes for attachments (20MB limit)
        if (section.attachments && section.attachments.length > 0) {
          section.attachments.forEach((attachment: any, attachmentIndex: number) => {
            validateAttachmentFileSize(
              attachment,
              20, // 20MB limit
              sectionIndex,
              "Email",
              emailErrors,
              () => (validation.email.isFormValid = false)
            );
          });
        }
      });
    }

    if (emailErrors.length > 0) {
      validation.email.errors = { email: emailErrors };
    }
  }

  // SMS validation
  if (selectedServices.includes('sms')) {
    const smsErrors: string[] = [];

    if (!smsData || typeof smsData !== 'object') {
      validation.sms.isFormValid = false;
      smsErrors.push('SMS service data is missing');
    } else {
      const sections = (smsData as any).sections || [];

      const hasValidDestination = sections?.some(
        ({ destination }: any) => destination?.trim() !== '',
      );

      if (!hasValidDestination) {
        validation.sms.isFormValid = false;
        smsErrors.push('At least one Phone Number is required');
      }

      // Check for sections with country code but missing phone number
      smsInputData.forEach((section: any, sectionIndex: number) => {
        if (section.numbers) {
          section.numbers.forEach((num: any, numIndex: number) => {
            const hasCountryCode =
              num.countryCode && num.countryCode.trim() !== '';
            const hasPhoneNumber = num.number && num.number.trim() !== '';

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
        section.numbers?.forEach((num: any) => {
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
  if (selectedServices.includes('slack')) {
    const slackErrors: string[] = [];

    if (!slackData || typeof slackData !== 'object') {
      validation.slack.isFormValid = false;
      slackErrors.push('Slack service data is missing');
    } else {
      const sections = (slackData as any).sections || [];

      // At least one destination must be provided
      const hasValidDestination = sections?.some(
        ({ destination, channelID }: any) =>
          destination?.trim() !== '' || channelID?.trim() !== '',
      );

      if (!hasValidDestination) {
        validation.slack.isFormValid = false;
        slackErrors.push('At least one Channel ID is required');
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

        const destination = section.destination || section.channelID;

        if (destination?.trim()) {
          const channelIds = destination
            .split(',')
            .map((id: string) => id.trim())
            .filter((id: string) => id.length > 0);

          const uniqueChannelIds = new Set(channelIds);
          if (channelIds.length !== uniqueChannelIds.size) {
            validation.slack.isFormValid = false;
            slackErrors.push(
              `Slack Section ${sectionIndex + 1}: Duplicate Slack channel IDs are not allowed`,
            );
          }
        }
      });
    }

    if (slackErrors.length > 0) {
      validation.slack.errors = { slack: slackErrors };
    }
  }

  // WhatsApp validation
  if (selectedServices.includes('whatsapp')) {
    const whatsappErrors: string[] = [];

    if (!whatsappData || typeof whatsappData !== 'object') {
      validation.whatsapp.isFormValid = false;
      whatsappErrors.push('WhatsApp service data is missing');
    } else {
      // At least one destination must be provided
      const hasValidDestination = whatsappInputData?.some(
        ({ to }: any) => to?.trim() !== '',
      );

      if (!hasValidDestination) {
        validation.whatsapp.isFormValid = false;
        whatsappErrors.push('At least one recipient phone number is required');
      }

      // Per-section validations
      whatsappInputData.forEach((section: any, sectionIndex: number) => {
        // Validate phone numbers with country codes
        section.numbers.forEach((num: any, numIndex: number) => {
          const phonenNumberRegex = new RegExp(/^\+[0-9]+$/);

          if (
            num.number.trim() &&
            !phonenNumberRegex.test(`${num.countryCode}${num.number.trim()}`)
          ) {
            validation.whatsapp.isFormValid = false;
            whatsappErrors.push(
              `WhatsApp Section ${sectionIndex + 1}, Number ${numIndex + 1}: Invalid phone number format`,
            );
          }
        });

        // Ensure at least one valid number
        const hasValidNumber = section.numbers.some(
          (num: any) => num.number.trim() !== '',
        );
        if (!hasValidNumber) {
          validation.whatsapp.isFormValid = false;
          whatsappErrors.push(
            `WhatsApp Section ${sectionIndex + 1}: At least one phone number is required`,
          );
        }

        // Body or commonMessage must be provided
        if (
          !section.message?.trim() &&
          !commonMessage.trim() &&
          !section.templateId &&
          Array.isArray(section.attachments) &&
          section?.attachments?.length === 0
        ) {
          validation.whatsapp.isFormValid = false;
          whatsappErrors.push(
            `WhatsApp Section ${sectionIndex + 1}: A "separate message/common message", "template" or attachments is required`,
          );
        }

        // attachments must be an array if present
        if (
          section.attachments !== undefined &&
          !Array.isArray(section.attachments)
        ) {
          validation.whatsapp.isFormValid = false;
          whatsappErrors.push(
            `WhatsApp Section ${sectionIndex + 1}: Attachments must be a valid list`,
          );
        }

        // Validate variableValues structure
        if (
          section.variableValues &&
          typeof section.variableValues !== 'object'
        ) {
          validation.whatsapp.isFormValid = false;
          whatsappErrors.push(
            `WhatsApp Section ${sectionIndex + 1}: Variable values must be an object`,
          );
        }

        // Limit number of attachments (max 10)
        if (section.attachments && section.attachments.length > 10) {
          validation.whatsapp.isFormValid = false;
          whatsappErrors.push(
            `WhatsApp Section ${sectionIndex + 1}: Maximum 10 attachments allowed`,
          );
        }

        // Validate file sizes for images and videos (16MB limit)
        if (section.attachments && section.attachments.length > 0) {
          section.attachments.forEach((attachment: any) => {
            validateAttachmentFileSize(
              attachment,
              16, // 16MB limit
              sectionIndex,
              "WhatsApp",
              whatsappErrors,
              () => (validation.whatsapp.isFormValid = false)
            );
          });
        }

        // Validate attachment type
        if (
          !section.attachmentType ||
          !['file', 'url'].includes(section.attachmentType)
        ) {
          validation.whatsapp.isFormValid = false;
          whatsappErrors.push(
            `WhatsApp Section ${sectionIndex + 1}: Attachment type must be selected`,
          );
        }

        // Limit number of attachments (max 10)
        if (section.attachments && section.attachments.length > 10) {
          validation.whatsapp.isFormValid = false;
          whatsappErrors.push(
            `WhatsApp Section ${sectionIndex + 1}: Maximum 10 attachments allowed`,
          );
        }

        // Validate WhatsApp URL attachments
        if (
          section.attachments &&
          section.attachments.length > 0 &&
          section.attachmentType === 'url'
        ) {
          const invalidAttachments = section.attachments.filter(
            (attachment: any) => {
              const url = attachment.url || attachment.name;

              // Check for HTTPS
              if (url.startsWith('https://')) {
                return false; // Valid
              }

              // Check for valid file extensions (case insensitive)
              const validExtensions = [
                '.png',
                '.jpg',
                '.jpeg',
                '.gif',
                '.pdf',
                '.doc',
                '.docx',
                '.txt',
                '.zip',
                '.mp4',
                '.mp3',
              ];
              const hasValidExtension = validExtensions.some((ext) =>
                url.toLowerCase().endsWith(ext),
              );

              return !hasValidExtension; // Return true if invalid
            },
          );

          if (invalidAttachments.length > 0) {
            validation.whatsapp.isFormValid = false;
            whatsappErrors.push(
              `WhatsApp Section ${sectionIndex + 1}: Invalid attachment URLs: ${invalidAttachments.map((a: any) => a.url || a.name).join(', ')}\nURLs must start with "https://" or have valid file extensions like .png, .jpg, .pdf, etc.`,
            );
          }
        }

        // Validate template variables
        if (section.selectedTemplate && section.variableValues) {
          const requiredFields = section.selectedTemplate.requiredFields || [];
          const missingFields = requiredFields.filter(
            (field: any) =>
              !section.variableValues![field.name] ||
              section.variableValues![field.name].trim() === '',
          );

          if (missingFields.length > 0) {
            validation.whatsapp.isFormValid = false;
            whatsappErrors.push(
              `WhatsApp Section ${sectionIndex + 1}: Missing values for template variables: ${missingFields.map((f: any) => f.name).join(', ')}`,
            );
          }
        }
      });
    }

    if (whatsappErrors.length > 0) {
      validation.whatsapp.errors = { whatsapp: whatsappErrors };
    }
  }

  // Overall validation
  const overallValid =
    validation.email.isFormValid &&
    validation.sms.isFormValid &&
    validation.slack.isFormValid &&
    validation.whatsapp.isFormValid;

  return {
    email: validation.email,
    sms: validation.sms,
    slack: validation.slack,
    whatsapp: validation.whatsapp,
    isFormValid: overallValid,
    errors: {
      email: Object.values(validation.email.errors).flat(),
      sms: Object.values(validation.sms.errors).flat(),
      slack: Object.values(validation.slack.errors).flat(),
      whatsapp: Object.values(validation.whatsapp.errors).flat(),
    },
  };
};
