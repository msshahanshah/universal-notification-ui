import { Box } from "@mui/material";

const UnderDevelopment = () => {
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
      <div className="under-development">Under Development 👷🚧</div>
    </Box>
  );
};

export default UnderDevelopment;
