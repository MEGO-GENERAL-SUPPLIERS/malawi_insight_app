import { useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { App } from "@capacitor/app";
import type { PluginListenerHandle } from "@capacitor/core";

export function useAndroidBackButtonHandler() {
  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    let listener: PluginListenerHandle | null = null;

    // Async registration inside effect
    const setup = async () => {
      listener = await App.addListener("backButton", () => {

        // 1. If already on "/", ask to exit
        if (location.pathname === "/") {
          App.exitApp();
          return;
        }

        // 2. If browser history can go back
        if (window.history.length > 1) {
          window.history.back();
          return;
        }

        // 3. If no history available, fallback to "/"
        navigate("/");
      });
    };

    setup(); // Trigger async setup, but do NOT return async

    // Cleanup MUST be synchronous
    return () => {
      if (listener) {
        listener.remove();
      }
    };
  }, [location.pathname, navigate]);
}
