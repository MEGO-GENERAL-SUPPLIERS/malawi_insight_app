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
  Typography,
  Menu as MuiMenu, MenuItem
} from "@mui/material";
import {
  LayoutDashboard,
  Settings as SettingsIcon,
  RotateCw,
  UserCircle2Icon,
  FolderSyncIcon,
  Boxes,
  SquareLibrary,
  Menu,
  Minimize2Icon,
  Globe,
  ChartArea,
  Maximize2Icon
} from "lucide-react";
import { useQuickAccess } from "~/context/QuickAccessContext";
import { localStorageUtils } from "~/utils/localStorageUtils";
import { privilegesUtils } from '../../utils/privilegesUtils';
import { handleAppRefresh } from '~/utils/appUtils';
import { HelpOutlineRounded } from "@mui/icons-material";

interface SideMenuProps {
  mobileOpen: boolean;
  setMobileOpen: (open: boolean) => void;
  _defaultMinimised?: boolean;
  isMobile?: boolean;
  onWidthChange?: (width: number) => void; // <-- added
}

const SideMenu: React.FC<SideMenuProps> = ({
  mobileOpen,
  setMobileOpen,
  _defaultMinimised = false,
  isMobile = false,
  onWidthChange,
}) => {
  const { sidebarMinimised, setSidebarMinimised } = useQuickAccess();
  const [bottomMenuAnchor, setBottomMenuAnchor] = useState<null | HTMLElement>(null);
  const location = useLocation();

  const menuItems = [
    { label: "Dashboard", icon: LayoutDashboard, route: "/app/dashboard", privileges: [] },
    { label: "Programs", icon: Boxes, route: "/app/programs", privileges: ['can_access_main_modules'] },
    { label: "General Modules", icon: Globe, route: "/app/generic", privileges: ['can_access_general_modules'] },
    { label: "SI Unit", icon: SquareLibrary, route: "/app/strategic_info", privileges: ['can_access_si_unit'] },
    { label: "Settings", icon: SettingsIcon, route: "/app/settings", privileges: ['can_access_settings'] },
    { label: "Reports", icon: ChartArea, route: "/app/reports", privileges: ['can_access_reports'] },
    { label: "My Profile", icon: UserCircle2Icon, route: "/app/profile", privileges: [] },
    { label: "Help", icon: HelpOutlineRounded, route: "/app/help", privileges: [] }
  ];
  
  // Get user privileges if not provided
  const privileges = privilegesUtils.getUserPrivileges();
  const accessibleMenuItems = privilegesUtils.filterByPrivileges(menuItems, privileges);

  const effectiveMinimised = isMobile ? false : sidebarMinimised;
  const drawerWidth = effectiveMinimised ? 64 : 242;

  // Notify parent about width changes
  useEffect(() => {
    if (onWidthChange) onWidthChange(drawerWidth);
  }, [drawerWidth, onWidthChange]);

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
          position: "sticky", // <-- keeps sidebar static on horizontal scroll
          top: 0,
          height: "100vh",
        },
      }}
    >
      {/* Logo + App Name */}
      <Box display="flex" alignItems="center" p={1} borderBottom="1px solid rgba(148,163,184,0.3)">
        <div className="border p-3 rounded-5 bg-white/50 dark:bg-white/90 mr-2">
          <img src="/public/img/rtc-logo.png" className="w-12" />
        </div>
        {!effectiveMinimised && <Box className="font-bold text-lg ml-2">MIDS</Box>}
      </Box>

      {/* User Info */}
      {!effectiveMinimised ? (
        <Box display="flex" flexDirection="column" alignItems="center" py={2} borderBottom="1px solid rgba(148,163,184,0.3)">
          <Typography variant="subtitle1" fontWeight="bold" textAlign="center">
            {user?.full_name || "Guest"}
          </Typography>
          <Typography variant="caption" textAlign="center" display="block">
            {roleDisplay}
          </Typography>
        </Box>
      ) : (
        <Box display="flex" justifyContent="center" alignItems="center" py={2} borderBottom="1px solid rgba(148,163,184,0.3)">
          <Box
            sx={{
              width: 40,
              height: 40,
              borderRadius: "0.4rem",
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
                <span>{user.first_name[0]}</span>
                <span>{user.last_name[0]}</span>
              </>
            ) : (
              <span>G</span>
            )}
          </Box>
        </Box>
      )}

      {/* Menu Items */}
      <List sx={{ flex: 1, overflowY: "auto" }}>
        {accessibleMenuItems.map((item) => {
          const Icon = item.icon;
          return (
            <Tooltip key={item.label} title={effectiveMinimised ? item.label : ""} placement="right">
              <ListItemButton
                component={Link}
                to={item.route}
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
      <Box display="flex" justifyContent="space-around" alignItems="center" p={2} borderTop="1px solid rgba(148,163,184,0.3)">
        {effectiveMinimised && !isMobile && (
          <>
            <IconButton sx={{ color: "white" }} onClick={handleBottomMenuToggle} size="large">
              <Menu />
            </IconButton>

            {/* Popup menu for collapsed sidebar */}
            <MuiMenu
              anchorEl={bottomMenuAnchor}
              open={Boolean(bottomMenuAnchor)}
              onClose={() => setBottomMenuAnchor(null)}
              anchorOrigin={{
                vertical: "top",
                horizontal: "right",
              }}
              transformOrigin={{
                vertical: "bottom",
                horizontal: "right",
              }}
              PaperProps={{
                sx: {
                  backgroundColor: "#0f172a",
                  color: "white",
                  minWidth: 180,
                  zIndex: 1300,
                },
              }}
            >
              {/* Minimize button */}
              <MenuItem
                onClick={() => {
                  setSidebarMinimised(!sidebarMinimised);
                  setBottomMenuAnchor(null);
                }}
              >
                <Maximize2Icon style={{ marginRight: 8 }} /> Minimize
              </MenuItem>

              {/* Folder Sync button */}
              <MenuItem
                onClick={() => {
                  handleMenuClick();
                  setBottomMenuAnchor(null);
                }}
              >
                <FolderSyncIcon style={{ marginRight: 8 }} /> Sync
              </MenuItem>

              {/* Rotate button */}
              <MenuItem
                onClick={() => {
                  handleMenuClick();
                  setBottomMenuAnchor(null);
                  handleAppRefresh();
                }}
              >
                <RotateCw style={{ marginRight: 8 }} /> Refresh
              </MenuItem>
            </MuiMenu>
          </>
        )}
        {(!effectiveMinimised || isMobile) && (
          <>
            {!isMobile && (
              <IconButton sx={{ color: "white" }} onClick={() => setSidebarMinimised(!sidebarMinimised)} size="large">
                <Minimize2Icon />
              </IconButton>
            )}
            <IconButton sx={{ color: "white" }} onClick={() => { handleMenuClick(); setBottomMenuAnchor(null); }} size="large">
              <FolderSyncIcon />
            </IconButton>
            <IconButton sx={{ color: "white" }} onClick={() => { handleMenuClick(); setBottomMenuAnchor(null); handleAppRefresh();}} size="large">
              <RotateCw />
            </IconButton>
          </>
        )}
      </Box>
    </Drawer>
  );
};

export default SideMenu;
