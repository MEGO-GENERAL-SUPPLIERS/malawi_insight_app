import React, { useState, useEffect } from "react";
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
import { Menu as MenuIcon, Zap, Settings as SettingsIcon, LogOut, User2Icon, ArrowLeft } from "lucide-react";
import { useQuickAccess } from "~/context/QuickAccessContext";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "~/hooks/useAuth";

interface NavbarProps {
  mobileOpen: boolean;
  setMobileOpen: (open: boolean) => void;
  navbarAutoHide: boolean;
  disableBackRoutes?: string[]; // Routes where back button should be disabled
}

const Navbar: React.FC<NavbarProps> = ({ 
  mobileOpen, 
  setMobileOpen,
  disableBackRoutes = ["/app", "/app/dashboard", "/app/programs", "/app/strategic_info", "/app/settings", "/app/profile"] // Default routes where back is disabled
}) => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("md"));
  const { logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  
  const { sidebarMinimised, drawerOpen, setDrawerOpen } = useQuickAccess();
  const [anchorElUser, setAnchorElUser] = useState<null | HTMLElement>(null);
  const [isBackDisabled, setIsBackDisabled] = useState(false);
  
  const handleOpenUserMenu = (event: React.MouseEvent<HTMLElement>) => setAnchorElUser(event.currentTarget);
  const handleCloseUserMenu = () => setAnchorElUser(null);

  // Check if current route should disable back button
  useEffect(() => {
    const currentPath = location.pathname;
    const shouldDisable = disableBackRoutes.some(route => 
      currentPath === route || currentPath === route + "/"
    );
    setIsBackDisabled(shouldDisable);
  }, [location.pathname, disableBackRoutes]);

  const handleBack = () => {
    if (!isBackDisabled) {
      navigate(-1);
    }
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
        left: isMobile ? 0 : sidebarMinimised ? 64 : 242,
        width: isMobile ? "100%" : `calc(100% - ${sidebarMinimised ? 64 : 242}px)`,
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
        
        {/* Back button */}
        {/* {!isMobile && ( */}
          <Tooltip title={isBackDisabled ? "Cannot go back" : "Go back"}>
            <span>
              <IconButton
                color="inherit"
                onClick={handleBack}
                disabled={isBackDisabled}
                size="large"
                sx={{
                  opacity: isBackDisabled ? 0.3 : 1,
                  cursor: isBackDisabled ? "not-allowed" : "pointer",
                  "&:hover": {
                    backgroundColor: isBackDisabled ? "transparent" : "rgba(0,0,0,0.04)"
                  }
                }}
              >
                <ArrowLeft />
              </IconButton>
            </span>
          </Tooltip>
        {/* )} */}
        
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
          <MenuItem onClick={() => { handleCloseUserMenu(); logout(); }}>
            <LogOut fontSize="small" style={{ marginRight: 8, color: "red" }} /> Logout
          </MenuItem>
        </MuiMenu>
      </Toolbar>
    </AppBar>
  );
};

export default Navbar;