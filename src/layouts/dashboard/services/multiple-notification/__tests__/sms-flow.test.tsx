// Testing pending

// import { describe, it, expect, beforeEach, vi } from "vitest";
// import { render, screen, fireEvent, waitFor } from "@testing-library/react";
// import { Provider } from "jotai";
// import { SMSWrapper } from "../sms-wrapper";
// import { smsSectionsAtom, smsCallbackDataAtom } from "src/atoms/smsAtoms";
// import { validateSms } from "../validation";
// import { smsSectionsAtom, smsCallbackDataAtom } from "src/atoms/smsAtoms";

// // Mock components
// vi.mock("src/components/button", () => ({
//   Button: ({ label, onClick, className, ...props }: any) => (
//     <button onClick={onClick} className={className} {...props}>
//       {label}
//     </button>
//   ),
// }));

// vi.mock("src/components/input", () => ({
//   Input: ({ value, onChange, placeholder, ...props }: any) => (
//     <input
//       value={value}
//       onChange={onChange}
//       placeholder={placeholder}
//       {...props}
//     />
//   ),
// }));

// vi.mock("../SMS/country-code-select", () => ({
//   CountryCodeSelect: ({ value, onChange }: any) => (
//     <select value={value} onChange={(e) => onChange(e.target.value)}>
//       <option value="+91">+91</option>
//       <option value="+1">+1</option>
//     </select>
//   ),
// }));

// vi.mock("./helper", () => ({
//   AddButton: ({ title, onClick, data, maxBlocks }: any) => (
//     <button
//       onClick={onClick}
//       disabled={data.length >= maxBlocks}
//       data-testid={`add-${title}-button`}
//     >
//       Add {title} Section
//     </button>
//   ),
// }));

// // Test wrapper component
// const TestWrapper = ({ children }: { children: React.ReactNode }) => (
//   <Provider>{children}</Provider>
// );

// describe("SMS Flow Tests", () => {
//   beforeEach(() => {
//     // Reset atoms before each test
//     vi.mocked(smsSectionsAtom).mockReturnValue([]);
//     vi.mocked(smsCallbackDataAtom).mockReturnValue({
//       destination: [],
//       message: [],
//       sections: [],
//     });
//   });

//   describe("SMSWrapper Component", () => {
//     it("should render initial SMS section", () => {
//       render(
//         <TestWrapper>
//           <SMSWrapper onValueChange={vi.fn()} />
//         </TestWrapper>
//       );

//       expect(screen.getByText("SMS Section 1")).toBeInTheDocument();
//       expect(screen.getByPlaceholderText("Enter receiver number")).toBeInTheDocument();
//       expect(screen.getByText("Add Another Number")).toBeInTheDocument();
//       expect(screen.getByText("Send separate message")).toBeInTheDocument();
//     });

//     it("should allow adding multiple phone numbers in a section", async () => {
//       const onValueChange = vi.fn();
//       render(
//         <TestWrapper>
//           <SMSWrapper onValueChange={onValueChange} />
//         </TestWrapper>
//       );

//       // Add another number
//       const addNumberButton = screen.getByText("Add Another Number");
//       fireEvent.click(addNumberButton);

//       await waitFor(() => {
//         const phoneInputs = screen.getAllByPlaceholderText("Enter receiver number");
//         expect(phoneInputs).toHaveLength(2);
//       });
//     });

//     it("should allow removing phone numbers", async () => {
//       const onValueChange = vi.fn();
//       render(
//         <TestWrapper>
//           <SMSWrapper onValueChange={onValueChange} />
//         </TestWrapper>
//       );

//       // Add another number first
//       const addNumberButton = screen.getByText("Add Another Number");
//       fireEvent.click(addNumberButton);

//       await waitFor(() => {
//         const removeButtons = screen.getAllByText("×");
//         expect(removeButtons).toHaveLength(1); // Only one remove button for the second number
//       });

//       // Remove the second number
//       const removeButton = screen.getAllByText("×")[0];
//       fireEvent.click(removeButton);

//       await waitFor(() => {
//         const phoneInputs = screen.getAllByPlaceholderText("Enter receiver number");
//         expect(phoneInputs).toHaveLength(1);
//       });
//     });

//     it("should allow adding multiple SMS sections", async () => {
//       const onValueChange = vi.fn();
//       render(
//         <TestWrapper>
//           <SMSWrapper onValueChange={onValueChange} maxBlocks={3} />
//         </TestWrapper>
//       );

