import React, { useState, useEffect } from "react";
import { Link, useLocation } from "react-router-dom";
import {
  Drawer,
  List,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  IconButton,
  Box,
  Tooltip,
  Popper,
  Paper,
  ClickAwayListener,
  Typography
} from "@mui/material";
import {
  LayoutDashboard,
  Settings as SettingsIcon,
  RefreshCcwDotIcon,
  RotateCw,
  UserCircle2Icon,
  FolderOpenIcon,
  ChartPieIcon,
  Menu,
  Maximize2Icon,
  Minimize2Icon,
} from "lucide-react";
import { useQuickAccess } from "~/context/QuickAccessContext";
import { localStorageUtils } from "~/utils/localStorageUtils";

interface SideMenuProps {
  mobileOpen: boolean;
  setMobileOpen: (open: boolean) => void;
  defaultMinimised?: boolean;
  isMobile?: boolean;
}

const SideMenu: React.FC<SideMenuProps> = ({
  mobileOpen,
  setMobileOpen,
  defaultMinimised = false,
  isMobile = false,
}) => {
  const { sidebarMinimised, setSidebarMinimised } = useQuickAccess();
  const [bottomMenuAnchor, setBottomMenuAnchor] = useState<null | HTMLElement>(null);
  const location = useLocation();

  const menuItems = [
    { label: "Dashboard", icon: LayoutDashboard, link: "/app/dashboard" },
    { label: "Templates", icon: FolderOpenIcon, link: "/app/templates" },
    { label: "Reports", icon: ChartPieIcon, link: "/app/reports" },
    { label: "Settings", icon: SettingsIcon, link: "/app/settings" },
    { label: "My Profile", icon: UserCircle2Icon, link: "/app/profile" },
  ];

  const effectiveMinimised = isMobile ? false : sidebarMinimised;
  const drawerWidth = effectiveMinimised ? 64 : 242;

  // Get user from localStorage
  const storage = localStorageUtils.ensureLocalAppStructure();
  const user = storage.user;

  const handleBottomMenuToggle = (event: React.MouseEvent<HTMLElement>) => {
    setBottomMenuAnchor(bottomMenuAnchor ? null : event.currentTarget);
  };

  // Close mobile drawer when resizing to desktop
  useEffect(() => {
    if (!isMobile) setMobileOpen(false);
  }, [isMobile, setMobileOpen]);

  // Close drawer when navigating to another page in mobile
  useEffect(() => {
    if (isMobile) setMobileOpen(false);
  }, [location.pathname]);

  const handleMenuClick = () => {
    if (isMobile) setMobileOpen(false);
    setBottomMenuAnchor(null);
  };

  // Compute role display
  const roleDisplay =
    user?.roles && user.roles.length === 1
      ? `[${user.roles[0]}]`
      : user?.roles && user.roles.length > 1
      ? "[Multi-roled]"
      : "";

  return (
    <Drawer
      variant={isMobile ? "temporary" : "permanent"}
      open={isMobile ? mobileOpen : true}
      onClose={() => setMobileOpen(false)}
      ModalProps={{ keepMounted: true }}
      sx={{
        width: drawerWidth,
        flexShrink: 0,
        "& .MuiDrawer-paper": {
          width: drawerWidth,
          boxSizing: "border-box",
          background: "linear-gradient(to bottom, #047857, #059669, #06b6d4)",
          color: "white",
          borderRight: "1px solid rgba(148,163,184,0.3)",
          boxShadow: 3,
          backdropFilter: "blur(4px)",
          transition: "width 0.3s",
          borderRadius: 0,
          overflowX: "hidden",
          position: "relative",
        },
      }}
    >
        {/* Logo + User Info */}
        <Box display="flex" alignItems="center" p={1} borderBottom="1px solid rgba(148,163,184,0.3)">
          <div className="border p-3 rounded-5 bg-white/50 dark:bg-white/90 mr-2">
            <img src="/public/img/rtc-logo.png" className="w-12" />
          </div>
          {!effectiveMinimised && <Box className="font-bold text-lg ml-2">Malawi Insight</Box>}
        </Box>
      
        {/* User + Title */}
        {!effectiveMinimised ? (
          // Full name + role when expanded
          <Box display="flex" flexDirection="column" alignItems="center" py={2} borderBottom="1px solid rgba(148,163,184,0.3)">
            <Typography variant="subtitle1" fontWeight="bold" textAlign="center">
              {user?.full_name || "Guest"}
            </Typography>
            <Typography variant="caption" textAlign="center" display="block">
              {roleDisplay}
            </Typography>
          </Box>
        ) : (
          // Show initials when minimised
          <Box display="flex" justifyContent="center" alignItems="center" py={2} borderBottom="1px solid rgba(148,163,184,0.3)">
            <Box
              sx={{
                width: 40,
                height: 40,
                borderRadius: "0.4rem", // rounded square
                backgroundColor: "#1e293b",
                display: "flex",
                justifyContent: "center",
                alignItems: "center",
                fontWeight: "bold",
                fontSize: 16,
                color: "white",
              }}
            >
              {user?.first_name?.[0] && user?.last_name?.[0] ? (
                <>
                  <span style={{ color: "white" }}>{user.first_name[0]}</span>
                  <span style={{ color: "white" }}>{user.last_name[0]}</span>
                </>
              ) : (
                <span style={{ color: "white" }}>G</span> // fallback for Guest
              )}
            </Box>
          </Box>
        )}


      {/* Menu Items */}
      <List sx={{ flex: 1, overflowY: "auto" }}>
        {menuItems.map((item) => {
          const Icon = item.icon;
          return (
            <Tooltip key={item.label} title={effectiveMinimised ? item.label : ""} placement="right">
              <ListItemButton
                component={Link}
                to={item.link}
                onClick={handleMenuClick}
                sx={{
                  color: "white",
                  "&:hover": { backgroundColor: "rgba(255,255,255,0.1)" },
                  px: 3,
                }}
              >
                <ListItemIcon sx={{ color: "white", minWidth: 32 }}>
                  <Icon />
                </ListItemIcon>
                {!effectiveMinimised && <ListItemText primary={item.label} />}
              </ListItemButton>
            </Tooltip>
          );
        })}
      </List>

      {/* Bottom Buttons */}
      <Box
        display="flex"
        justifyContent="space-around"
        alignItems="center"
        p={2}
        borderTop="1px solid rgba(148,163,184,0.3)"
      >
        {/* Show burger menu only when sidebar is minimised (desktop) */}
        {effectiveMinimised && !isMobile && (
          <IconButton sx={{ color: "white" }} onClick={handleBottomMenuToggle} size="large">
            <Menu />
          </IconButton>
        )}

        {/* Show standard buttons when sidebar is expanded or in mobile */}
        {(!effectiveMinimised || isMobile) && (
          <>
            {!isMobile && (
              <IconButton sx={{ color: "white" }} onClick={() => setSidebarMinimised(!sidebarMinimised)} size="large">
                <Minimize2Icon />
              </IconButton>
            )}
            <IconButton sx={{ color: "white" }} onClick={() => { handleMenuClick(); setBottomMenuAnchor(null); } } size="large">
              <RefreshCcwDotIcon />
            </IconButton>
            <IconButton sx={{ color: "white" }} onClick={() => { handleMenuClick(); setBottomMenuAnchor(null); } } size="large">
              <RotateCw />
            </IconButton>
          </>
        )}
      </Box>
    </Drawer>
  );
};

export default SideMenu;
