// QuickAccessContext.tsx
import { createContext, useContext, useState, useEffect } from "react";
import { localStorageUtils } from "~/utils/localStorageUtils";

interface IQuickAccessContext {
  sidebarMinimised: boolean;
  setSidebarMinimised: (val: boolean) => void;
  drawerOpen: boolean;
  setDrawerOpen: (val: boolean) => void;
  userDropdown: boolean;
  setUserDropdown: (val: boolean) => void;

  navbarAutoHide: boolean;
  setNavbarAutoHide: (val: boolean) => void;
  footerVisible: boolean;
  setFooterVisible: (val: boolean) => void;
}

const QuickAccessContext = createContext<IQuickAccessContext | undefined>(undefined);

export const QuickAccessProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const appUi = localStorageUtils.ensureLocalAppStructure().app.ui;

  const [sidebarMinimised, setSidebarMinimisedState] = useState(appUi.sidebar_show === "minimised");
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [userDropdown, setUserDropdown] = useState(false);
  const [navbarAutoHide, setNavbarAutoHideState] = useState(appUi.navbar_autohide === "true");
  const [footerVisible, setFooterVisibleState] = useState(appUi.footer_show === "true");

  // Persist changes
  useEffect(() => {
    localStorageUtils.addOrUpdateLocalStorageObject({
      app: {
        ui: {
          sidebar_show: sidebarMinimised ? "minimised" : "expanded",
          navbar_autohide: navbarAutoHide ? "true" : "false",
          footer_show: footerVisible ? "true" : "false",
        },
      },
    });
  }, [sidebarMinimised, navbarAutoHide, footerVisible]);

  const setSidebarMinimised = (val: boolean) => setSidebarMinimisedState(val);
  const setNavbarAutoHide = (val: boolean) => setNavbarAutoHideState(val);
  const setFooterVisible = (val: boolean) => setFooterVisibleState(val);

  return (
    <QuickAccessContext.Provider
      value={{
        sidebarMinimised,
        setSidebarMinimised,
        drawerOpen,
        setDrawerOpen,
        userDropdown,
        setUserDropdown,
        navbarAutoHide,
        setNavbarAutoHide,
        footerVisible,
        setFooterVisible,
      }}
    >
      {children}
    </QuickAccessContext.Provider>
  );
};

export const useQuickAccess = () => {
  const context = useContext(QuickAccessContext);
  if (!context) throw new Error("useQuickAccess must be used within QuickAccessProvider");
  return context;
};
