import React, { createRef } from "react";
import {
  StaticAlertComponent,
  type StaticAlertHandle,
  type StaticAlertProps,
} from "~/components/system/StaticAlertComponent";

const alertRef = createRef<StaticAlertHandle>();

export const StaticAlertComponentController = {
  render: () => <StaticAlertComponent ref={alertRef} />,
  show: (props: StaticAlertProps) => {
    alertRef.current?.show(props);
  },
  hide: () => {
    alertRef.current?.hide();
  },
};
