import { Box } from "@mui/material";
import "./fallback-loader.css";

const FallbackLoader = () => {
  const wValue = "100%";
  const hValue = "100%";

  return (
    <Box
      sx={{
        height: hValue,
        width: wValue,
        padding: 2,
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        flexDirection: "column",
      }}
    >
      <div className="fallback-loader">Loading...</div>
    </Box>
  );
};

export default FallbackLoader;
