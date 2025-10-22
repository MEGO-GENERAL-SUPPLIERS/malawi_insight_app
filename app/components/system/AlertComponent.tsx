import React from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Typography,
  type DialogProps,
  Slide, Zoom
} from "@mui/material";
import * as LucideIcons from "lucide-react";
import * as MuiIcons from "@mui/icons-material";
import clsx from "clsx";

export type AlertType = "info" | "success" | "error" | "warning" | "confirm";

export interface AlertButton {
  label: string;
  onClick: () => void;
  className?: string;
  icon?: string;
  autoClose?: boolean;
}

export interface AlertComponentProps {
  open: boolean;
  type?: AlertType;
  title?: string;
  message: string | React.ReactNode;
  icon?: string;
  messageIcon?: string;
  buttons?: AlertButton[];
  onClose: () => void;
  className?: string;
  dismissable?: boolean;
  backdropBlur?: number;
  backdropOpacity?: number;
}

const AlertComponent: React.FC<AlertComponentProps> = ({
  open,
  type = "info",
  title,
  message,
  icon,
  messageIcon,
  buttons = [],
  onClose,
  className = "",
  dismissable = true,
  backdropBlur = 2,
  backdropOpacity = 0.3,
}) => {
  const colorStyles: Record<
    AlertType,
    { gradient: string; text: string; defaultIcon: string }
  > = {
    info: { gradient: "bg-gradient-to-r from-cyan-500 to-cyan-400", text: "text-white", defaultIcon: "Info" },
    success: { gradient: "bg-gradient-to-r from-green-400 to-green-600", text: "text-white", defaultIcon: "CheckCircle2" },
    warning: { gradient: "bg-gradient-to-r from-yellow-400 to-yellow-600", text: "text-white", defaultIcon: "AlertTriangle" },
    error: { gradient: "bg-gradient-to-r from-red-400 to-red-600", text: "text-white", defaultIcon: "AlertOctagon" },
    confirm: { gradient: "bg-gradient-to-r from-emerald-600 to-emerald-500", text: "text-white", defaultIcon: "HelpCircle" },
  };

  const { gradient, text, defaultIcon } = colorStyles[type];

  const resolveIcon = (iconName?: string): React.ElementType | null => {
    if (!iconName) return null;
    return (LucideIcons as any)[iconName] || (MuiIcons as any)[iconName] || null;
  };

  const IconComponent = resolveIcon(icon || defaultIcon);
  const MessageIconComponent = resolveIcon(messageIcon);

  const handleButtonClick = (btn: AlertButton) => {
    btn.onClick?.();
    if (btn.autoClose) onClose();
  };

  return (
    <Dialog
      open={open}
      onClose={dismissable ? onClose : undefined}
      className={className}
      aria-labelledby="alert-dialog-title"
      aria-describedby="alert-dialog-description"
      PaperProps={{
        sx: {
          borderRadius: 2,
          overflow: "hidden",
          position: "relative",
          top: "-10%", // slightly above center
        },
      }}
      slotProps={{
        backdrop: {
          sx: {
            backgroundColor: `rgba(0,0,0,${backdropOpacity})`,
            backdropFilter: `blur(${backdropBlur}px)`,
            WebkitBackdropFilter: `blur(${backdropBlur}px)`,
          },
        },
      }}
      TransitionComponent={Zoom}
      transitionDuration={250}
    >
      {/* Header */}
      <DialogTitle className={clsx("flex items-center gap-3 px-4 py-0", gradient)}>
        {IconComponent && <IconComponent className={text} size={22} />}
        <Typography variant="h6" component="span" className={clsx("font-semibold", text)}>
          {title || type.toUpperCase()}
        </Typography>
      </DialogTitle>

      {/* Message */}
      <DialogContent className="bg-white px-6 py-6">
        <div className="flex items-start gap-2 mt-4">
          {MessageIconComponent && <MessageIconComponent className="text-slate-500 mt-1" size={18} />}
          <Typography variant="body1" className="text-slate-700 text-sm leading-relaxed mt-1">
            {message}
          </Typography>
        </div>
      </DialogContent>

      {/* Buttons */}
      <DialogActions className="flex justify-end gap-3 px-6 m-1 pb-4 border-t-1 border-slate-200">
        {buttons.length > 0 ? (
          buttons.map((btn, index) => {
            const BtnIcon = resolveIcon(btn.icon);
            return (
              <button
                key={index}
                onClick={() => handleButtonClick(btn)}
                className={clsx(
                  "flex items-center gap-2 px-4 py-2 cursor-pointer rounded-md font-medium transition-all shadow-sm",
                  btn.className || "btn-success hover:btn-success text-white"
                )}
              >
                {BtnIcon && <BtnIcon size={16} />}
                {btn.label}
              </button>
            );
          })
        ) : (
          <button
            onClick={onClose}
            className="bg-blue-600 hover:bg-blue-700 cursor-pointer text-white px-4 py-2 rounded-md"
          >
            OK
          </button>
        )}
      </DialogActions>
    </Dialog>
  );
};

export default AlertComponent;
