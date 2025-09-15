// theme.ts
import { createTheme } from "@mui/material/styles";

const lightTheme = createTheme({
  palette: {
    mode: "light", // craeate light/dark or custom
    primary: { main: "#1976d2" },   // fallback solid color
    secondary: { main: "#9c27b0" },
    warning: { main: "#ff9800" },
    error: { main: "#f44336" },
    info: { main: "#2196f3" },
    success: { main: "#4caf50" },
    background: {
      default: "#f5f5f5", // app background
      paper: "#ffffff",   // cards, dialogs
    },
  },
  customGradients: {
    primary: "linear-gradient(90deg, #1976d2 0%, #42a5f5 100%)",
    secondary: "linear-gradient(90deg, #9c27b0 0%, #ce93d8 100%)",
    default: "linear-gradient(90deg, #e0e0e0 0%, #ffffff 100%)",
    warning: "linear-gradient(90deg, #ffb74d 0%, #ff9800 100%)",
    danger: "linear-gradient(90deg, #e57373 0%, #f44336 100%)",
    info: "linear-gradient(90deg, #64b5f6 0%, #2196f3 100%)",
    success: "linear-gradient(90deg, #81c784 0%, #4caf50 100%)",
  },
  shape: {
    borderRadius: 12, // controls rounded corners globally
  },
  typography: {
    fontFamily: "Inter, Roboto, Arial, sans-serif", // match your existing font
    h1: { fontWeight: 700 },
    h2: { fontWeight: 600 },
    body1: { fontSize: "0.85rem" },
  },
  components: {
    MuiCssBaseline: {
      styleOverrides: {
        body: {
          fontSize: "0.85rem", // ensures all content defaults to 12pt equivalent
        },
      },
    },
    MuiButton: {
      styleOverrides: {
        root: {
          textTransform: "none", // keep buttons natural case
          borderRadius: 6,      // match your design system
        },
      },
    },
    MuiPaper: {
      styleOverrides: {
        root: {
          borderRadius: 8,
        },
      },
    },
  },
});


const darkTheme = createTheme({
  palette: {
    mode: "dark",
    primary: { main: "#90caf9" },
    secondary: { main: "#ce93d8" },
    background: { default: "#121212", paper: "#1d1d1d" },
    warning: { main: "#ffb74d" },
    error: { main: "#ef5350" },
    info: { main: "#64b5f6" },
    success: { main: "#81c784" },
  },
  customGradients: {
    primary: "linear-gradient(90deg, #90caf9 0%, #42a5f5 100%)",
    secondary: "linear-gradient(90deg, #ce93d8 0%, #9c27b0 100%)",
    default: "linear-gradient(90deg, #1d1d1d 0%, #121212 100%)",
    warning: "linear-gradient(90deg, #ffb74d 0%, #ff9800 100%)",
    danger: "linear-gradient(90deg, #ef5350 0%, #f44336 100%)",
    info: "linear-gradient(90deg, #64b5f6 0%, #2196f3 100%)",
    success: "linear-gradient(90deg, #81c784 0%, #4caf50 100%)",
  }
});

export { lightTheme, darkTheme };
