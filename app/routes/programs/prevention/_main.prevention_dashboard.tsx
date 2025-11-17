import React, { Suspense } from "react";
import { useNavigator } from "~/hooks/useNavigator";
const PageHeaderTitle = React.lazy(() => import("~/components/system/PageHeaderTitle"));
const MenuCardsSkeletonLoader = React.lazy(() => import("~/components/system/skeletons/MenuCardsSkeletonLoader"));
const MenuCardGrid = React.lazy(() => import("~/components/system/MenuCardGrid"));

import type { IMenuCard } from "~/types/interfaces/IMenuCard";

const PreventionDashboard: React.FC = () => {
  const { navigateTo } = useNavigator();
  
  const preventionCards: IMenuCard[] = [
    {
      icon: 'Stethoscope',
      name: 'TB Screening Data',
      description: 'Tuberculosis Screening module',
      route: 'programs_prevention_tb_screening',
      colors: ['blue-400', 'blue-500', 'blue-600'],
      privileges: []
    },
    {
      icon: 'Pill',
      name: 'TPT/IPT Report Form',
      description: 'TPT/IPT Report Form module',
      route: 'programs_prevention_tpt_report_form',
      colors: ['blue-400', 'blue-500', 'blue-600'],
      privileges: []
    },
    {
      icon: 'ChartPie',
      name: 'Prevention Reports',
      description: 'Tuberculosis Screening reports',
      route: 'programs_prevention_tb_reports',
      colors: ['bg-blue-400', 'bg-blue-500', 'bg-blue-600'],
      privileges: []
    }
  ];

  const handleCardClick = (route: string) => {
    navigateTo(route);
  }; 

  return(
    <div className="min-h-screen bg-gray-50 p-1">
      <div className="max-w-8xl ml-0">
        <Suspense fallback={<MenuCardsSkeletonLoader />}>
          <PageHeaderTitle
            icon="Hand"
            title="Prevention"
            description="Access and interact with various prevention program modules"
            alignment="left"
          />
          <MenuCardGrid 
            cards={preventionCards} 
            onCardClick={handleCardClick}
            />
        </Suspense>
      </div>
    </div>
  );
};

export default PreventionDashboard;