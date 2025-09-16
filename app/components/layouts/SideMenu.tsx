import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
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

  const menuItems = [
    { label: "Dashboard", icon: LayoutDashboard, link: "/app/dashboard" },
    { label: "Templates", icon: FolderOpenIcon, link: "/app/templates" },
    { label: "Reports", icon: ChartPieIcon, link: "/app/reports" },
    { label: "Settings", icon: SettingsIcon, link: "/app/settings" },
    { label: "My Profile", icon: UserCircle2Icon, link: "/app/profile" },
  ];

  const effectiveMinimised = isMobile ? false : sidebarMinimised;
  const drawerWidth = effectiveMinimised ? 64 : 256;

  const handleBottomMenuToggle = (event: React.MouseEvent<HTMLElement>) => {
    setBottomMenuAnchor(bottomMenuAnchor ? null : event.currentTarget);
  };

  useEffect(() => {
    if (!sidebarMinimised) setBottomMenuAnchor(null);
  }, [sidebarMinimised]);

  // Close mobile drawer when resizing to desktop
  useEffect(() => {
    if (!isMobile) setMobileOpen(false);
  }, [isMobile, setMobileOpen]);

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
      {/* Logo */}
      <Box display="flex" alignItems="center" p={2} borderBottom="1px solid rgba(148,163,184,0.3)">
        <img src="/public/img/rtc-logo.png" className="w-12 mr-3" />
        {!effectiveMinimised && <Box className="font-bold text-lg ml-3">Malawi Insight</Box>}
      </Box>

      {/* Menu Items */}
      <List sx={{ flex: 1, overflowY: "auto" }}>
        {menuItems.map((item) => {
          const Icon = item.icon;
          return (
            <Tooltip key={item.label} title={effectiveMinimised ? item.label : ""} placement="right">
              <ListItemButton
                component={Link}
                to={item.link}
                onClick={() => setBottomMenuAnchor(null)}
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
      <Box display="flex" justifyContent="space-around" alignItems="center" p={2} borderTop="1px solid rgba(148,163,184,0.3)">
        {effectiveMinimised && (
          <IconButton sx={{ color: "white" }} onClick={handleBottomMenuToggle} size="large">
            <Menu />
          </IconButton>
        )}
        {!effectiveMinimised && !isMobile && (
          <>
            <IconButton sx={{ color: "white" }} onClick={() => setSidebarMinimised(!sidebarMinimised)} size="large">
              <Minimize2Icon />
            </IconButton>
            <IconButton sx={{ color: "white" }} size="large">
              <RefreshCcwDotIcon />
            </IconButton>
            <IconButton sx={{ color: "white" }} size="large">
              <RotateCw />
            </IconButton>
          </>
        )}

        {/* Collapsed Bottom Menu Popper */}
        <Popper
          open={Boolean(bottomMenuAnchor)}
          anchorEl={bottomMenuAnchor}
          placement="right-start"
          disablePortal={false}
          style={{ zIndex: 1300 }}
        >
          <ClickAwayListener onClickAway={() => setBottomMenuAnchor(null)}>
            <Paper sx={{ bgcolor: "#1e293b", color: "white", border: "1px solid rgba(148,163,184,0.3)", boxShadow: 3, display: "flex", flexDirection: "column", p: 1, borderRadius: 0 }}>
              <IconButton sx={{ color: "white" }} onClick={() => setSidebarMinimised(!sidebarMinimised)} size="large">
                <Maximize2Icon />
              </IconButton>
              <IconButton sx={{ color: "white" }} size="large">
                <RefreshCcwDotIcon />
              </IconButton>
              <IconButton sx={{ color: "white" }} size="large">
                <RotateCw />
              </IconButton>
            </Paper>
          </ClickAwayListener>
        </Popper>
      </Box>
    </Drawer>
  );
};

export default SideMenu;
