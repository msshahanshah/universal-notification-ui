// // AppTheme.tsx

// import * as React from "react";
// import {
//   ThemeProvider,
//   createTheme,
//   getInitColorSchemeScript,
//   useColorScheme,
// } from "@mui/material/styles";
// import CssBaseline from "@mui/material/CssBaseline";
// import type { ThemeOptions } from "@mui/material/styles";

// import { colorSchemes, typography, shadows, shape } from "./theme-primitives";
// import { inputsCustomizations } from "./customizations/input";
// import { dataDisplayCustomizations } from "./customizations/data-display";
// import { feedbackCustomizations } from "./customizations/feedback";
// import { navigationCustomizations } from "./customizations/navigation";
// import { surfacesCustomizations } from "./customizations/surfaces";

// interface AppThemeProps {
//   children: React.ReactNode;
//   themeComponents?: ThemeOptions["components"];
// }

// export default function AppTheme({ children, themeComponents }: AppThemeProps) {
//   const { mode } = useColorScheme();
//   // const theme = React.useMemo(() => {
//   //   return createTheme({
//   //     cssVariables: {
//   //       colorSchemeSelector: "data-mui-color-scheme",
//   //     },

//   //     colorSchemes,

//   //     typography,
//   //     shadows,
//   //     shape,

//   //     components: {
//   //       ...inputsCustomizations,
//   //       ...dataDisplayCustomizations,
//   //       ...feedbackCustomizations,
//   //       ...navigationCustomizations,
//   //       ...surfacesCustomizations,
//   //       ...themeComponents,
//   //     },
//   //   });
//   // }, [themeComponents]);

//   const prefersDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
//   console.log(prefersDark ? "dark" : "light");

//   console.log("MODE", mode);
//   const theme = React.useMemo(() => {
//     return createTheme({
//       palette: {
//         mode: mode as "light" | "dark",
//         ...(prefersDark == true
//           ? {
//               background: {
//                 default: "#0b1c2d",
//                 paper: "rgba(11, 28, 45, 0.85)", // ← MUST be dark
//               },
//             }
//           : {
//               background: {
//                 default: "#f5f7fa",
//                 paper: "#ffffff",
//               },
//             }),
//       },
//     });
//   }, [mode]);

//   return (
//     <>
//       {getInitColorSchemeScript({
//         defaultMode: "system",
//         modeStorageKey: "app-color-mode", // persists even after logout
//       })}

//       <ThemeProvider
//         theme={theme}
//         // defaultMode="system"
//         modeStorageKey="app-color-mode"
//         disableTransitionOnChange
//       >
//         <CssBaseline />
//         {children}
//       </ThemeProvider>
//     </>
//   );
// }

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
import { colorSchemes, typography, shadows, shape } from "./theme-primitives";
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

  const prefersDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
  console.log(prefersDark ? "dark" : "light");
  const theme = React.useMemo(() => {
    return disableCustomTheme
      ? {}
      : createTheme({
          palette: {
            mode: prefersDark ? "dark" : "light",
            background: {
              default: prefersDark ? "#0b1c2d" : "#f5f7fa", // deep blue (NOT near black)
              paper: prefersDark ? "rgba(11, 28, 45, 0.75)" : "#ffffff",
            },
          },
          // For more details about CSS variables configuration, see https://mui.com/material-ui/customization/css-theme-variables/configuration/
          cssVariables: {
            colorSchemeSelector: "data-mui-color-scheme",
            cssVarPrefix: "template",
          },
          colorSchemes, // Recently added in v6 for building light & dark mode app, see https://mui.com/material-ui/customization/palette/#color-schemes
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
          },
        });
  }, [disableCustomTheme, themeComponents]);

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
        // defaultMode="system"
        modeStorageKey="app-color-mode"
        disableTransitionOnChange
      >
        <CssBaseline />
        {children}
      </ThemeProvider>
    </>
  );
}
