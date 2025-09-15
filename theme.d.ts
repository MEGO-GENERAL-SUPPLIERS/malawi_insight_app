import { Theme } from "@mui/material/styles";

declare module "@mui/material/styles" {
  interface Theme {
    customGradients: {
      primary: string;
      secondary: string;
      default: string;
      warning: string;
      danger: string;
      info: string;
      success: string;
    };
  }

  // allow configuration via createTheme
  interface ThemeOptions {
    customGradients?: {
      primary?: string;
      secondary?: string;
      default?: string;
      warning?: string;
      danger?: string;
      info?: string;
      success?: string;
    };
  }
}
