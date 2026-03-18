import * as React from "react";
import {
  ThemeProvider,
  createTheme,
  extendTheme,
  getInitColorSchemeScript,
} from "@mui/material/styles";
import { CssBaseline } from "@mui/material";

import type { ThemeOptions } from "@mui/material/styles";
import { inputsCustomizations } from "./customizations/input";
import { dataDisplayCustomizations } from "./customizations/data-display";
import { feedbackCustomizations } from "./customizations/feedback";
import { navigationCustomizations } from "./customizations/navigation";
import { surfacesCustomizations } from "./customizations/surfaces";
import { paginationCustomizations } from "./customizations/pagination";
import { colorSchemes, typography, shadows, shape } from "./theme-primitives";

interface AppThemeProps {
  children: React.ReactNode;
  /**
   * This is for the docs site. You can ignore it or remove it.
   */
  disableCustomTheme?: boolean;
  themeComponents?: ThemeOptions["components"];
}

export default function AppTheme(props: AppThemeProps) {
  const { children, disableCustomTheme, themeComponents } = props;

  const theme = React.useMemo(() => {
    if (disableCustomTheme) return createTheme({});

    return createTheme({
      colorSchemes, // <-- this handles dark/light automatically
      typography,
      shadows,
      shape,
      cssVariables: {
        colorSchemeSelector: "data-mui-color-scheme",
        cssVarPrefix: "template",
      },
      components: {
        ...inputsCustomizations,
        ...dataDisplayCustomizations,
        ...feedbackCustomizations,
        ...navigationCustomizations,
        ...surfacesCustomizations,
        ...themeComponents,
        ...paginationCustomizations,
        MuiAppBar: {
          styleOverrides: {
            root: {
              backgroundImage: "none", // 🔑 remove dark overlay
              backgroundColor: "#0b1c2d",
            },
          },
        },
        MuiStack: {
          styleOverrides: {
            root: {
              height: "100vh",
              overflowY: "scroll",
            },
            MuiTableCell: {
              styleOverrides: {
                root: ({ theme }) => ({
                  color: theme.palette.text.secondary,
                }),
              },
            },
          },
        },
        MuiTableCell: {
          styleOverrides: {
            root: ({ theme }) => ({
              color: theme.vars?.palette.text.secondary,
            }),
          },
        },
      },
    });
  }, [
    disableCustomTheme,
    themeComponents,
    inputsCustomizations,
    dataDisplayCustomizations,
    feedbackCustomizations,
    navigationCustomizations,
    surfacesCustomizations,
  ]);

  if (disableCustomTheme) {
    return <React.Fragment>{children}</React.Fragment>;
  }
  return (
    <>
      {getInitColorSchemeScript({
        defaultMode: "system",
        modeStorageKey: "app-color-mode", // persists even after logout
      })}

      <ThemeProvider
        theme={theme}
        defaultMode="system"
        modeStorageKey="app-color-mode"
        disableTransitionOnChange
      >
        <CssBaseline />
        {children}
      </ThemeProvider>
    </>
  );
}
