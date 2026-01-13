// components/custom-elements/MenuCardGrid.tsx

import React from 'react';
import MenuCard from './MenuCard';
import { privilegesUtils } from '../../utils/privilegesUtils';
import { type IMenuCardGridProps, type IMenuCard } from '~/types/interfaces/IMenuCard';

const MenuCardGrid: React.FC<IMenuCardGridProps> = ({ 
  cards, 
  userPrivileges,
  onCardClick 
}) => {
  // Get user privileges if not provided
  const privileges = userPrivileges || privilegesUtils.getUserPrivileges();
  
  // Filter cards based on user privileges
  const accessibleCards = privilegesUtils.filterByPrivileges(cards, privileges);

  if (accessibleCards.length === 0) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="text-center text-gray-500">
          <p className="text-lg font-medium">No accessible menu items</p>
          <p className="text-sm">Contact your administrator for access. If you have been given permissions, logout and login to see effect.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-6">
      {accessibleCards.map((card: IMenuCard, index: number) => (
        <MenuCard
          key={`${card.route}-${index}`}
          icon={card.icon}
          name={card.name}
          description={card.description}
          colors={card.colors}
          border={card.border}
          onClick={() => onCardClick(card.route)}
        />
      ))}
    </div>
  );
};

export default MenuCardGrid;