import React from "react";
import type { IMenuCard } from "~/types/interfaces/IMenuCard";
import MenuCardGrid  from "~/components/system/MenuCardGrid";
import { useNavigator } from "~/hooks/useNavigator";

const PageHeaderTitle = React.lazy(() => import("~/components/system/PageHeaderTitle"));

const ICT = () => {
  const { navigateTo } = useNavigator();

  const genericCards: IMenuCard[] = [
    {
      icon: 'Package',
      name: 'Asset Management',
      description: 'Activities related to asset management',
      route: 'ict_asset_management',
      colors: ['blue-400', 'blue-500', 'blue-600'], 
      privileges: ["can_access_asset_management"]
    }
  ];

  const handleCardClick = (route: string) => {
    navigateTo(route);
  };

  return(
    <div className="min-h-screen bg-gray-50 p-1">
      <div className="max-w-8xl ml-0">
        <PageHeaderTitle
          icon="Monitor"
          title="ICT Department"
          description="ICT Department related modules"
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

export default ICT;