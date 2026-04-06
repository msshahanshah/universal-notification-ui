import { describe, it, expect } from "vitest";
import { validateSms } from "../validation";

describe("SMS Validation", () => {
  describe("validateSms", () => {
    it("should not return error when all required fields are present and are valid", () => {
      const smsData = {
        sections: [
          { destination: "+919876543210", message: "Test message" },
        ],
      };

      const sections = [
        { 
          numbers: [{ countryCode: "+91", number: "9876543210" }], 
          message: "Test message",
          separateMessage: true 
        },
      ];

      const result = validateSms(smsData, sections, "");

      expect(result.isFormValid).toBe(true);
      expect(result.errors).toEqual({});
    });

    it("should return error when smsData is null", () => {
      const result = validateSms(null, [], "");

      expect(result.isFormValid).toBe(false);
      expect(result.errors.sms).toContain("SMS service data is missing");
    });

    it("should return error when smsData is not an object", () => {
      const result = validateSms("invalid", [], "");

      expect(result.isFormValid).toBe(false);
      expect(result.errors.sms).toContain("SMS service data is missing");
    });

    it("should return error when no valid destination exists", () => {
      const smsData = {
        sections: [
          { destination: "", message: "Test message" },
        ],
      };

      const sections = [
        { 
          numbers: [{ countryCode: "+91", number: "" }], 
          message: "Test message" 
        },
      ];

      const result = validateSms(smsData, sections, "");

      expect(result.isFormValid).toBe(false);
      expect(result.errors.sms).toContain("At least one Phone Number is required");
    });

    it("should'nt return error when common message is provided", () => {
      const smsData = {
        sections: [
          { destination: "+919876543210", message: "" },
        ],
      };

      const sections = [
        { 
          numbers: [{ countryCode: "+91", number: "9876543210" }], 
          message: "" 
        },
      ];

      const result = validateSms(smsData, sections, "Common message");

      expect(result.isFormValid).toBe(true);
      expect(result.errors).toEqual({});
    });

    it("should return error when no message and no common message", () => {
      const smsData = {
        sections: [
          { destination: "+919876543210", message: "" },
        ],
      };

      const sections = [
        { 
          numbers: [{ countryCode: "+91", number: "9876543210" }], 
          message: "" 
        },
      ];

      const result = validateSms(smsData, sections, "");

      expect(result.isFormValid).toBe(false);
      expect(result.errors.sms).toContain(
        "SMS Section 1: A message is required when common message is not provided"
      );
    });

    it("should validate multiple sections correctly", () => {
      const smsData = {
        sections: [
          { destination: "+919876543210", message: "Message 1" },
          { destination: "+919876543211", message: "" },
          { destination: "+919876543212", message: "Message 3" },
        ],
      };

      const sections = [
        { 
          numbers: [{ countryCode: "+91", number: "9876543210" }], 
          message: "Message 1" 
        },
        { 
          numbers: [{ countryCode: "+91", number: "9876543211" }], 
          message: "" 
        },
        { 
          numbers: [{ countryCode: "+91", number: "9876543212" }], 
          message: "Message 3" 
        },
      ];

      const result = validateSms(smsData, sections, "");

      expect(result.isFormValid).toBe(false);
      expect(result.errors.sms).toContain(
        "SMS Section 2: A message is required when common message is not provided"
      );
    });

    // it("should handle empty sections array", () => {
    //   const smsData = {
    //     sections: [],
    //   };

    //   const sections = [];

    //   const result = validateSms(smsData, sections, "");

    //   expect(result.isFormValid).toBe(false);
    //   expect(result.errors.sms).toContain("At least one Phone Number is required");
    // });

    it("should validate phone numbers with country codes", () => {
      const smsData = {
        sections: [
          { destination: "+919876543210", message: "Test message" },
          { destination: "+11234567890", message: "Test message 2" },
        ],
      };

      const sections = [
        { 
          numbers: [{ countryCode: "+91", number: "9876543210" }], 
          message: "Test message" 
        },
        { 
          numbers: [{ countryCode: "+1", number: "1234567890" }], 
          message: "Test message 2" 
        },
      ];

      const result = validateSms(smsData, sections, "");

      expect(result.isFormValid).toBe(true);
      expect(result.errors).toEqual({});
    });

    it("should handle invalid phone numbers in section", () => {
      const smsData = {
        sections: [
          { destination: "+91", message: "Test message" },
        ],
      };

      const sections = [
        { 
          numbers: [{ countryCode: "+91", number: "" }], 
          message: "Test message" 
        },
      ];

      const result = validateSms(smsData, sections, "");

      expect(result.isFormValid).toBe(false);
      expect(result.errors.sms).toContain("SMS 1-1: Invalid phone number");
    });

    it("should validate multiple phone numbers in single section", () => {
      const smsData = {
        sections: [
          { destination: "+919876543210,+919876543211", message: "Test message" },
        ],
      };

      const sections = [
        { 
          numbers: [
            { countryCode: "+91", number: "9876543210" },
            { countryCode: "+91", number: "9876543211" }
          ], 
          message: "Test message" 
        },
      ];

      const result = validateSms(smsData, sections, "");

      expect(result.isFormValid).toBe(true);
      expect(result.errors).toEqual({});
    });

    // it("should handle mixed valid and invalid phone numbers", () => {
    //   const smsData = {
    //     sections: [
    //       { destination: "+919876543210", message: "Test message" },
    //     ],
    //   };

    //   const sections = [
    //     { 
    //       numbers: [
    //         { countryCode: "+91", number: "9876543210" },
    //         { countryCode: "+91", number: "" }
    //       ], 
    //       message: "Test message" 
    //     },
    //   ];

    //   const result = validateSms(smsData, sections, "");

    //   expect(result.isFormValid).toBe(true);
    //   expect(result.errors).toEqual({});
    // });

    // it("should return valid when at least one section has valid destination", () => {
    //   const smsData = {
    //     sections: [
    //       { destination: "", message: "" },
    //       { destination: "+919876543210", message: "Test message" },
    //     ],
    //   };

    //   const sections = [
    //     { 
    //       numbers: [{ countryCode: "+91", number: "" }], 
    //       message: "" 
    //     },
    //     { 
    //       numbers: [{ countryCode: "+91", number: "9876543210" }], 
    //       message: "Test message" 
    //     },
    //   ];

    //   const result = validateSms(smsData, sections, "");

    //   expect(result.isFormValid).toBe(true);
    //   expect(result.errors).toEqual({});
    // });

    it("should handle edge case with whitespace-only destination", () => {
      const smsData = {
        sections: [
          { destination: "   ", message: "Test message" },
        ],
      };

      const sections = [
        { 
          numbers: [{ countryCode: "+91", number: "9876543210" }], 
          message: "Test message" 
        },
      ];

      const result = validateSms(smsData, sections, "");

      expect(result.isFormValid).toBe(false);
      expect(result.errors.sms).toContain("At least one Phone Number is required");
    });
  });
});
