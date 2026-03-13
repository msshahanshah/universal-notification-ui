import { useState, useEffect, useMemo } from "react";
import { Typography } from "@mui/material";
import { useQueryClient } from "@tanstack/react-query";

import { useSmsService } from "src/hooks/useService";
import Button from "src/components/button";
import Input from "src/components/input";
import { useSnackbar } from "src/provider/snackbar";
import { logsKeys } from "src/api/queryKeys";
// import { CountryCodeSelect } from "../sms/country-code-select";

import "../SMS/sms-composer.css";
import { CountryCodeSelect } from "../SMS/country-code-select";

interface SMSNumber {
  id: string;
  countryCode: string;
  number: string;
}

interface SMSWrapperProps {
  showMessage: boolean;
  onValueChange?: (values: { destination: string[]; message: string }) => void;
}

export function SMSWrapper({ showMessage, onValueChange }: SMSWrapperProps) {
  const [message, setMessage] = useState("");
  const [numbers, setNumbers] = useState<SMSNumber[]>([
    { id: "1", countryCode: "+91", number: "" },
  ]);

  // Create destination array from numbers
  const destinations = useMemo(
    () =>
      numbers
        .filter((num) => num.number.trim() !== "")
        .map((num) => `${num.countryCode}${num.number}`),
    [numbers],
  );

  // Pass values to parent whenever they change
  useEffect(() => {
    if (onValueChange) {
      onValueChange({
        destination: destinations,
        message,
      });
    }
  }, [destinations, message, onValueChange]);

  const { mutate } = useSmsService();
  const showSnackbar = useSnackbar();
  const queryClient = useQueryClient();

  const handleSend = () => {
    if (destinations.length === 0) return;

    // Send to each destination
    destinations.forEach((destination) => {
      mutate(
        {
          service: "sms",
          destination,
          message,
        },
        {
          onSuccess: (data) => {
            queryClient.invalidateQueries({
              queryKey: logsKeys.all,
            });
            setMessage("");
            setNumbers(numbers.map((num) => ({ ...num, number: "" })));
            showSnackbar(data?.message || "Message sent successfully", "info");
          },
          onError: (error) => {
            showSnackbar(error?.message || "Failed to send message", "error");
          },
        },
      );
    });
  };

  const isDisabled = destinations.length === 0 || (showMessage && !message);

  const addNumber = () => {
    const newId = (
      Math.max(...numbers.map((n) => parseInt(n.id))) + 1
    ).toString();
    setNumbers([...numbers, { id: newId, countryCode: "+91", number: "" }]);
  };

  const removeNumber = (id: string) => {
    if (numbers.length > 1) {
      setNumbers(numbers.filter((num) => num.id !== id));
    }
  };

  const updateNumber = (id: string, field: keyof SMSNumber, value: string) => {
    setNumbers(
      numbers.map((num) => (num.id === id ? { ...num, [field]: value } : num)),
    );
  };

  return (
    <div className="sms-wrapper">
      <label style={{ fontSize: "12px" }}>
        Phone numbers
        <span style={{ color: "red", marginLeft: 2 }}>*</span>
      </label>

      {numbers.map((num, index) => (
        <div key={num.id} className="sms-to-row" style={{ marginBottom: 8 }}>
          <CountryCodeSelect
            value={num.countryCode}
            onChange={(value) => updateNumber(num.id, "countryCode", value)}
          />
          <Input
            id={`sms-number-${num.id}`}
            type="tel"
            className="sms-input"
            placeholder="Enter receiver number"
            value={num.number}
            inputMode="numeric"
            pattern="[0-9]*"
            maxLength={10}
            onChange={(e) => {
              const onlyNums = e.target.value.replace(/\D/g, ""); // remove non-digits
              updateNumber(num.id, "number", onlyNums);
            }}
          />
          {numbers.length > 1 && (
            <button
              onClick={() => removeNumber(num.id)}
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
      <Button
        label="Add Another Number"
        onClick={addNumber}
        className="sms-add-btn"
      />

      {showMessage && (
        <>
          <label style={{ marginBottom: 4, fontSize: "12px", marginTop: 16 }}>
            Message
            <span style={{ color: "red", marginLeft: 2 }}>*</span>
          </label>
          <textarea
            className="sms-textarea"
            placeholder="Type your message..."
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            rows={6}
          />
        </>
      )}

      {/* <div className="sms-footer">
        <Button
          disabled={isDisabled}
          label="Send"
          className={isDisabled ? "button-disabled" : "sms-send-btn"}
          onClick={handleSend}
        />
      </div> */}
    </div>
  );
}
