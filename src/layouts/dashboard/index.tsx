import { Box } from "@mui/material";

import LogsTable from "./mui/table";

export default function Dashboard() {
  const wValue = "100%";
  const hValue = "100%";

  return (
    <Box sx={{ height: hValue, width: wValue }}>
      <LogsTable />
    </Box>
  );
}
