import React from "react";
import { createRoot } from "react-dom/client";
import AlertComponent, { type AlertType, type AlertButton } from "~/components/system/AlertComponent";

interface AlertOptions {
  type?: AlertType;
  title?: string;
  message: string | React.ReactNode;
  buttons?: AlertButton[];
  dismissable?: boolean;
  backdropBlur?: number;
  backdropOpacity?: number;
}

export class AlertComponentController {
  /**
   * Show alert and return a Promise with the button clicked index
   */
  static show(options: AlertOptions): Promise<number | null> {
    return new Promise((resolve) => {
      let container = document.getElementById("alert-root");
      if (!container) {
        container = document.createElement("div");
        container.id = "alert-root";
        document.body.appendChild(container);
      }

      const root = createRoot(container);

      const close = (buttonIndex: number | null = null) => {
        root.unmount();
        resolve(buttonIndex);
      };

      // Wrap buttons to auto-close and resolve promise
      const buttons = options.buttons?.map((btn, index) => ({
        ...btn,
        autoClose: true,
        onClick: () => {
          btn.onClick?.();
          close(index);
        },
      }));

      root.render(
        <AlertComponent
          open={true}
          title={options.title}
          message={options.message}
          type={options.type}
          buttons={buttons}
          dismissable={options.dismissable ?? true}
          backdropBlur={options.backdropBlur ?? 2}
          backdropOpacity={options.backdropOpacity ?? 0.3}
          onClose={() => close(null)}
        />
      );
    });
  }
}
