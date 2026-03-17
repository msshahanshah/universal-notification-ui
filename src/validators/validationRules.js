// Actual logic for each named rule

export const validationRules = {
  required: (value) =>
    !value || value.toString().trim() === "" ? "__REQUIRED__" : null,

  slackChannelIdFormat: (value) =>
    value && value.trim().length < 9 ? "__INVALID_SLACK_CHANNEL__" : null,
};

// Message map — mirrors API error messages exactly
// If API messages change, update here only.
export const validationMessages = {
  slack: {
    __REQUIRED__: {
      destination: "Destination is required", // API: "Destination is required"
      message: "Message cannot be empty", // API: "Message cannot be empty"
    },
    __INVALID_SLACK_CHANNEL__: {
      destination: "Invalid Slack channel ID: {value}", // API: "Invalid Slack channel ID: C0"
    },
  },
};
