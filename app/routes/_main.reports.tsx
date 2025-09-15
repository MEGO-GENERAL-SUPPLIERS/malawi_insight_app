import React from 'react';
import MenuCardGrid from '~/components/system/MenuCardGrid';
import PageHeaderTitle from '~/components/system/PageHeaderTitle';
import { type IMenuCard } from '~/types/interfaces/IMenuCard';

const Reports: React.FC = () => {
const menuCards: IMenuCard[] = [
  {
    icon: 'TrendingUpDown',
    name: 'Unapproved Reports(s)',
    description: 'Reports not yet approved at National Level',
    route: '/templates/reports',
    colors: ['blue-400', 'blue-500', 'blue-600'], // 3-color gradient
    privileges: []
  },
  {
    icon: 'TrendingUp',
    name: 'Reports(s)',
    description: 'Reports approved at National Level',
    route: '/templates/reports',
    colors: ['blue-400', 'blue-500', 'blue-600'], // 3-color gradient
    privileges: []
  }
];

const handleCardClick = (route: string) => {
  console.log(`Navigating to: ${route}`);
  // Implement navigation logic here (react-router, next/router, etc.)
};
  
  return (
    <div className="min-h-screen bg-gray-50 p-2">
      <div className="max-w-7xl ml-0">
        <PageHeaderTitle
          icon="ChartPie"
          title="Reports"
          description="View various reports"
          alignment="left"
        />
        
        <MenuCardGrid 
          cards={menuCards} 
          onCardClick={handleCardClick}
        />
      </div>
    </div>
  );
}

export default Reports