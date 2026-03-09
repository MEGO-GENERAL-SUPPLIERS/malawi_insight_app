import React, { useState, useEffect, Suspense } from "react";
import { Outlet, useNavigation } from "react-router-dom";
import Navbar from "~/components/layouts/Navbar";
import SideMenu from "~/components/layouts/SideMenu";
import Footer from "~/components/layouts/Footer";
import { QuickAccessProvider, useQuickAccess } from "~/context/QuickAccessContext";
import { localStorageUtils } from "~/utils/localStorageUtils";
import { type IAppStorage } from "~/types/interfaces/ILocalStorageInterfaces";
import { useTheme, useMediaQuery } from "@mui/material";
import QuickAccessPanel from "./QuickAccessPanel";
import PageLoader from "~/components/layouts/PageLoader";
import { ToastAlertComponentController } from "../controllers/ToastAlertComponentController";
import { checkAppRefreshStatus } from "~/utils/appUtils";
import { SessionGuard } from "../system/SessionGuard";
import { InactivityGuard } from "../system/InactivityGuard";
import PageSkeletonLoader from "../system/skeletons/PageSkeletonLoader";

const SIDEBAR_WIDTH = 240;

const MainLayoutContent: React.FC = () => {
  const { navbarAutoHide, footerVisible } = useQuickAccess();

  const [mobileOpen, setMobileOpen] = useState(false);
  const [sidebarWidth, setSidebarWidth] = useState(SIDEBAR_WIDTH);

  const navigation = useNavigation();
  const isLoading = navigation.state === "loading";

  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("md"));

  const savedAppState: IAppStorage["app"] =
    localStorageUtils.ensureLocalAppStructure()?.app || {
      ui: { sidebar_show: "false", navbar_autohide: "false", footer_show: "true" },
    };

  useEffect(() => {
    document.body.style.overflow = "hidden";
    checkAppRefreshStatus();
  }, []);

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
    <div className="h-screen w-screen overflow-hidden relative">
      <div className="fixed inset-0 -z-10">
        <div className="absolute inset-0 bg-linear-to-r from-blue-50/30 via-green-50/40 to-red-50/30"></div>
        <div className="absolute inset-0 backdrop-blur-[1px]"></div>
      </div>

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

      <Navbar
        mobileOpen={mobileOpen}
        setMobileOpen={setMobileOpen}
        navbarAutoHide={navbarAutoHide}
      />

      <PageLoader loading={isLoading} text="Loading..." />

      <div
        className="flex flex-col h-full pt-16 overflow-hidden transition-all duration-300"
        style={{ marginLeft: isMobile ? 0 : `${sidebarWidth}px` }}
      >
       <main className="flex-1 overflow-y-auto overflow-x-auto p-3">
        <div className="w-full px-1.5 min-w-full">
          <Suspense fallback={<PageSkeletonLoader />}>
            <Outlet />
          </Suspense>
        </div>
      </main>

        {footerVisible && <Footer />}
      </div>

      <QuickAccessPanel />

      <ToastAlertComponentController.render />
    </div>
  );
};

const MainLayout: React.FC = () => {
  return (
    <QuickAccessProvider>
      <SessionGuard />
      <InactivityGuard />
      <MainLayoutContent />
    </QuickAccessProvider>
  );
};

export default MainLayout;