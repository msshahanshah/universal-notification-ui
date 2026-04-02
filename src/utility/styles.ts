import { CSSProperties } from "react";
import { useTheme } from "@mui/material/styles";

/**
 * Reusable input styles for consistent UI across components
 */
export const getInputStyles = (theme: any): CSSProperties => ({
  backgroundColor: theme.vars?.palette.background.paper,
  color: theme.vars?.palette.text.secondary,
  border: `1px solid ${theme.vars?.palette.divider} !important`,
  width: "100%",
  height: 42,
  marginBottom: 12,
  padding: "0 12px",
  borderRadius: 6,
});

/**
 * Hook to get input styles with current theme
 */
export const useInputStyles = (): CSSProperties => {
  const theme = useTheme();
  return getInputStyles(theme);
};

/**
 * Textarea styles for larger input areas
 */
export const getTextareaStyles = (theme: any): CSSProperties => ({
  backgroundColor: theme.vars?.palette.background.paper,
  color: theme.vars?.palette.text.secondary,
  border: `1px solid ${theme.vars?.palette.divider}`,
  borderRadius: 6,
  fontSize: "12px",
  resize: "vertical",
  padding: "8px",
  width: "100%",
  minHeight: "80px",
  fontFamily: "inherit",
});

/**
 * Hook to get textarea styles with current theme
 */
export const useTextareaStyles = (): CSSProperties => {
  const theme = useTheme();
  return getTextareaStyles(theme);
};
