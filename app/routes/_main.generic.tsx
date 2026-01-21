import React from "react";
import type { IMenuCard } from "~/types/interfaces/IMenuCard";
import MenuCardGrid  from "~/components/system/MenuCardGrid";
import { useNavigator } from "~/hooks/useNavigator";

const PageHeaderTitle = React.lazy(() => import("~/components/system/PageHeaderTitle"));

const Generic = () => {
  const { navigateTo } = useNavigator();

  const genericCards: IMenuCard[] = [
    {
      icon: 'MapPinned',
      name: 'Facility Visitor',
      description: 'Activities related to facility visit for mentorship or support supervision',
      route: 'generic_facility_visitor',
      colors: ['blue-400', 'blue-500', 'blue-600'], 
      privileges: ["can_access_facility_visitor"]
    }
  ];


  const handleCardClick = (route: string) => {
    navigateTo(route);
  };

  return(
    <div className="min-h-screen bg-gray-50 p-1">
      <div className="max-w-8xl ml-0">
        <PageHeaderTitle
          icon="Globe"
          title="Generic Modules"
          description="Generic module that habours generic system modules usable by various groups of people"
          alignment="left"
        />
        
        <MenuCardGrid 
          cards={genericCards} 
          onCardClick={handleCardClick}
        />
      </div>
    </div>
  );
};

export default Generic;