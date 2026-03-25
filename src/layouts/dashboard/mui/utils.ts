import { Theme } from "@mui/material";

export const formatDateForTable = (date: string) => {
  const userTimeZone = Intl.DateTimeFormat().resolvedOptions().timeZone;
  const d = new Date(date);

  const parts = new Intl.DateTimeFormat("en-GB", {
    timeZone: userTimeZone,
    day: "numeric",
    month: "short",
    year: "numeric",
  }).formatToParts(d);

  const day = Number(parts.find((p) => p.type === "day")?.value);
  const month = parts.find((p) => p.type === "month")?.value;
  const year = parts.find((p) => p.type === "year")?.value;

  const time = new Intl.DateTimeFormat("en-US", {
    timeZone: userTimeZone,
    hour: "2-digit",
    minute: "2-digit",
    hour12: true,
  }).format(d);

  const ordinal = (n: number) => {
    const s = ["th", "st", "nd", "rd"];
    const v = n % 100;
    return n + (s[(v - 20) % 10] || s[v] || s[0]);
  };

  return `${ordinal(day)} ${month} ${year} ${time}`;
};

export const getStatusStyle = (status: string, theme: Theme) => {
  const statusText =
    status?.split(":")?.length > 1 ? status?.split(":")?.[1]?.trim() : status;

  switch (statusText?.toLowerCase()) {
    case "sent":
      return {
        color: "#04b34f",
        py: 0.5,
        borderRadius: 1,
      };
    case "failed":
      return {
        color: "#BB2124",
        py: 0.5,
        borderRadius: 1,
      };
    case "pending":
      return {
        color: "#FFC107",
        py: 0.5,
        borderRadius: 1,
      };
    case "processing":
      return {
        color: "#17a2b8",
        py: 0.5,
        borderRadius: 1,
      };
    default:
      return {
        color: "#666",
        py: 0.5,
        borderRadius: 1,
      };
  }
};
