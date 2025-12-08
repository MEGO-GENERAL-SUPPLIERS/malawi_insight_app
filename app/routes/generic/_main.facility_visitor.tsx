// routes/_main.templates.tsx

import React from 'react';
import PageHeaderTitle from '~/components/system/PageHeaderTitle';
import MenuCardGrid from '~/components/system/MenuCardGrid';
import { type IMenuCard } from '~/types/interfaces/IMenuCard';
import { useNavigator } from "~/hooks/useNavigator";

const Templates: React.FC = () => {
  const { navigateTo } = useNavigator();

  const templateCards: IMenuCard[] = [
    {
      icon: 'MapPinned',
      name: 'New Facility Visit',
      description: 'Form to add a facility visit',
      route: '/app/generic/facility_visitor/add',
      colors: ['blue-400', 'blue-500', 'blue-600'], // 3-color gradient
      privileges: []
    },
    {
      icon: "Table2Icon",
      name: 'Facility Visit Data',
      description: 'Facility visit data captured',
      route: '/app/generic/facility_visitor/data',
      colors: ['blue-400', 'blue-500', 'blue-600'],
      privileges: []
    },
    {
      icon: 'ChartPie',
      name: 'Reports',
      description: 'Facility Visit Reports',
      route: '/app/generic/facility_visitor/reports',
      colors: ['from-purple-400', 'to-pink-500'], // 2-color gradient
      privileges: []
    }
  ];

  const handleCardClick = (route: string) => {
    navigateTo(route);
  };

  return (
    <div className="min-h-screen bg-gray-50 p-1">
      <div className="max-w-8xl ml-0">
        <PageHeaderTitle
          icon="MapPinned"
          title="Facility Visit"
          description="Facility Visit related components"
          alignment="left"
        />
        
        <MenuCardGrid 
          cards={templateCards} 
          onCardClick={handleCardClick}
        />
      </div>
    </div>
  );
};

export default Templates;