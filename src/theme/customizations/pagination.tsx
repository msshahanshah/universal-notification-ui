import { Components, Theme } from "@mui/material";

export const paginationCustomizations: Components<Theme> = {
  MuiTablePagination: {
    styleOverrides: {
      root: ({ theme }) => {
        const textColor = (theme.vars || theme)?.palette.text.secondary; // black in light mode

        return {
          backgroundColor: (theme.vars || theme).palette.background.defaultBg,

          color: textColor,

          '& .MuiTablePagination-selectLabel': {
            color: textColor,
          },

          '& .MuiTablePagination-displayedRows': {
            color: textColor,
          },

          '& .MuiSelect-select': {
            color: textColor,
          },

          '& .MuiSvgIcon-root': {
            color: textColor,
          },

          '& .MuiTablePagination-actions': {
            color: textColor,
          },
        };
      },
    },
  },

  MuiIconButton: {
    styleOverrides: {
      root: ({ theme }) => {
        const isDark = theme.palette.mode === 'dark';

        return {
          borderRadius: 10,
          color: (theme.vars || theme)?.palette.text.secondary,

          '&.Mui-disabled': {
            color: isDark ? 'rgba(255,255,255,0.3)' : 'rgba(0,0,0,0.3)',
          },

          '&:hover': {
            backgroundColor: isDark
              ? 'rgba(255,255,255,0.08)'
              : 'rgba(0,0,0,0.06)',
          },
        };
      },
    },
  },
};
