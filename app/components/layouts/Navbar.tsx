import React, { useState } from "react";
import {
  AppBar,
  Toolbar,
  IconButton,
  Box,
  Avatar,
  Menu as MuiMenu,
  MenuItem,
  Tooltip,
  useMediaQuery,
  useTheme
} from "@mui/material";
import { Menu as MenuIcon, Zap, Settings as SettingsIcon, LogOut, User2Icon } from "lucide-react";
import { useQuickAccess } from "~/context/QuickAccessContext";
import { Link, Navigate, replace, useNavigate } from "react-router-dom";
import { localStorageUtils } from "~/utils/localStorageUtils";

interface NavbarProps {
  mobileOpen: boolean; // now passed in
  setMobileOpen: (open: boolean) => void;
  navbarAutoHide: boolean;
}

const Navbar: React.FC<NavbarProps> = ({ mobileOpen, setMobileOpen }) => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("md"));
  
  
  const { sidebarMinimised, drawerOpen, setDrawerOpen } = useQuickAccess();
  const [anchorElUser, setAnchorElUser] = useState<null | HTMLElement>(null);
  
  const handleOpenUserMenu = (event: React.MouseEvent<HTMLElement>) => setAnchorElUser(event.currentTarget);
  const handleCloseUserMenu = () => setAnchorElUser(null);
  
  // Logout logic
  const navigate = useNavigate();
  const handleLogout = () => {
    localStorageUtils.ensureLocalAppStructure();
    localStorageUtils.addOrUpdateLocalStorageObject({
      user: {
        id: "",
        person_id: "",
        roles: [],
        logged_in: false
      },
      api: {
        token: ""
      }
    });

    navigate("/auth", { replace: true });
  };

  return (
    <AppBar
      position="fixed"
      color="default"
      elevation={1}
      sx={{
        backdropFilter: "blur(4px)",
        backgroundColor: "rgba(255,255,255,0.9)",
        borderBottom: "1px solid rgba(0,0,0,0.1)",
        borderRadius: 0,
        left: isMobile ? 0 : sidebarMinimised ? 64 : 256,
        width: isMobile ? "100%" : `calc(100% - ${sidebarMinimised ? 64 : 256}px)`,
        transition: "left 0.3s, width 0.3s",
        zIndex: 1201,
      }}
    >
      <Toolbar sx={{ display: "flex", justifyContent: "space-between", px: 2 }}>
        {/* Mobile burger menu */}
        {isMobile && (
          <IconButton
            color="inherit"
            onClick={() => setMobileOpen(!mobileOpen)}
            size="large"
          >
            <MenuIcon />
          </IconButton>
        )}

        <Box flex={1} />

        {/* Quick Access & Profile */}
        <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
          <Tooltip title="Quick Access">
            <IconButton
              color={drawerOpen ? "primary" : "inherit"}
              onClick={() => setDrawerOpen(!drawerOpen)}
              size="large"
            >
              <Zap />
            </IconButton>
          </Tooltip>

          <Tooltip title="User Menu">
            <IconButton onClick={handleOpenUserMenu} color="inherit" size="large">
              <Avatar sx={{ bgcolor: "primary.main" }}>U</Avatar>
            </IconButton>
          </Tooltip>
        </Box>

        <MuiMenu
          anchorEl={anchorElUser}
          open={Boolean(anchorElUser)}
          onClose={handleCloseUserMenu}
          anchorOrigin={{ vertical: "bottom", horizontal: "right" }}
          transformOrigin={{ vertical: "top", horizontal: "right" }}
        >
          <MenuItem component={Link} to="/app/profile" onClick={handleCloseUserMenu}>
            <User2Icon fontSize="small" style={{ marginRight: 8 }} /> Profile
          </MenuItem>
          <MenuItem component={Link} to="/app/settings" onClick={handleCloseUserMenu}>
            <SettingsIcon fontSize="small" style={{ marginRight: 8 }} /> Settings
          </MenuItem>
          <MenuItem onClick={() => { handleCloseUserMenu(); handleLogout(); }}>
            <LogOut fontSize="small" style={{ marginRight: 8, color: "red" }} /> Logout
          </MenuItem>
        </MuiMenu>
      </Toolbar>
    </AppBar>
  );
};

export default Navbar;
