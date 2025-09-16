import React, { useState, useEffect } from "react";
import { Outlet } from "react-router-dom";
import Navbar from "~/components/layouts/Navbar";
import SideMenu from "~/components/layouts/SideMenu";
import Footer from "~/components/layouts/Footer";
import { QuickAccessProvider } from "~/context/QuickAccessContext";
import { localStorageUtils } from "~/utils/localStorageUtils";
import { type IAppStorage } from "~/types/interfaces/ILocalStorageInterfaces";
import { useTheme, useMediaQuery } from "@mui/material";
import QuickAccessPanel from "./QuickAccessPanel";

const MainLayout: React.FC = () => {
  const savedAppState: IAppStorage["app"] =
    localStorageUtils.ensureLocalAppStructure()?.app || {
      ui: { sidebar_show: "false", navbar_autohide: "false", footer_show: "true" },
    };
    
  const [navbarAutoHide, setNavbarAutoHide] = useState(savedAppState.ui.navbar_autohide === "true");
  const [footerVisible, setFooterVisible] = useState(savedAppState.ui.footer_show === "true");
  const [mobileOpen, setMobileOpen] = useState(false);

  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("md"));

  // Persist UI changes only for desktop
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
      <div className="flex h-screen relative">
        {/* Gradient Background */}
        <div className="fixed inset-0 -z-10">
          <div className="absolute inset-0 bg-gradient-to-r from-blue-50/30 via-green-50/40 to-red-50/30"></div>
          <div className="absolute inset-0 backdrop-blur-[1px]"></div>
        </div>

        {/* SideMenu */}
        <SideMenu
          mobileOpen={mobileOpen}
          setMobileOpen={setMobileOpen}
          defaultMinimised={true}  // Always minimised on mobile
          isMobile={isMobile}       // Inform SideMenu of mobile view
        />

        {/* Navbar */}
        <Navbar mobileOpen={mobileOpen} setMobileOpen={setMobileOpen} navbarAutoHide={navbarAutoHide} />

        {/* Main Content */}
        <div className="flex-1 flex flex-col pt-16">
          <main className="flex-1 p-2 overflow-y-auto">
            <div className="max-w-7xl mx-1">
              <Outlet />
            </div>
          </main>
          {footerVisible && <Footer />}
        </div>
      </div>

      {/*Quick Access Panel*/}
      <QuickAccessPanel />
    </QuickAccessProvider>
  );
};

export default MainLayout;
