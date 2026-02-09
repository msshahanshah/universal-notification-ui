import { Box } from "@mui/material";
import { lazy, Suspense } from "react";
import FallbackLoader from "src/components/fallback-loader/fallback-loader";
// import { WebsocketDemo } from "./websocketDemo";

const LogsTable = lazy(() => import("./logs/table"));

export default function Dashboard() {
  const wValue = "100%";
  const hValue = "100%";

  return (
    <Box sx={{ height: hValue, width: wValue }}>
      <Suspense fallback={<FallbackLoader />}>
        <LogsTable />
        {/* <WebsocketDemo /> */}
      </Suspense>
    </Box>
  );
}
