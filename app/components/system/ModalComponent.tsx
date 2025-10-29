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

    // 🔹 Safely close modal without infinite recursion
    const handleClose = useCallback(
      (silent: boolean = false) => {
        setOpen(false);
        setSlotData(null);
        setInstanceId(Date.now());
        if (!silent) onClose?.();
      },
      [onClose]
    );

    // 🔹 Expose modal control methods to parent
    useImperativeHandle(ref, () => ({
      openModal: () => setOpen(true),
      closeModal: (silent = false) => handleClose(silent),
      getSlotData: () => slotData,
    }));

    const handleButtonClick = (btn: ModalButton) => {
      btn.onClick?.(slotData);
    };

    const resolveIcon = (iconName: string) =>
      (LucideIcons as any)[iconName] ||
      (MuiIcons as any)[iconName] ||
      null;

    const IconComponent = icon ? resolveIcon(icon) : null;

    // ✅ Inject setSlotData only into valid React components (not DOM elements)
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
            top: "50%", // center vertically
            left: "50%",
            transform: "translate(-50%, -50%)", // true centering
            width: modalSizes[size],
            maxHeight: "90vh", // ensure modal never exceeds viewport height
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
              flexShrink: 0, // prevent header from shrinking when content grows
            }}
          >
            <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
              {IconComponent && <IconComponent />}
              <Typography variant="h6">{title}</Typography>
            </Box>

            {showCloseButton && (
              <IconButton onClick={() => handleClose(true)}>
                <X />
              </IconButton>
            )}
          </Box>

          {/* Body */}
          <Box
            key={instanceId}
            sx={{
              p: 2,
              overflowY: "auto", // scroll when content grows
              flexGrow: 1,       // body grows to fill remaining space
            }}
          >
            {renderChildren()}
          </Box>

          {/* Footer */}
          <Box
            sx={{
              display: "flex",
              justifyContent: "flex-end",
              gap: 1,
              p: 2,
              borderTop: "1px solid #eee",
              flexShrink: 0, // prevent footer from shrinking
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
                className="px-4 py-2 btn btn-danger"
                onClick={() => handleClose(true)}
              >
                Close
              </button>
            )}
          </Box>
        </Box>
      </Modal>
    );
  }
);
