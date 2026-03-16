import { useColorScheme } from "@mui/material";

export const ModeDebugger = () => {
  const { mode, systemMode } = useColorScheme();

  console.log("mode", mode);
  console.log("systemMode", systemMode);

  return null;
};
