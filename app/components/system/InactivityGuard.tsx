import { useEffect, useRef } from "react";
import { useNavigator } from "~/hooks/useNavigator";
import { localStorageUtils } from "~/utils/localStorageUtils";
import { AlertComponentController } from "../controllers/AlertComponentController";
import { ToastAlertComponentController } from "../controllers/ToastAlertComponentController";
import { useAuth } from "~/hooks/AuthProvider";

export const InactivityGuard = () => {
  const navigator = useNavigator();
  const inactivityTimeout = useRef<NodeJS.Timeout | null>(null);
  const auth = useAuth();

  // Reset the main inactivity timer (before warning appears)
  const resetInactivityTimer = () => {
    if (inactivityTimeout.current) {
      clearTimeout(inactivityTimeout.current);
    }

    const user = localStorageUtils.getStoredUser();
    if (!user || !user.logged_in) return;

    const inactivityDurationMs = (user.inactivity_duration || 30) * 60 * 1000;
    inactivityTimeout.current = setTimeout(showInactivityWarning, inactivityDurationMs);
  };

  // Show warning modal — do NOT dismiss it on general activity
  const showInactivityWarning = () => {
    const user = localStorageUtils.getStoredUser();
    if (!user) return;

    const countdownSeconds = user.auto_logout_count || 30;

    AlertComponentController.show({
      title: "Session Timeout",
      message: "Your session is inactive.",
      type: "warning",
      countdownSeconds,
      onCountdownEnd: handleAutoLogout,
      dismissable: false,
      buttons: [
        {
          label: "Return to Session",
          className: "btn btn-success",
          onClick: () => {
            // Explicitly dismiss only here
            AlertComponentController.dismiss();
            resetInactivityTimer(); // Restart full inactivity cycle
          },
        },
        {
          label: "Logout",
          className: "btn btn-danger",
          onClick: () => {
            auth.logout();
            navigator.navigateTo("/");
          },
        },
      ],
    });
  };

  const handleAutoLogout = () => {
    AlertComponentController.dismiss();
    ToastAlertComponentController.show({
      message: "You have been logged out due to inactivity.",
      type: "info",
      autoHideDuration: 5000,
    });
    auth.logout();
    navigator.navigateTo("/");
  };

  useEffect(() => {
    const user = localStorageUtils.getStoredUser();
    if (!user || !user.logged_in) return;

    const events = [
      "mousedown", "mousemove", "mouseup", "click",
      "keydown", "keypress", "keyup",
      "touchstart", "touchmove", "touchend",
      "scroll", "wheel", "pointerdown", "pointermove", "pointerup"
    ];

    const handleActivity = () => {
      // Only reset timer if NO warning is currently shown
      // How? We assume: if alert is open, let countdown finish unless user clicks "Return"
      // So we ONLY reset if not in warning state.
      // Since we can't easily check alert state, we rely on logic:
      // → Don't reset once warning is shown. So we remove dismiss from here.
      resetInactivityTimer();
    };

    events.forEach(event => window.addEventListener(event, handleActivity, true));
    resetInactivityTimer();

    return () => {
      events.forEach(event => window.removeEventListener(event, handleActivity, true));
      if (inactivityTimeout.current) clearTimeout(inactivityTimeout.current);
    };
  }, [navigator, auth]);

  return null;
};