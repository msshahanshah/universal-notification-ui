/**
 * Validation utilities for multiple notification services
 */

import { useAtom } from "jotai";
import { emailSectionsAtom } from "src/atoms/emailAtoms";
import { slackSectionsAtom } from "src/atoms/slackAtoms";
import { smsSectionsAtom } from "src/atoms/smsAtoms";
import { whatsappSectionsAtom } from "src/atoms/whatsappAtoms";
import { slackRegex } from "src/utility/constants";

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

/* ===================== UTILITIES ===================== */

// Reusable file size validation function
const validateAttachmentFileSize = (
  attachment: any,
  maxSizeMB: number,
  sectionIndex: number,
  serviceName: string,
  errors: string[],
  markInvalid: () => void,
) => {
  if (attachment.file && attachment.file.size) {
    const isImage = attachment.file.type.startsWith("image/");
    const isVideo = attachment.file.type.startsWith("video/");

    if (isImage || isVideo) {
      const maxSizeBytes = maxSizeMB * 1024 * 1024;
      const fileSizeMB = (attachment.file.size / (1024 * 1024)).toFixed(2);

      if (attachment.file.size > maxSizeBytes) {
        markInvalid();
        errors.push(
          `${serviceName} Section ${sectionIndex + 1}: File "${attachment.file.name}" (${fileSizeMB}MB) exceeds ${maxSizeMB}MB limit. ${isImage ? "Image" : "Video"} files must be ${maxSizeMB}MB or smaller.`,
        );
      }
    }
  }
};

/* ===================== MAIN ===================== */

export const validateAllServices = (
  selectedServices: string[],
  emailData: any,
  smsData: any,
  slackData: any,
  whatsappData: any,
  commonMessage: string,
): ServiceValidation => {
  const atoms = useValidationAtoms();

  const email = shouldValidate("email", selectedServices)
    ? validateEmail(emailData, atoms.email, commonMessage)
    : getDefaultValidation();

  const sms = shouldValidate("sms", selectedServices)
    ? validateSms(smsData, atoms.sms, commonMessage)
    : getDefaultValidation();

  const slack = shouldValidate("slack", selectedServices)
    ? validateSlack(slackData, atoms.slack, commonMessage)
    : getDefaultValidation();

  const whatsapp = shouldValidate("whatsapp", selectedServices)
    ? validateWhatsapp(whatsappData, atoms.whatsapp, commonMessage)
    : getDefaultValidation();

  return buildFinalValidation(email, sms, slack, whatsapp);
};

/* ===================== ATOMS ===================== */

const useValidationAtoms = () => {
  const [sms] = useAtom(smsSectionsAtom);
  const [slack] = useAtom(slackSectionsAtom);
  const [email] = useAtom(emailSectionsAtom);
  const [whatsapp] = useAtom(whatsappSectionsAtom);

  return { sms, slack, email, whatsapp };
};

/* ===================== HELPERS ===================== */

const shouldValidate = (service: string, selected: string[]) =>
  selected.includes(service);

const getDefaultValidation = (): ValidationResult => ({
  isFormValid: true,
  errors: {},
});

const flattenErrors = (validation: ValidationResult): string[] =>
  Object.values(validation.errors || {}).flat();

const buildFinalValidation = (
  email: ValidationResult,
  sms: ValidationResult,
  slack: ValidationResult,
  whatsapp: ValidationResult,
): ServiceValidation => {
  const isFormValid =
    email.isFormValid &&
    sms.isFormValid &&
    slack.isFormValid &&
    whatsapp.isFormValid;

  return {
    email,
    sms,
    slack,
    whatsapp,
    isFormValid,
    errors: {
      email: flattenErrors(email),
      sms: flattenErrors(sms),
      slack: flattenErrors(slack),
      whatsapp: flattenErrors(whatsapp),
    },
  };
};

/* ===================== EMAIL ===================== */

