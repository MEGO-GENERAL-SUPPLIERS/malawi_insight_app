import React, { useState, useImperativeHandle, forwardRef } from "react";
import { Snackbar, Alert, type AlertColor, Slide, Fade, Grow, Zoom, type SlideProps } from "@mui/material";
import * as LucideIcons from "lucide-react";
import * as MuiIcons from "@mui/icons-material";

export interface ToastAlertProps {
  type?: AlertColor; // "error" | "warning" | "info" | "success"
  message: string;
  autoHideDuration?: number;
  positionX?: "left" | "center" | "right";
  positionY?: "top" | "bottom";
  variant?: "standard" | "filled" | "outlined";
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

// Slide default
const DefaultSlideTransition = (props: SlideProps) => <Slide {...props} direction="down" />;

const ToastAlertComponent = forwardRef<ToastAlertHandle>((_, ref) => {
  const [queue, setQueue] = useState<ToastQueueItem[]>([]);

  useImperativeHandle(ref, () => ({
    show: (options: ToastAlertProps) => {
      const id = `${Date.now()}-${Math.random()}`;
      setQueue((prev) => [...prev, { ...options, id }]);
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

  // Resolve transition component dynamically
  const resolveTransition = (animation?: string, slideDirection: "left" | "right" | "up" | "down" = "up") => {
    switch (animation) {
      case "slide":
        return (props: SlideProps) => <Slide {...props} direction={slideDirection} />;
      case "grow":
        return Grow;
      case "zoom":
        return Zoom;
      case "fade":
      default:
        return Fade;
    }
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
            TransitionComponent={TransitionComponent as any} // cast to any to bypass TS
            TransitionProps={{ timeout: 300 }} // optional duration
            sx={{
              ...(toast.positionY === "top" && toast.positionX === "center" && { top: "10%" }),
              ...(toast.positionY === "bottom" && toast.positionX === "center" && { bottom: "10%" }),
              mb: 1,
            }}
          >
            <Alert
              onClose={handleClose(toast.id)}
              severity={toast.type ?? "info"}
              variant={toast.variant ?? "filled"}
              icon={IconComponent ? <IconComponent /> : undefined}
              sx={{ width: "100%" }}
            >
              {toast.message}
            </Alert>
          </Snackbar>
        );
      })}
    </>
  );
});

export default ToastAlertComponent;
