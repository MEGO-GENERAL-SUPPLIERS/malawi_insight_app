import { createRef } from "react";
import ToastAlertComponent, { type ToastAlertHandle, type ToastAlertProps } from "~/components/system/ToastAlertComponent";

const toastRef = createRef<ToastAlertHandle>();

export const ToastAlertComponentController = {
  render: () => <ToastAlertComponent ref={toastRef} />,
  show: (options: ToastAlertProps) => toastRef.current?.show(options),
  hide: () => toastRef.current?.hide(),
};
