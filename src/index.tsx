import React from "react";
import ReactDOM from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import { QueryClientProvider } from "@tanstack/react-query";

import App from "./App";
import reportWebVitals from "./reportWebVitals";
import { queryClient } from "./lib/queryClient";
import AppLayout from "./theme/app-layout";
import { SnackbarProvider } from "./provider/snackbar";

import "./index.css";
import PinballGame from "./components/PinballGame";

const root = ReactDOM.createRoot(
  document.getElementById("root") as HTMLElement,
);
root.render(
  <React.StrictMode>
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <SnackbarProvider>
          {/* <AppLayout> */}
            <App />
          {/* </AppLayout> */}
          {/* <main className="min-h-screen flex items-center justify-center bg-black">
            <PinballGame />
          </main> */}
        </SnackbarProvider>
      </BrowserRouter>
    </QueryClientProvider>
  </React.StrictMode>,
);

// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
reportWebVitals();
