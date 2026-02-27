import { Theme } from "@mui/material";

export const formatDateForTable = (date: string) => {
  const userTimeZone = Intl.DateTimeFormat().resolvedOptions().timeZone;

  const d = new Date(date);

  const day = new Intl.DateTimeFormat("en-GB", {
    timeZone: userTimeZone,
    day: "2-digit",
  }).format(d);

  const month = new Intl.DateTimeFormat("en-GB", {
    timeZone: userTimeZone,
    month: "2-digit",
  }).format(d);

  const year = new Intl.DateTimeFormat("en-GB", {
    timeZone: userTimeZone,
    year: "numeric",
  }).format(d);

  const time = new Intl.DateTimeFormat("en-US", {
    timeZone: userTimeZone,
    hour: "2-digit",
    minute: "2-digit",
    hour12: true,
  }).format(d);

  return `${day}/${month}/${year} ${time}`;
};

export const getStatusStyle = (status: string, theme: Theme) => {
  switch (status?.toLowerCase()) {
    case "sent":
      return {
        color: "#04b34f",
        px: 1,
        py: 0.5,
        borderRadius: 1,
      };
    case "failed":
      return {
        color: "#BB2124",
        px: 1,
        py: 0.5,
        borderRadius: 1,
      };
    case "pending":
      return {
        color: "#FFC107",
        px: 1,
        py: 0.5,
        borderRadius: 1,
      };
    case "processing":
      return {
        color: "#17a2b8",
        px: 1,
        py: 0.5,
        borderRadius: 1,
      };
    default:
      return {
        color: "#666",
        px: 1,
        py: 0.5,
        borderRadius: 1,
      };
  }
};
