import React from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Typography,
  type DialogProps,
} from "@mui/material";
import * as LucideIcons from "lucide-react";

export type AlertType = "info" | "success" | "error" | "warning" | "confirm";

export interface AlertButton {
  label: string;
  onClick: () => void;
  className?: string;
  icon?: keyof typeof LucideIcons;
  autoClose?: boolean;
}

export interface AlertComponentProps {
  open: boolean;
  type?: AlertType;
  title?: string;
  message: string | React.ReactNode;
  buttons?: AlertButton[];
  onClose: () => void;
  className?: string;
  dismissable?: boolean; // Click backdrop to close
  backdropBlur?: number; // Backdrop blur (px)
  backdropOpacity?: number; // Backdrop opacity (0–1)
}

const AlertComponent: React.FC<AlertComponentProps> = ({
  open,
  type = "info",
  title,
  message,
  buttons = [],
  onClose,
  className = "",
  dismissable = true,
  backdropBlur = 1,
  backdropOpacity = 0.4,
}) => {
  const colorStyles: Record<
    AlertType,
    { bg: string; border: string; text: string; Icon: keyof typeof LucideIcons }
  > = {
    info: { bg: "bg-blue-50", border: "border-blue-400", text: "text-blue-700", Icon: "Info" },
    success: { bg: "bg-green-50", border: "border-green-400", text: "text-green-700", Icon: "CheckCircle2" },
    warning: { bg: "bg-yellow-50", border: "border-yellow-400", text: "text-yellow-700", Icon: "AlertTriangle" },
    error: { bg: "bg-red-50", border: "border-red-400", text: "text-red-700", Icon: "AlertOctagon" },
    confirm: { bg: "bg-blue-50", border: "border-blue-400", text: "text-blue-700", Icon: "HelpCircle" },
  };

  const { bg, border, text, Icon: DefaultIcon } = colorStyles[type];
  const IconComponent = LucideIcons[DefaultIcon] as React.ElementType;

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
      slotProps={{
        backdrop: {
          sx: {
            backgroundColor: `rgba(0, 0, 0, ${backdropOpacity})`,
            backdropFilter: `blur(${backdropBlur}px)`,
            WebkitBackdropFilter: `blur(${backdropBlur}px)`,
          },
        },
      }}
    >
      <DialogTitle className={`flex items-center gap-2 border-b ${border} ${bg} px-4 py-4`}>
        <IconComponent className={`${text}`} size={22} />
        <Typography variant="h6" component="span" className={`font-semibold ${text}`}>
          {title || type.toUpperCase()}
        </Typography>
      </DialogTitle>

      <DialogContent className="px-6 py-6">
        <Typography variant="body1" className={`text-sm leading-relaxed mt-4 ${text}`}>
          {message}
        </Typography>
      </DialogContent>

      <DialogActions className="flex justify-end gap-3 px-5 pb-4">
        {buttons.length > 0 ? (
          buttons.map((btn, index) => {
            const BtnIcon = btn.icon ? (LucideIcons[btn.icon] as React.ElementType) : null;
            return (
              <button
                key={index}
                onClick={() => handleButtonClick(btn)}
                className={`flex items-center gap-2 px-4 py-2 cursor-pointer rounded-md font-medium transition-all ${
                  btn.className || "btn-success hover:btn-success text-white shadow-sm"
                }`}
              >
                {BtnIcon && <BtnIcon size={16} />}
                {btn.label}
              </button>
            );
          })
        ) : (
          <button
            onClick={onClose}
            className="btn-success hover:btn-success cursor-pointer text-white px-4 py-2 rounded-md"
          >
            OK
          </button>
        )}
      </DialogActions>
    </Dialog>
  );
};

export default AlertComponent;
