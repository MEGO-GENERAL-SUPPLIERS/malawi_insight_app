import React, {
  forwardRef,
  useState,
  useImperativeHandle,
  useEffect,
} from "react";
import * as LucideIcons from "lucide-react";
import clsx from "clsx";

export interface StaticAlertProps {
  type?: "success" | "error" | "info" | "warning";
  title?: string;
  message?: string | string[];
  icon?: keyof typeof LucideIcons;
  dismissable?: boolean;
  className?: string;
  onClose?: () => void; // <-- new prop
}

export interface StaticAlertHandle {
  show: (props: StaticAlertProps) => void;
  hide: () => void;
}

export const StaticAlertComponent = forwardRef<
  StaticAlertHandle,
  StaticAlertProps
>((props, ref) => {
  const [visible, setVisible] = useState(false);
  const [internalProps, setInternalProps] = useState<StaticAlertProps>(props);

  const handleClose = () => {
    setVisible(false);
    internalProps.onClose?.(); // call the callback if provided
  };

  useImperativeHandle(ref, () => ({
    show: (newProps: StaticAlertProps) => {
      setInternalProps({ ...newProps });
      setVisible(true);
    },
    hide: () => handleClose(),
  }));

  useEffect(() => {
    if (props.message) {
      setInternalProps({ ...props });
      setVisible(true);
    } else if (!props.message) {
      handleClose();
    }
  }, [props.message, props.type, props.title, props.icon, props.dismissable]);

  if (!visible) return null;

  const {
    type = "info",
    title,
    message,
    icon,
    dismissable = false,
    className = "",
  } = internalProps;

  const Icon =
    (icon && LucideIcons[icon]) as React.ComponentType<{ size?: number }> ||
    LucideIcons.Info;

  const typeClasses = {
    success: "bg-green-50 border-green-400 text-green-800",
    error: "bg-red-50 border-red-400 text-red-800",
    info: "bg-blue-50 border-blue-400 text-blue-800",
    warning: "bg-yellow-50 border-yellow-400 text-yellow-800",
  };

  return (
    <div
      className={clsx(
        "flex flex-col border rounded-lg p-3 gap-2 shadow-sm transition-all duration-300 w-full",
        typeClasses[type],
        className
      )}
    >
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Icon size={18} />
          {title && <span className="font-semibold">{title}</span>}
        </div>

        {dismissable && (
          <button
            onClick={handleClose}
            className="ml-auto text-gray-500 hover:text-white hover:bg-red-600 hover:border hover:border-red-600 hover:rounded-full p-1 cursor-pointer transition-colors duration-200"
          >
            <LucideIcons.X size={18} />
          </button>
        )}
      </div>

      {message && (
        <div className="pl-6 text-sm">
          {Array.isArray(message) ? (
            <ul className="list-disc pl-4 space-y-1">
              {message.map((msg, i) => (
                <li key={i}>{msg}</li>
              ))}
            </ul>
          ) : (
            <p>{message}</p>
          )}
        </div>
      )}
    </div>
  );
});
