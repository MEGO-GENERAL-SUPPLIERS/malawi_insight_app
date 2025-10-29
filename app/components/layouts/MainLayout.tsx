import React, { useState, useEffect } from "react";
import { Outlet, useNavigation } from "react-router-dom";
import Navbar from "~/components/layouts/Navbar";
import SideMenu from "~/components/layouts/SideMenu";
import Footer from "~/components/layouts/Footer";
import { QuickAccessProvider } from "~/context/QuickAccessContext";
import { localStorageUtils } from "~/utils/localStorageUtils";
import { type IAppStorage } from "~/types/interfaces/ILocalStorageInterfaces";
import { useTheme, useMediaQuery } from "@mui/material";
import QuickAccessPanel from "./QuickAccessPanel";
import PageLoader from "~/components/layouts/PageLoader";

const SIDEBAR_WIDTH = 240; // default sidebar width in px
const SIDEBAR_MINI_WIDTH = 72; // width when minimized

const MainLayout: React.FC = () => {
  const savedAppState: IAppStorage["app"] =
    localStorageUtils.ensureLocalAppStructure()?.app || {
      ui: { sidebar_show: "false", navbar_autohide: "false", footer_show: "true" },
    };

  const [navbarAutoHide, _setNavbarAutoHide] = useState(savedAppState.ui.navbar_autohide === "true");
  const [footerVisible, _setFooterVisible] = useState(savedAppState.ui.footer_show === "true");
  const [mobileOpen, setMobileOpen] = useState(false);
  const [sidebarWidth, setSidebarWidth] = useState(SIDEBAR_WIDTH);

  const navigation = useNavigation();
  const isLoading = navigation.state === "loading";

  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("md"));

  // Persist UI settings for desktop
  useEffect(() => {
    if (!isMobile) {
      localStorageUtils.addOrUpdateLocalStorageObject({
        app: {
          ui: {
            navbar_autohide: navbarAutoHide ? "true" : "false",
            footer_show: footerVisible ? "true" : "false",
          },
        },
      });
    }
  }, [navbarAutoHide, footerVisible, isMobile]);

  return (
    <QuickAccessProvider>
      <div className="h-screen w-screen overflow-hidden relative">
        {/* 🌈 Gradient Background */}
        <div className="fixed inset-0 -z-10">
          <div className="absolute inset-0 bg-gradient-to-r from-blue-50/30 via-green-50/40 to-red-50/30"></div>
          <div className="absolute inset-0 backdrop-blur-[1px]"></div>
        </div>

        {/* 🧭 Fixed SideMenu */}
        <div
          className="fixed top-0 left-0 h-full z-30 shadow-md"
          style={{
            width: isMobile ? 0 : `${sidebarWidth}px`,
            transition: "width 0.3s ease",
            overflow: "hidden",
          }}
        >
          <SideMenu
            mobileOpen={mobileOpen}
            setMobileOpen={setMobileOpen}
            _defaultMinimised={true}
            isMobile={isMobile}
            onWidthChange={(w: number) => setSidebarWidth(w || SIDEBAR_WIDTH)}
          />
        </div>

        {/* 🧭 Navbar (fixed at top) */}
        <Navbar
          mobileOpen={mobileOpen}
          setMobileOpen={setMobileOpen}
          navbarAutoHide={navbarAutoHide}
        />

        {/* ⚡ Page loader */}
        <PageLoader loading={isLoading} text="Loading..." />

        {/* 📜 Main Content Area */}
        <div
          className="flex flex-col h-full pt-16 overflow-hidden transition-all duration-300"
          style={{
            marginLeft: isMobile ? 0 : `${sidebarWidth}px`,
          }}
        >
          <main className="flex-1 overflow-y-auto overflow-x-auto p-3">
            <div className="w-full px-1.5 min-w-[700px]"> {/* optional min width */}
              <Outlet />
            </div>
          </main>

          {footerVisible && <Footer />}
        </div>

        {/* 🚀 Quick Access Panel */}
        <QuickAccessPanel />
      </div>
    </QuickAccessProvider>
  );
};

export default MainLayout;
