import React from "react";
import ReactDOM from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import { QueryClientProvider } from "@tanstack/react-query";
import { Provider } from "jotai";
import CssBaseline from "@mui/material/CssBaseline";

import reportWebVitals from "./reportWebVitals";
import { queryClient } from "./lib/queryClient";

import { SnackbarProvider } from "./provider/snackbar";
import AppTheme from "./theme/app-theme";
import App from "./App";

import "./index.css";
const root = ReactDOM.createRoot(
  document.getElementById("root") as HTMLElement,
);
root.render(
  <React.StrictMode>
    <Provider>
      <QueryClientProvider client={queryClient}>
        <BrowserRouter>
          <SnackbarProvider>
            <AppTheme>
              <App />
            </AppTheme>
          </SnackbarProvider>
        </BrowserRouter>
      </QueryClientProvider>
    </Provider>
  </React.StrictMode>,
);

// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
reportWebVitals();
