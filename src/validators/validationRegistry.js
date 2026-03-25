// src/validators/validationRegistry.js
// ⚠️ THIS IS THE SOURCE OF TRUTH FOR ALL SERVICE VALIDATIONS
// Do not add validations inline in components or pages.
// All changes to service validation rules must be made here only.

export const validationRegistry = {
  slack: {
    destination: ["required", "slackChannelIdFormat"],
    message: ["required"],
  },
};

// Payload shape reference per service (source of truth)
// slack    => { destination: string, message: string }