import { useEffect } from "react";
import { Typography } from "@mui/material";
import { useQueryClient } from "@tanstack/react-query";
import { useAtom } from "jotai";

import { useSmsService } from "src/hooks/useService";
import Button from "src/components/button";
import Input from "src/components/input";
import { useSnackbar } from "src/provider/snackbar";
import { logsKeys } from "src/api/queryKeys";
// import { CountryCodeSelect } from "../sms/country-code-select";

import "../SMS/sms-composer.css";
import { CountryCodeSelect } from "../SMS/country-code-select";
import { 
  smsSectionsAtom, 
  smsCallbackDataAtom,
  type SMSNumber,
  type SMSSection 
} from "src/atoms/smsAtoms";

interface SMSWrapperProps {
  showMessage: boolean;
  onValueChange?: (values: {
    destination: string[];
    message: string[];
    sections: any[];
  }) => void;
  maxBlocks?: number;
}

export function SMSWrapper({
  showMessage,
  onValueChange,
  maxBlocks = 5,
}: SMSWrapperProps) {
  // Replace local state with atoms
  const [sections, setSections] = useAtom(smsSectionsAtom);
  const [callbackData] = useAtom(smsCallbackDataAtom);

  console.log("sections", sections);

  // Pass values to parent whenever they change (using computed atom)
  useEffect(() => {
    if (onValueChange) {
      onValueChange(callbackData);
    }
  }, [callbackData, onValueChange]);

  const { mutate } = useSmsService();
  const showSnackbar = useSnackbar();
  const queryClient = useQueryClient();


  // Section management functions
  const addSection = () => {
    if (sections.length >= maxBlocks) {
      return; // Don't add more than maxBlocks
    }
    const newId = (
      Math.max(...sections.map((s) => parseInt(s.id))) + 1
    ).toString();
    setSections([
      ...sections,
      {
        id: newId,
        numbers: [{ id: "1", countryCode: "+91", number: "" }],
        message: "",
        separateMessage: false,
      },
    ]);
  };

  const removeSection = (sectionId: string) => {
    if (sections.length > 1) {
      setSections(sections.filter((section) => section.id !== sectionId));
    }
  };

  const updateSection = (
    sectionId: string,
    field: keyof SMSSection,
    value: string | boolean,
  ) => {
    const latestSection = sections.map((section) =>
      section.id === sectionId ? { ...section, [field]: value } : section,
    );
    console.log("latestSection", latestSection);
    setSections(latestSection);
  };

  // Number management functions within sections
  const addNumberToSection = (sectionId: string) => {
    setSections(
      sections.map((section) => {
        if (section.id === sectionId) {
          const newId = (
            Math.max(...section.numbers.map((n) => parseInt(n.id))) + 1
          ).toString();
          return {
            ...section,
            numbers: [
              ...section.numbers,
              { id: newId, countryCode: "+91", number: "" },
            ],
          };
        }
        return section;
      }),
    );
  };

  const removeNumberFromSection = (sectionId: string, numberId: string) => {
    setSections(
      sections.map((section) => {
        if (section.id === sectionId && section.numbers.length > 1) {
          return {
            ...section,
            numbers: section.numbers.filter((num) => num.id !== numberId),
          };
        }
        return section;
      }),
    );
  };

  const updateNumberInSection = (
    sectionId: string,
    numberId: string,
    field: keyof SMSNumber,
    value: string,
  ) => {
    setSections(
      sections.map((section) => {
        if (section.id === sectionId) {
          return {
            ...section,
            numbers: section.numbers.map((num) =>
              num.id === numberId ? { ...num, [field]: value } : num,
            ),
          };
        }
        return section;
      }),
    );
  };

  return (
    <div className="sms-wrapper">
      {/* <label style={{ fontSize: "12px" }}>
        Phone numbers
        <span style={{ color: "red", marginLeft: 2 }}>*</span>
      </label> */}

      {sections.map((section, sectionIndex) => (
        <div
          key={section.id}
          style={{
            marginBottom: 16,
            padding: "12px",
            border: "1px solid rgba(255,255,255,0.1)",
            borderRadius: "8px",
          }}
        >
          {sections.length > 1 && (
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                marginBottom: 12,
              }}
            >
              <span style={{ fontSize: "14px", fontWeight: "bold" }}>
                SMS {sectionIndex + 1}
              </span>
              <button
                onClick={() => removeSection(section.id)}
                style={{
                  background: "transparent",
                  border: "none",
                  color: "red",
                  fontSize: "16px",
                  cursor: "pointer",
                }}
              >
                ×
              </button>
            </div>
          )}

          <label
            style={{ fontSize: "12px", marginBottom: 8, display: "block" }}
          >
            Phone Numbers
            <span style={{ color: "red", marginLeft: 2 }}>*</span>
          </label>

          {section.numbers.map((num, numIndex) => (
            <div
              key={num.id}
              className="sms-to-row"
              style={{ marginBottom: 8 }}
            >
              <CountryCodeSelect
                value={num.countryCode}
                onChange={(value) =>
                  updateNumberInSection(
                    section.id,
                    num.id,
                    "countryCode",
                    value,
                  )
                }
              />
              <Input
                id={`sms-number-${num.id}`}
                type="tel"
                className="sms-input"
                placeholder="Enter receiver number"
                value={num.number}
                inputMode="numeric"
                onChange={(e) => {
                  const onlyNums = e.target.value.replace(/\D/g, ""); // remove non-digits
                  updateNumberInSection(section.id, num.id, "number", onlyNums);
                }}
              />
              {section.numbers.length > 1 && (
                <button
                  onClick={() => removeNumberFromSection(section.id, num.id)}
                  style={{
                    marginLeft: 8,
                    cursor: "pointer",
                    background: "transparent",
                    border: "none",
                    color: "red",
                    fontSize: 18,
                  }}
                >
                  ×
                </button>
              )}
            </div>
          ))}

          <button
            onClick={() => addNumberToSection(section.id)}
            style={{
              padding: "4px 8px",
              fontSize: "10px",
              background: "rgba(255, 255, 255, 0.1)",
              border: "1px solid rgba(255, 255, 255, 0.2)",
              color: "#fff",
              borderRadius: "4px",
              cursor: "pointer",
              transition: "all 0.2s",
              marginTop: 4,
              marginBottom: 8,
            }}
          >
            Add Another Number
          </button>

          {/* Separate Message Toggle for each SMS section */}
          {/* {showMessage && ( */}
          <>
            <button
              onClick={() =>
                updateSection(
                  section.id,
                  "separateMessage",
                  !section.separateMessage,
                )
              }
              style={{
                padding: "4px 8px",
                fontSize: "10px",
                background: section.separateMessage
                  ? "rgba(76, 175, 80, 0.2)"
                  : "rgba(255, 255, 255, 0.1)",
                border: `1px solid ${section.separateMessage ? "#4CAF50" : "rgba(255, 255, 255, 0.2)"}`,
                color: section.separateMessage ? "#4CAF50" : "#fff",
                borderRadius: "4px",
                cursor: "pointer",
                transition: "all 0.2s",
                marginTop: 8,
                marginBottom: 8,
                width: "100%",
              }}
            >
              {section.separateMessage
                ? "✓ Using Separate Message"
                : "I want to send separate message"}
            </button>

            {section.separateMessage && (
              <>
                <label
                  style={{
                    marginBottom: 4,
                    fontSize: "12px",
                    display: "block",
                  }}
                >
                  Message {sectionIndex + 1}
                  <span style={{ color: "red", marginLeft: 2 }}>*</span>
                </label>
                <textarea
                  className="sms-textarea"
                  placeholder="Type your message..."
                  value={section.message}
                  onChange={(e) =>
                    updateSection(section.id, "message", e.target.value)
                  }
                  rows={4}
                />
              </>
            )}
          </>
          {/* )} */}
        </div>
      ))}

      <button
        onClick={addSection}
        disabled={sections.length >= maxBlocks}
        style={{
          padding: "6px 12px",
          fontSize: "12px",
          background:
            sections.length >= maxBlocks
              ? "rgba(128, 128, 128, 0.2)"
              : "rgba(255, 255, 255, 0.1)",
          border: `1px solid ${sections.length >= maxBlocks ? "rgba(128, 128, 128, 0.4)" : "rgba(255, 255, 255, 0.2)"}`,
          color: sections.length >= maxBlocks ? "#888" : "#fff",
          borderRadius: "6px",
          cursor: sections.length >= maxBlocks ? "not-allowed" : "pointer",
          transition: "all 0.2s",
          marginTop: 8,
        }}
      >
        {sections.length >= maxBlocks
          ? `Max ${maxBlocks} SMS sections reached`
          : `Add Another SMS Section (${sections.length}/${maxBlocks})`}
      </button>
    </div>
  );
}
