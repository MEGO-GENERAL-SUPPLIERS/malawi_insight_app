// ~/components/system/AlertComponent.tsx

import React, { useEffect, useState } from "react";
import parse, { domToReact, Element } from "html-react-parser";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Typography,
  Zoom,
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
  isHtml?: boolean;
  htmlStyles?: Record<string, React.CSSProperties>;
  countdownSeconds?: number; // Optional: enables auto-decrementing countdown
  onCountdownEnd?: () => void; // Triggered when countdown hits 0
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
  isHtml = true,
  htmlStyles = {},
  countdownSeconds,
  onCountdownEnd,
}) => {
  const [secondsLeft, setSecondsLeft] = useState<number | null>(
    countdownSeconds ?? null
  );

  // countdown
  useEffect(() => {
    if (countdownSeconds == null || countdownSeconds <= 0) {
      setSecondsLeft(null);
      return;
    }

    setSecondsLeft(countdownSeconds);

    const timer = setInterval(() => {
      setSecondsLeft((prev) => {
        if (prev === null || prev <= 0) {
          clearInterval(timer);
          return null;
        }

        const next = prev - 1;
        if (next === 0) {
          // Trigger onCountdownEnd exactly once at 0
          setTimeout(() => {
            onCountdownEnd?.();
          }, 0);
          clearInterval(timer);
          return 0;
        }

        return next;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [countdownSeconds, onCountdownEnd]);

  // Format message with live countdown
  const formatMessage = (): string | React.ReactNode => {
    if (typeof message !== "string") return message;

    // If user provided {{countdown}}, replace it
    if (message.includes("{{countdown}}")) {
      return message.replace(
        /{{countdown}}/g,
        `<strong>${secondsLeft ?? countdownSeconds}</strong>`
      );
    }

    // Otherwise, append a standard countdown notice
    if (secondsLeft !== null) {
      const word = secondsLeft === 1 ? "second" : "seconds";
      return `${message} Your session will expire in <strong>${secondsLeft}</strong> ${word}.`;
    }

    return message;
  };

  const colorStyles: Record<
    AlertType,
    { gradient: string; text: string; defaultIcon: string }
  > = {
    info: {
      gradient: "bg-gradient-to-r from-cyan-500 to-cyan-400",
      text: "text-white",
      defaultIcon: "Info",
    },
    success: {
      gradient: "bg-gradient-to-r from-emerald-600 to-emerald-500",
      text: "text-white",
      defaultIcon: "CheckCircle2",
    },
    warning: {
      gradient: "bg-gradient-to-r from-yellow-600 to-yellow-400",
      text: "text-white",
      defaultIcon: "AlertTriangle",
    },
    error: {
      gradient: "bg-gradient-to-r from-red-400 to-red-600",
      text: "text-white",
      defaultIcon: "AlertOctagon",
    },
    confirm: {
      gradient: "bg-gradient-to-r from-emerald-600 to-emerald-500",
      text: "text-white",
      defaultIcon: "HelpCircle",
    },
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

  const renderHtmlMessage = (html: string) =>
    parse(html, {
      replace: (domNode) => {
        if (domNode instanceof Element && htmlStyles[domNode.name]) {
          return (
            <span style={htmlStyles[domNode.name]}>
              {domToReact(domNode.children as any, { replace: undefined })}
            </span>
          );
        }
      },
    });

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
          top: "-10%",
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
          {isHtml && typeof message === "string" ? (
            <Typography variant="body1" className="text-slate-700 text-sm leading-relaxed mt-1">
              {renderHtmlMessage(formatMessage() as string)}
            </Typography>
          ) : (
            <Typography variant="body1" className="text-slate-700 text-sm leading-relaxed mt-1">
              {formatMessage()}
            </Typography>
          )}
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