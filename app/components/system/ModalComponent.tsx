import React, {
  useState,
  forwardRef,
  useImperativeHandle,
  type ReactNode,
  useCallback,
  type ReactElement,
} from "react";
import { Modal, Box, Typography, IconButton } from "@mui/material";
import * as LucideIcons from "lucide-react";
import * as MuiIcons from "@mui/icons-material";
import clsx from "clsx";
import { X } from "lucide-react";

type ModalSize = "xs" | "sm" | "md" | "lg" | "xl" | "full";

export interface ModalButton {
  label: string;
  icon?: string;
  className?: string;
  onClick?: (data?: any) => void;
}

export interface ReusableModalProps {
  title?: ReactNode;
  icon?: string;
  size?: ModalSize;
  blur?: number;
  backdropOpacity?: number;
  dismissable?: boolean;
  headerClass?: string;
  showCloseButton?: boolean;
  customButtons?: ModalButton[];
  children?: ReactNode;
  onClose?: () => void;
}

interface SlotDataChildProps {
  setSlotData?: (data: any) => void;
}

const modalSizes: Record<ModalSize, number> = {
  xs: 300,
  sm: 400,
  md: 600,
  lg: 800,
  xl: 1000,
  full: 0, // unused when isFull=true
};

export const ModalComponent = forwardRef(
  (
    {
      title = "",
      icon,
      size = "md",
      blur = 1,
      backdropOpacity = 0.4,
      dismissable = false,
      headerClass = "",
      showCloseButton = true,
      customButtons = [],
      children,
      onClose,
    }: ReusableModalProps,
    ref
  ) => {
    const [open, setOpen] = useState(false);
    const [slotData, setSlotData] = useState<any>(null);
    const [instanceId, setInstanceId] = useState<number>(Date.now());

    const handleClose = useCallback(
      (silent: boolean = false) => {
        setOpen(false);
        setSlotData(null);
        setInstanceId(Date.now());
        if (!silent) onClose?.();
      },
      [onClose]
    );

    useImperativeHandle(ref, () => ({
      openModal: () => setOpen(true),
      closeModal: (silent = false) => handleClose(silent),
      getSlotData: () => slotData,
    }));

    const handleButtonClick = (btn: ModalButton) => {
      btn.onClick?.(slotData);
    };

    const resolveIcon = (iconName: string) =>
      (LucideIcons as any)[iconName] || (MuiIcons as any)[iconName] || null;

    const IconComponent = icon ? resolveIcon(icon) : null;

    const renderChildren = () => {
      if (React.isValidElement(children)) {
        const childType = typeof children.type;
        if (childType === "function" || childType === "object") {
          const child = children as ReactElement<SlotDataChildProps>;
          return React.cloneElement(child, { setSlotData });
        }
      }
      return children;
    };

    const isFull = size === "full";

    return (
      <Modal
        open={open}
        onClose={dismissable ? () => handleClose(true) : undefined}
        closeAfterTransition
        disableEscapeKeyDown={!dismissable}
        sx={{
          "& .MuiBackdrop-root": {
            backgroundColor: `rgba(0, 0, 0, ${backdropOpacity})`,
            backdropFilter: `blur(${blur}px)`,
          },
        }}
      >
        <Box
          sx={{
            position: "absolute",
            top: isFull ? "8px" : "50%",
            left: isFull ? "8px" : "50%",
            transform: isFull ? "none" : "translate(-50%, -50%)",
            width: isFull
              ? "calc(100% - 16px)"
              : {
                  xs: "calc(100% - 32px)",
                  sm: modalSizes[size],
                },
            maxWidth: isFull
              ? "none"
              : {
                  xs: "calc(100vw - 32px)",
                  sm: modalSizes[size],
                },
            height: isFull ? "calc(100vh - 16px)" : "auto",
            maxHeight: isFull ? "none" : "90vh",
            bgcolor: "background.paper",
            borderRadius: { xs: 0, sm: 0.75 },
            display: "flex",
            flexDirection: "column",
            outline: "none",
            boxShadow: isFull
              ? "0 0 12px rgba(0,0,0,0.25)"
              : "0 4px 20px rgba(0,0,0,0.2)",
          }}
        >
          {/* Header */}
          <Box
            className={clsx(headerClass)}
            sx={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              p: 2,
              borderBottom: "1px solid #eee",
              flexShrink: 0,
            }}
          >
            <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
              {IconComponent && <IconComponent className="w-5 h-5" />}
              {title && (
                <Typography variant="h6" component="div">
                  {title}
                </Typography>
              )}
            </Box>

            {showCloseButton && (
              <IconButton
                onClick={() => handleClose(true)}
                size="small"
                sx={{ p: 0.5 }}
              >
                <X className="w-5 h-5" />
              </IconButton>
            )}
          </Box>

          {/* Body */}
          <Box
            key={instanceId}
            sx={{
              p: 2,
              overflowY: "auto",
              flexGrow: 1,
              minHeight: 0, // ensures proper shrinking on mobile
            }}
          >
            {renderChildren()}
          </Box>

          {/* Footer */}
          {(customButtons.length > 0 || showCloseButton) && (
            <Box
              sx={{
                display: "flex",
                justifyContent: "flex-end",
                gap: 1.5,
                p: 2,
                borderTop: "1px solid #eee",
                flexShrink: 0,
                flexWrap: "wrap", // prevents button overflow on tiny screens
              }}
            >
              {customButtons.map((btn, idx) => {
                const ButtonIcon = btn.icon ? resolveIcon(btn.icon) : null;
                return (
                  <button
                    key={idx}
                    className={clsx(
                      "px-4 py-2 rounded-md text-sm font-medium whitespace-nowrap",
                      "focus:outline-none focus:ring-2 focus:ring-offset-1",
                      btn.className
                    )}
                    onClick={() => handleButtonClick(btn)}
                  >
                    {ButtonIcon && <ButtonIcon className="w-4 h-4 inline mr-1" />}
                    {btn.label}
                  </button>
                );
              })}

              {showCloseButton && (
                <button
                  className="px-4 py-2 rounded-md text-sm font-medium bg-red-600 hover:bg-red-500 text-white whitespace-nowrap focus:outline-none focus:ring-2 focus:ring-offset-1 focus:ring-gray-400 cursor-pointer"
                  onClick={() => handleClose(true)}
                >
                  Close
                </button>
              )}
            </Box>
          )}
        </Box>
      </Modal>
    );
  }
);

ModalComponent.displayName = "ModalComponent";