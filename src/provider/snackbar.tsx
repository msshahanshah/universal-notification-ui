import { createContext, useContext, useState } from "react";
import Snackbar from "src/components/snackbar";

type SnackbarType = "success" | "error" | "info" | "warning";

const SnackbarContext = createContext<
  (message: string | Error, type?: SnackbarType, duration?: number) => void
>(() => {});

export const SnackbarProvider = ({
  children,
}: {
  children: React.ReactNode;
}) => {
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: "",
    type: "success" as SnackbarType,
    duration: 3000,
  });

  const showSnackbar = (message: string | Error, type: SnackbarType = "success", duration: number = 3000) => {
    setSnackbar({ open: true, duration, message: message instanceof Error ? message?.message : message, type });
  };

  return (
    <SnackbarContext.Provider value={showSnackbar}>
      {children}
      <Snackbar
        open={snackbar.open}
        message={snackbar.message}
        type={snackbar.type}
        onClose={() => setSnackbar({ ...snackbar, open: false })}
        duration={snackbar.duration}
      />
    </SnackbarContext.Provider>
  );
};

export const useSnackbar = () => useContext(SnackbarContext);
