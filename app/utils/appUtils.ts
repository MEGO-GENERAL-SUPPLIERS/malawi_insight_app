import { AlertComponentController } from "~/components/controllers/AlertComponentController";
import { ToastAlertComponentController } from "~/components/controllers/ToastAlertComponentController";

export const handleAppRefresh = () => {
  AlertComponentController.dismiss();
  AlertComponentController.show({
    title: `Refresh Application`,
    message: `This will reload the application. Unsaved changes may be lost. Continue?`,
    type: "warning",
    buttons: [
      {
        label: "Cancel",
        className: "btn btn-danger",
        onClick: () => {},
        autoClose: true,
      },
      {
        label: "Refresh",
        className: "btn btn-success",
        onClick: () => {
          // Set flag to indicate refresh
          sessionStorage.setItem("appRefreshed", "true");
          window.location.reload();
        },
        autoClose: true,
      },
    ],
  });
};

// Call this once in your app entry point (e.g., index.tsx or App.tsx)
export const checkAppRefreshStatus = () => {
  window.addEventListener("load", () => {
    if (sessionStorage.getItem("appRefreshed") === "true") {
      ToastAlertComponentController.show({
        type: `success`,
        message: `Application refreshed successfully.`,
        autoHideDuration: 3500,
        icon: "CheckCircleIcon",
      });
      sessionStorage.removeItem("appRefreshed");
    }
  });
};