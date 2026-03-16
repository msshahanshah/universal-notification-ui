export const getStatusStyle = (status?: string) => {
  const value = status?.toLowerCase();

  if (value === "sent") {
    return { color: "#04b34f", fontWeight: 500 };
  }
  if (value === "failed") {
    return { color: "#BB2124", fontWeight: 500 };
  }
  if (value === "pending") {
    return { color: "#FFC107", fontWeight: 500 };
  }
  if (value === "processing") {
    return { color: "#17a2b8", fontWeight: 500 };
  }
  return { color: "#666", fontWeight: 500 };
};
