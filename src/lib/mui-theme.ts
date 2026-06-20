import { createTheme } from "@mui/material/styles";

export const theme = createTheme({
  palette: {
    primary: {
      main: "#334035",
      light: "#7DAF9C",
      contrastText: "#ffffff",
    },
    secondary: {
      main: "#7DAF9C",
      contrastText: "#ffffff",
    },
    error: {
      main: "#F2542D",
    },
    warning: {
      main: "#FFD166",
    },
    background: {
      default: "#F4F4F9",
      paper: "#ffffff",
    },
  },
  typography: {
    fontFamily: "var(--font-ubuntu), sans-serif",
    h1: { fontWeight: 700 },
    h2: { fontWeight: 700 },
    h3: { fontWeight: 600 },
    h4: { fontWeight: 600 },
    button: { textTransform: "none", fontWeight: 600 },
  },
  shape: {
    borderRadius: 10,
  },
  components: {
    MuiButton: {
      styleOverrides: {
        root: {
          borderRadius: 10,
          minHeight: 44,
          boxShadow: "none",
          "&:hover": { boxShadow: "none" },
        },
        sizeLarge: { minHeight: 52 },
      },
    },
    MuiTextField: {
      defaultProps: { size: "medium", fullWidth: true },
      styleOverrides: {
        root: { "& .MuiOutlinedInput-root": { borderRadius: 10 } },
      },
    },
    MuiSelect: {
      styleOverrides: {
        root: { borderRadius: 10 },
      },
    },
    MuiCard: {
      styleOverrides: {
        root: { borderRadius: 16, boxShadow: "0 1px 3px rgba(0,0,0,0.08)" },
      },
    },
    MuiBottomNavigation: {
      styleOverrides: {
        root: { height: 64, borderTop: "1px solid #e0e0e0" },
      },
    },
    MuiBottomNavigationAction: {
      styleOverrides: {
        root: {
          minWidth: 48,
          "& .MuiBottomNavigationAction-label": {
            fontSize: "0.65rem",
            marginTop: 2,
          },
          "&.Mui-selected": { color: "#334035" },
        },
      },
    },
  },
});