const validateEmail = (
  emailData: any,
  sections: any[],
  commonMessage: string,
): ValidationResult => {
  const errors: string[] = [];
  let isFormValid = true;

  if (!emailData || typeof emailData !== "object") {
    return {
      isFormValid: false,
      errors: { email: ["Email service data is missing"] },
    };
  }

  const hasValidDestination = sections?.some(
    ({ to }: any) => to?.trim() !== "",
  );

  if (!hasValidDestination) {
    isFormValid = false;
    errors.push("At least one recipient email address is required");
  }

  sections.forEach((section: any, i: number) => {
    validateEmailSection(
      section,
      i,
      errors,
      () => (isFormValid = false),
      commonMessage,
    );
  });

  return {
    isFormValid,
    errors: errors.length ? { email: errors } : {},
  };
};

const validateEmailSection = (
  section: any,
  index: number,
  errors: string[],
  markInvalid: () => void,
  commonMessage: string,
) => {
  const i = index + 1;
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

  if (section?.from?.trim() && !emailRegex.test(section.from.trim())) {
    markInvalid();
    errors.push(`Email Section ${i}: Email in fromEmail is invalid`);
  }

  if (!section.to?.trim()) {
    markInvalid();
    errors.push(`Email Section ${i}: To can't be empty`);
  }

  if (section.to?.trim() && !emailRegex.test(section.to.trim())) {
    markInvalid();
    errors.push(`Email Section ${i}: Email in To is invalid`);
  }

  if (!section.subject?.trim()) {
    markInvalid();
    errors.push(`Email Section ${i}: Subject can't be empty`);
  }

  if (section.cc?.trim() && !emailRegex.test(section.cc.trim())) {
    markInvalid();
    errors.push(`Email Section ${i}: Email in cc is invalid`);
  }

  if (section.bcc?.trim() && !emailRegex.test(section.bcc.trim())) {
    markInvalid();
    errors.push(`Email Section ${i}: Email in bcc is invalid`);
  }

  if (!section.body?.trim() && !commonMessage.trim()) {
    markInvalid();
    errors.push(
      `Email Section ${i}: A body is required when "common message" is not provided`,
    );
  }

  if (
    section.attachments !== undefined &&
    !Array.isArray(section.attachments)
  ) {
    markInvalid();
    errors.push(`Email Section ${i}: Attachments must be list`);
  }

  if (section.attachments?.length > 10) {
    markInvalid();
    errors.push(`Email Section ${i}: Maximum 10 attachments allowed`);
  }

  // Validate file sizes for attachments (20MB limit)
  if (section.attachments && section.attachments.length > 0) {
    section.attachments.forEach((attachment: any, attachmentIndex: number) => {
      validateAttachmentFileSize(
        attachment,
        20, // 20MB limit
        index,
        "Email",
        errors,
        markInvalid,
      );
    });
  }
};

/* ===================== SMS ===================== */

const validateSms = (
  smsData: any,
  sections: any[],
  commonMessage: string,
): ValidationResult => {
  const errors: string[] = [];
  let isFormValid = true;

  if (!smsData || typeof smsData !== "object") {
    return {
      isFormValid: false,
      errors: { sms: ["SMS service data is missing"] },
    };
  }

  const hasValidDestination = smsData.sections?.some(
    ({ destination }: any) => destination?.trim() !== "",
  );

  if (!hasValidDestination) {
    isFormValid = false;
    errors.push("At least one Phone Number is required");
  }

  sections.forEach((section: any, i: number) => {
    validateSmsSection(
      section,
      i,
      errors,
      () => (isFormValid = false),
      commonMessage,
    );
  });

  return {
    isFormValid,
    errors: errors.length ? { sms: errors } : {},
  };
};

export { validateEmail, validateSms, validateSlack, validateWhatsapp };

const validateSmsSection = (
  section: any,
  index: number,
  errors: string[],
  markInvalid: () => void,
  commonMessage: string,
) => {
  section.numbers?.forEach((num: any, j: number) => {
    if (num.countryCode?.trim() && !num.number?.trim()) {
      markInvalid();
      errors.push(`SMS ${index + 1}-${j + 1}: Invalid phone number`);
    }
  });

  if (!section.message?.trim() && !commonMessage.trim()) {
    markInvalid();
    errors.push(
      `SMS Section ${index + 1}: A message is required when common message is not provided`,
    );
  }
};

/* ===================== SLACK ===================== */