//       // Add another section
//       const addSectionButton = screen.getByTestId("add-SMS-button");
//       fireEvent.click(addSectionButton);

//       await waitFor(() => {
//         expect(screen.getByText("SMS Section 1")).toBeInTheDocument();
//         expect(screen.getByText("SMS Section 2")).toBeInTheDocument();
//       });
//     });

//     it("should allow removing SMS sections", async () => {
//       const onValueChange = vi.fn();
//       render(
//         <TestWrapper>
//           <SMSWrapper onValueChange={onValueChange} maxBlocks={3} />
//         </TestWrapper>
//       );

//       // Add another section first
//       const addSectionButton = screen.getByTestId("add-SMS-button");
//       fireEvent.click(addSectionButton);

//       await waitFor(() => {
//         const removeButtons = screen.getAllByText("×");
//         expect(removeButtons).toHaveLength(1); // Only one remove button for the second section
//       });

//       // Remove the second section
//       const removeButton = screen.getAllByText("×")[0];
//       fireEvent.click(removeButton);

//       await waitFor(() => {
//         expect(screen.getByText("SMS Section 1")).toBeInTheDocument();
//         expect(screen.queryByText("SMS Section 2")).not.toBeInTheDocument();
//       });
//     });

//     it("should toggle separate message for each section", async () => {
//       const onValueChange = vi.fn();
//       render(
//         <TestWrapper>
//           <SMSWrapper onValueChange={onValueChange} />
//         </TestWrapper>
//       );

//       const toggleButton = screen.getByText("Send separate message");
//       fireEvent.click(toggleButton);

//       await waitFor(() => {
//         expect(screen.getByText("Use common message")).toBeInTheDocument();
//         expect(screen.getByPlaceholderText("Type your message...")).toBeInTheDocument();
//       });
//     });

//     it("should only accept numeric input for phone numbers", () => {
//       const onValueChange = vi.fn();
//       render(
//         <TestWrapper>
//           <SMSWrapper onValueChange={onValueChange} />
//         </TestWrapper>
//       );

//       const phoneInput = screen.getByPlaceholderText("Enter receiver number");
      
//       fireEvent.change(phoneInput, { target: { value: "abc123" } });
//       expect(phoneInput).toHaveValue("123"); // Only numbers should remain

//       fireEvent.change(phoneInput, { target: { value: "9876543210" } });
//       expect(phoneInput).toHaveValue("9876543210");
//     });

//     it("should call onValueChange when values change", async () => {
//       const onValueChange = vi.fn();
//       render(
//         <TestWrapper>
//           <SMSWrapper onValueChange={onValueChange} />
//         </TestWrapper>
//       );

//       const phoneInput = screen.getByPlaceholderText("Enter receiver number");
//       fireEvent.change(phoneInput, { target: { value: "9876543210" } });

//       await waitFor(() => {
//         expect(onValueChange).toHaveBeenCalled();
//       });
//     });

//     it("should not allow adding more than maxBlocks sections", () => {
//       const onValueChange = vi.fn();
//       render(
//         <TestWrapper>
//           <SMSWrapper onValueChange={onValueChange} maxBlocks={1} />
//         </TestWrapper>
//       );

//       const addSectionButton = screen.getByTestId("add-SMS-button");
//       expect(addSectionButton).toBeDisabled();
//     });
//   });

//   describe("SMS Validation", () => {
//     it("should validate SMS data correctly", () => {
//       const smsData = {
//         sections: [
//           { destination: "+919876543210", message: "Test message" },
//         ],
//       };

//       const sections = [
//         { numbers: [{ countryCode: "+91", number: "9876543210" }], message: "Test message" },
//       ];

//       const result = validateSms(smsData, sections, "");

//       expect(result.isFormValid).toBe(true);
//       expect(result.errors).toEqual({});
//     });

//     it("should fail validation when SMS data is missing", () => {
//       const result = validateSms(null, [], "");

//       expect(result.isFormValid).toBe(false);
//       expect(result.errors.sms).toContain("SMS service data is missing");
//     });

//     it("should fail validation when no valid destination", () => {
//       const smsData = {
//         sections: [
//           { destination: "", message: "Test message" },
//         ],
//       };

//       const sections = [
//         { numbers: [{ countryCode: "+91", number: "" }], message: "Test message" },
//       ];

