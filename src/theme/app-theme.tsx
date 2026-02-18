import * as React from "react";
import {
  ThemeProvider,
  createTheme,
  getInitColorSchemeScript,
} from "@mui/material/styles";
import type { ThemeOptions } from "@mui/material/styles";
import { inputsCustomizations } from "./customizations/input";
import { dataDisplayCustomizations } from "./customizations/data-display";
import { feedbackCustomizations } from "./customizations/feedback";
import { navigationCustomizations } from "./customizations/navigation";
import { surfacesCustomizations } from "./customizations/surfaces";
import {
  colorSchemes,
  typography,
  shadows,
  shape,
  gray,
} from "./theme-primitives";
import { CssBaseline } from "@mui/material";

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

  const [prefersDark, setPrefersDark] = React.useState(
    window.matchMedia("(prefers-color-scheme: dark)").matches,
  );

  React.useEffect(() => {
    const mediaQuery = window.matchMedia("(prefers-color-scheme: dark)");
    const handler = (event: MediaQueryListEvent) =>
      setPrefersDark(event.matches);

    // Listen for changes
    if (mediaQuery.addEventListener) {
      mediaQuery.addEventListener("change", handler);
    } else {
      // For Safari < 14
      mediaQuery.addListener(handler);
    }

    return () => {
      if (mediaQuery.removeEventListener) {
        mediaQuery.removeEventListener("change", handler);
      } else {
        mediaQuery.removeListener(handler);
      }
    };
  }, []);

  const theme = React.useMemo(() => {
    if (disableCustomTheme) return createTheme({}); // fallback

    return createTheme({
      palette: {
        mode: prefersDark ? "dark" : "light",
        background: {
          default: prefersDark ? "#0b1c2d" : "#f5f7fa",
          paper: prefersDark ? "rgba(11, 28, 45, 0.75)" : "#ffffff",
        },
        text: {
          primary: prefersDark ? gray[800] : "#000000",
          secondary: prefersDark ? "#fff" : "hsl(220, 15%, 30%)",
        },
      },
      cssVariables: {
        colorSchemeSelector: "data-mui-color-scheme",
        cssVarPrefix: "template",
      },
      colorSchemes,
      typography,
      shadows,
      shape,
      components: {
        ...inputsCustomizations,
        ...dataDisplayCustomizations,
        ...feedbackCustomizations,
        ...navigationCustomizations,
        ...surfacesCustomizations,
        ...themeComponents,
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
          },
        },
        MuiTableCell: {
          styleOverrides: {
            root: ({ theme }) => ({
              color: theme.palette.text.secondary,
            }),
          },
        },
      },
    });
  }, [prefersDark, disableCustomTheme, themeComponents]);

  if (disableCustomTheme) return <>{children}</>;

  return (
    <>
      {getInitColorSchemeScript({
        defaultMode: "system",
        modeStorageKey: "app-color-mode",
      })}
      <ThemeProvider
        theme={theme}
        modeStorageKey="app-color-mode"
        disableTransitionOnChange
      >
        <CssBaseline />
        {children}
      </ThemeProvider>
    </>
  );
}
