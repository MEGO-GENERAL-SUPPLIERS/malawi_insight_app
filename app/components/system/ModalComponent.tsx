import React, {
  useState,
  forwardRef,
  useImperativeHandle,
  type ReactNode,
  useCallback,
} from "react";
import { Modal, Box, Typography, IconButton } from "@mui/material";
import * as LucideIcons from "lucide-react";
import * as MuiIcons from "@mui/icons-material";
import clsx from "clsx";
import { X } from "lucide-react";

type ModalSize = "xs" | "sm" | "md" | "lg" | "xl" | "full";

export interface ModalButton {
  label: string;
  className?: string;
  onClick?: (data?: any) => void;
}

export interface ReusableModalProps {
  title?: string;
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

const modalSizes: Record<ModalSize, string | number> = {
  xs: 300,
  sm: 400,
  md: 600,
  lg: 800,
  xl: 1000,
  full: "100%",
};

export const ModalComponent = forwardRef(({
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
  onClose
}: ReusableModalProps, ref) => {
  const [open, setOpen] = useState(false);
  const [slotData, setSlotData] = useState<any>(null);
  const [instanceId, setInstanceId] = useState<number>(Date.now());

  // Expose functions to parent
  useImperativeHandle(ref, () => ({
    openModal: () => setOpen(true),
    closeModal: handleClose,
    getSlotData: () => slotData,
  }));

  const handleClose = useCallback(() => {
    setOpen(false);
    setSlotData(null);
    // Generate a new ID so React remounts the children fresh
    setInstanceId(Date.now());
    onClose?.();
  }, [onClose]);

  const handleButtonClick = (btn: ModalButton) => {
    btn.onClick?.(slotData);
  };

  const resolveIcon = (iconName: string) => {
    return (LucideIcons as any)[iconName] || (MuiIcons as any)[iconName] || null;
  };

  const IconComponent = icon ? resolveIcon(icon) : null;

  return (
    <Modal
      open={open}
      onClose={dismissable ? handleClose : undefined}
      closeAfterTransition
      disableEscapeKeyDown={!dismissable}
      slots={{
        backdrop: (props) => (
          <div
            {...props}
            style={{
              position: "fixed",
              inset: 0,
              backgroundColor: `rgba(0,0,0,${backdropOpacity})`,
              backdropFilter: `blur(${blur}px)`,
            }}
          />
        ),
      }}
    >
      <Box
        sx={{
          position: "absolute",
          top: "35%",
          left: "50%",
          transform: "translate(-50%, -50%)",
          width: modalSizes[size],
          maxHeight: "90vh",
          bgcolor: "background.paper",
          borderRadius: 0.6,
          display: "flex",
          flexDirection: "column",
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
          }}
        >
          <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
            {IconComponent && <IconComponent />}
            <Typography variant="h6">{title}</Typography>
          </Box>
          {showCloseButton && (
            <IconButton onClick={handleClose}>
              <X />
            </IconButton>
          )}
        </Box>

        {/* Body (remounts when instanceId changes) */}
        <Box key={instanceId} sx={{ p: 2, overflowY: "auto" }}>
          {children &&
            React.isValidElement<SlotDataChildProps>(children) &&
            React.cloneElement(children, { setSlotData })}
        </Box>

        {/* Footer */}
        <Box
          sx={{
            display: "flex",
            justifyContent: "flex-end",
            gap: 1,
            p: 2,
            borderTop: "1px solid #eee",
          }}
        >
          {customButtons.map((btn, idx) => (
            <button
              key={idx}
              className={clsx("px-4 py-2 rounded", btn.className)}
              onClick={() => handleButtonClick(btn)}
            >
              {btn.label}
            </button>
          ))}
          {showCloseButton && (
            <button
              className="px-4 py-2 rounded border cursor-pointer btn-danger btn hover:bg-red-500 hover:text-white"
              onClick={handleClose}
            >
              Close
            </button>
          )}
        </Box>
      </Box>
    </Modal>
  );
});