//       const result = validateSms(smsData, sections, "");

//       expect(result.isFormValid).toBe(false);
//       expect(result.errors.sms).toContain("At least one Phone Number is required");
//     });

//     it("should fail validation when message is empty and no common message", () => {
//       const smsData = {
//         sections: [
//           { destination: "+919876543210", message: "" },
//         ],
//       };

//       const sections = [
//         { numbers: [{ countryCode: "+91", number: "9876543210" }], message: "" },
//       ];

//       const result = validateSms(smsData, sections, "");

//       expect(result.isFormValid).toBe(false);
//       expect(result.errors.sms).toContain("SMS Section 1: A message is required when common message is not provided");
//     });

//     it("should pass validation with common message", () => {
//       const smsData = {
//         sections: [
//           { destination: "+919876543210", message: "" },
//         ],
//       };

//       const sections = [
//         { numbers: [{ countryCode: "+91", number: "9876543210" }], message: "" },
//       ];

//       const result = validateSms(smsData, sections, "Common message");

//       expect(result.isFormValid).toBe(true);
//       expect(result.errors).toEqual({});
//     });

//     it("should validate multiple sections", () => {
//       const smsData = {
//         sections: [
//           { destination: "+919876543210", message: "Message 1" },
//           { destination: "+919876543211", message: "" },
//         ],
//       };

//       const sections = [
//         { numbers: [{ countryCode: "+91", number: "9876543210" }], message: "Message 1" },
//         { numbers: [{ countryCode: "+91", number: "9876543211" }], message: "" },
//       ];

//       const result = validateSms(smsData, sections, "");

//       expect(result.isFormValid).toBe(false);
//       expect(result.errors.sms).toContain("SMS Section 2: A message is required when common message is not provided");
//     });

//     it("should handle invalid phone numbers", () => {
//       const smsData = {
//         sections: [
//           { destination: "+91", message: "Test message" },
//         ],
//       };

//       const sections = [
//         { numbers: [{ countryCode: "+91", number: "" }], message: "Test message" },
//       ];

//       const result = validateSms(smsData, sections, "");

//       expect(result.isFormValid).toBe(false);
//       expect(result.errors.sms).toContain("At least one Phone Number is required");
//     });

//     it("should validate multiple phone numbers in a section", () => {
//       const smsData = {
//         sections: [
//           { destination: "+919876543210,+919876543211", message: "Test message" },
//         ],
//       };

//       const sections = [
//         { 
//           numbers: [
//             { countryCode: "+91", number: "9876543210" },
//             { countryCode: "+91", number: "9876543211" }
//           ], 
//           message: "Test message" 
//         },
//       ];

//       const result = validateSms(smsData, sections, "");

//       expect(result.isFormValid).toBe(true);
//       expect(result.errors).toEqual({});
//     });
//   });

//   describe("SMS Integration Tests", () => {
//     it("should complete full SMS flow", async () => {
//       const onValueChange = vi.fn();
//       render(
//         <TestWrapper>
//           <SMSWrapper onValueChange={onValueChange} />
//         </TestWrapper>
//       );

//       // Add phone number
//       const phoneInput = screen.getByPlaceholderText("Enter receiver number");
//       fireEvent.change(phoneInput, { target: { value: "9876543210" } });

//       // Add another number
//       const addNumberButton = screen.getByText("Add Another Number");
//       fireEvent.click(addNumberButton);

//       await waitFor(() => {
//         const phoneInputs = screen.getAllByPlaceholderText("Enter receiver number");
//         fireEvent.change(phoneInputs[1], { target: { value: "9876543211" } });
//       });

//       // Toggle separate message
//       const toggleButton = screen.getByText("Send separate message");
//       fireEvent.click(toggleButton);

//       // Add separate message
//       const messageTextarea = screen.getByPlaceholderText("Type your message...");
//       fireEvent.change(messageTextarea, { target: { value: "Test message" } });

//       // Verify onValueChange was called with correct data
//       await waitFor(() => {
//         expect(onValueChange).toHaveBeenCalled();
//         const callArgs = onValueChange.mock.calls[0][0];
//         expect(callArgs.destination).toContain("+919876543210");
//         expect(callArgs.destination).toContain("+919876543211");
//         expect(callArgs.message).toContain("Test message");
//       });
//     });
//   });
// });
