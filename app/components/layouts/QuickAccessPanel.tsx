// components/layouts/QuickAccessPanel.tsx
import React from "react";
import { Drawer, Box, Typography, IconButton, Switch, FormControlLabel } from "@mui/material";
import { X } from "lucide-react";
import { useQuickAccess } from "./QuickAccessContext";

const QuickAccessPanel: React.FC = () => {
  const {
    drawerOpen,
    setDrawerOpen,
    sidebarMinimised,
    setSidebarMinimised,
    navbarAutoHide,
    setNavbarAutoHide,
    footerVisible,
    setFooterVisible,
  } = useQuickAccess();

  return (
    <Drawer
      anchor="right"
      open={drawerOpen}
      onClose={() => setDrawerOpen(false)}
      PaperProps={{
        sx: { width: 280, mt: 8, borderRadius: "0.2rem", p: 2, backgroundColor: "#f9fafb", borderLeft: "1px solid rgba(0,0,0,0.1)" },
      }}
    >
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
        <Typography variant="h6">Quick Access</Typography>
        <IconButton onClick={() => setDrawerOpen(false)} size="large">
          <X />
        </IconButton>
      </Box>

      <Box display="flex" flexDirection="column" gap={2}>
        <FormControlLabel
          control={
            <Switch
              checked={!sidebarMinimised}
              onChange={(e) => setSidebarMinimised(!e.target.checked)}
              color="primary"
            />
          }
          label="Sidebar Expanded"
        />
        {/* <FormControlLabel
          control={
            <Switch
              checked={navbarAutoHide}
              onChange={(e) => setNavbarAutoHide(e.target.checked)}
              color="primary"
            />
          }
          label="Navbar Auto Hide"
        /> */}
        <FormControlLabel
          control={
            <Switch
              checked={footerVisible}
              onChange={(e) => setFooterVisible(e.target.checked)}
              color="primary"
            />
          }
          label="Footer Visible"
        />
      </Box>
    </Drawer>
  );
};

export default QuickAccessPanel;
