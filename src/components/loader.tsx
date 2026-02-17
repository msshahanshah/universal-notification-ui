import { CircularProgress } from "@mui/material";

const Loader = ({ size, color }: { size: number; color?: string }) => {
  return (
    <CircularProgress
      size={size}
      style={{ color: color || "hsla(220, 35%, 3%, 0.4)" }}
    />
  );
};

export default Loader;
