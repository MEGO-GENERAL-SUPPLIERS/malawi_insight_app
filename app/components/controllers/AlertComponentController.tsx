// ~/components/controllers/AlertComponentController.ts

import React from "react";
import { createRoot, type Root } from "react-dom/client";
import AlertComponent, {
  type AlertType,
  type AlertButton,
} from "~/components/system/AlertComponent";

export interface AlertOptions {
  type?: AlertType;
  title?: string;
  icon?: string;
  message: string | React.ReactNode;
  buttons?: AlertButton[];
  dismissable?: boolean;
  backdropBlur?: number;
  backdropOpacity?: number;
  countdownSeconds?: number; // Optional countdown timer
  onCountdownEnd?: () => void; // Called when countdown reaches 0
}

export class AlertComponentController {
  private static root: Root | null = null;

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

      AlertComponentController.root = createRoot(container);

      const close = (buttonIndex: number | null = null) => {
        AlertComponentController.root?.unmount();
        AlertComponentController.root = null;
        resolve(buttonIndex);
      };

      const buttons = options.buttons?.map((btn, index) => ({
        ...btn,
        autoClose: true,
        onClick: () => {
          btn.onClick?.();
          close(index);
        },
      }));

      AlertComponentController.root.render(
        <AlertComponent
          open={true}
          title={options.title}
          message={options.message}
          type={options.type}
          buttons={buttons}
          dismissable={options.dismissable ?? true}
          backdropBlur={options.backdropBlur ?? 2}
          backdropOpacity={options.backdropOpacity ?? 0.3}
          countdownSeconds={options.countdownSeconds}
          onCountdownEnd={options.onCountdownEnd}
          onClose={() => close(null)}
        />
      );
    });
  }

  /**
   * Dismiss the currently open alert
   */
  static dismiss() {
    if (AlertComponentController.root) {
      AlertComponentController.root.unmount();
      AlertComponentController.root = null;
    }
  }
}