import React from "react";
import { Box } from "@mui/material";

export const ResponsiveRow: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <Box
    sx={{
      display: "flex",
      flexDirection: { xs: "column", sm: "row" },
      gap: { xs: 2, sm: 4 },
      mb: { xs: 2, sm: 3 },
    }}
  >
    {children}
  </Box>
);

export const ResponsiveField: React.FC<{ children: React.ReactNode; flex?: number }> = ({ children, flex = 1 }) => (
  <Box sx={{ flex: { xs: "1 1 100%", sm: `${flex} 1 0%` } }}>{children}</Box>
);