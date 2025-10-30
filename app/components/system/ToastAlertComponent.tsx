import React, { useState, useImperativeHandle, forwardRef } from "react";
import { Snackbar, Slide, Fade, Grow, Zoom, type SlideProps } from "@mui/material";
import * as LucideIcons from "lucide-react";
import * as MuiIcons from "@mui/icons-material";

export interface ToastAlertProps {
  type?: "error" | "warning" | "info" | "success";
  message: string;
  autoHideDuration?: number;
  positionX?: "left" | "center" | "right";
  positionY?: "top" | "bottom";
  icon?: string;
  animation?: "fade" | "slide" | "grow" | "zoom";
  slideDirection?: "up" | "down" | "left" | "right";
}

export interface ToastAlertHandle {
  show: (options: ToastAlertProps) => void;
  hide: () => void;
}

interface ToastQueueItem extends ToastAlertProps {
  id: string;
}

const ToastAlertComponent = forwardRef<ToastAlertHandle>((_, ref) => {
  const [queue, setQueue] = useState<ToastQueueItem[]>([]);

  useImperativeHandle(ref, () => ({
    show: (options: ToastAlertProps) => {
      // Avoid duplicate messages
      setQueue((prev) => {
        const exists = prev.find((t) => t.message === options.message && t.type === options.type);
        if (exists) return prev;
        const id = `${Date.now()}-${Math.random()}`;
        return [...prev, { ...options, id }];
      });
    },
    hide: () => setQueue((prev) => prev.slice(1)),
  }));

  const handleClose = (id: string) => (_?: React.SyntheticEvent | Event, reason?: string) => {
    if (reason === "clickaway") return;
    setQueue((prev) => prev.filter((toast) => toast.id !== id));
  };

  const resolveIcon = (name?: string) => {
    if (!name) return undefined;
    return (LucideIcons as any)[name] || (MuiIcons as any)[name] || undefined;
  };

  const resolveTransition = (animation?: string, slideDirection: "left" | "right" | "up" | "down" = "up", positionY: "top" | "bottom" = "top" ) => {
    if (animation === "slide") {
      let actualDirection = slideDirection;

      // Fix direction based on Snackbar position
      if (positionY === "top") {
        // Top toasts slide downward INTO view
        if (slideDirection === "down") actualDirection = "down";
        if (slideDirection === "up") actualDirection = "up";
      } else {
        // Bottom toasts should slide upward INTO view
        if (slideDirection === "down") actualDirection = "up";
        if (slideDirection === "up") actualDirection = "down";
      }

      return (props: SlideProps) => <Slide {...props} direction={actualDirection} />;
    }

    switch (animation) {
      case "grow":
        return Grow;
      case "zoom":
        return Zoom;
      case "fade":
      default:
        return Fade;
    }
  };

  const typeToGradient = {
    success: "bg-gradient-to-r from-emerald-600 to-emerald-500 text-white",
    error: "bg-gradient-to-r from-red-600 to-red-500 text-white",
    warning: "bg-gradient-to-r from-yellow-600 to-orange-500 text-white",
    info: "bg-gradient-to-r from-blue-600 to-blue-500 text-white",
  };

  return (
    <>
      {queue.map((toast) => {
        const IconComponent = resolveIcon(toast.icon);
        const TransitionComponent = resolveTransition(toast.animation);

        return (
          <Snackbar
            key={toast.id}
            open
            autoHideDuration={toast.autoHideDuration ?? 4000}
            onClose={handleClose(toast.id)}
            anchorOrigin={{
              vertical: toast.positionY ?? "top",
              horizontal: toast.positionX ?? "center",
            }}
            TransitionComponent={TransitionComponent as any}
            TransitionProps={{ timeout: 300 }}
          >
            <div
              className={`flex items-center gap-2 px-4 py-3 rounded-md shadow-lg ${typeToGradient[toast.type ?? "info"]}`}
            >
              {IconComponent && <IconComponent className="w-6 h-6" />}
              <span className="font-medium">{toast.message}</span>
            </div>
          </Snackbar>
        );
      })}
    </>
  );
});

export default ToastAlertComponent;