const validateSlack = (
  slackData: any,
  sections: any[],
  commonMessage: string,
): ValidationResult => {
  const errors: string[] = [];
  let isFormValid = true;

  if (!slackData || typeof slackData !== "object") {
    return {
      isFormValid: false,
      errors: { slack: ["Slack service data is missing"] },
    };
  }

  const hasValidDestination = slackData.sections?.some(
    ({ destination, channelID }: any) =>
      destination?.trim() || channelID?.trim(),
  );

  if (!hasValidDestination) {
    isFormValid = false;
    errors.push("At least one Channel ID is required");
  }

  sections.forEach((section: any, i: number) => {
    validateSlackSection(
      section,
      i,
      errors,
      () => (isFormValid = false),
      commonMessage,
    );
  });

  return {
    isFormValid,
    errors: errors.length ? { slack: errors } : {},
  };
};

const validateSlackSection = (
  section: any,
  index: number,
  errors: string[],
  markInvalid: () => void,
  commonMessage: string,
) => {
  if (!section.message?.trim() && !commonMessage.trim()) {
    markInvalid();
    errors.push(
      `Slack Section ${index + 1}: A message is required when common message is not provided`,
    );
  }

  if (!section.destination?.trim() && !section.channelID?.trim()) {
    markInvalid();
    errors.push(`Slack Section ${index + 1}: Destination required`);
  }

  // Validate channel ID format if provided
  const channelId = section.destination?.trim() || section.channelID?.trim();
  if (channelId) {
    // Handle comma-separated channel IDs
    const channelIds = channelId.split(",").map((id: string) => id.trim());
    const invalidChannelIds = channelIds.filter(
      (id: string) => id && !slackRegex.test(id),
    );

    if (invalidChannelIds.length > 0) {
      markInvalid();
      errors.push(
        `Slack Section ${index + 1}: Invalid Slack channel ID: ${invalidChannelIds.join(", ")}`,
      );
    }
  }
};

/* ===================== WHATSAPP ===================== */

const validateWhatsapp = (
  whatsappData: any,
  sections: any[],
  commonMessage: string,
): ValidationResult => {
  const errors: string[] = [];
  let isFormValid = true;

  if (!whatsappData || typeof whatsappData !== "object") {
    return {
      isFormValid: false,
      errors: { whatsapp: ["WhatsApp service data is missing"] },
    };
  }

  const hasValidDestination = sections?.some(
    ({ to }: any) => to?.trim() !== "",
  );

  if (!hasValidDestination) {
    isFormValid = false;
    errors.push("At least one phone number required");
  }

  sections.forEach((section: any, i: number) => {
    validateWhatsappSection(
      section,
      i,
      errors,
      () => (isFormValid = false),
      commonMessage,
    );
  });

  return {
    isFormValid,
    errors: errors.length ? { whatsapp: errors } : {},
  };
};

const validateWhatsappSection = (
  section: any,
  index: number,
  errors: string[],
  markInvalid: () => void,
  commonMessage: string,
) => {
  section.numbers?.forEach((num: any, j: number) => {
    if (num.countryCode?.trim() && !num.number?.trim()) {
      markInvalid();
      errors.push(`WhatsApp ${index + 1}-${j + 1}: Invalid phone number`);
    }
  });

  if (
    !section.message?.trim() &&
    !commonMessage.trim() &&
    !section.templateId &&
    Array.isArray(section.attachments) &&
    section?.attachments?.length === 0
  ) {
    markInvalid();
    errors.push(
      `WhatsApp Section ${index + 1}: A "separate message/common message", "template" or attachments is required`,
    );
  }

  if (section.attachments && section.attachments.length > 10) {
    markInvalid();
    errors.push(
      `WhatsApp Section ${index + 1}: Maximum 10 attachments allowed`,
    );
  }

  // Validate file sizes for images and videos (16MB limit)
  if (section.attachments && section.attachments.length > 0) {
    section.attachments.forEach((attachment: any) => {
      validateAttachmentFileSize(
        attachment,
        16, // 16MB limit
        index,
        "WhatsApp",
        errors,
        markInvalid,
      );
    });
  }
};
