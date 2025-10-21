// routes/_main.templates.tsx

import React from 'react';
import PageHeaderTitle from '../components/system/PageHeaderTitle';
import MenuCardGrid from '~/components/system/MenuCardGrid';
import { type IMenuCard } from '~/types/interfaces/IMenuCard';
import { useNavigate } from 'react-router-dom';

const Templates: React.FC = () => {
  const navigate = useNavigate();

  const templateCards: IMenuCard[] = [
    {
      icon: 'Files',
      name: 'Templates',
      description: 'Activities related to templates interactions',
      route: '/app/strategic_info/templates',
      colors: ['blue-400', 'blue-500', 'blue-600'], // 3-color gradient
      privileges: []
    },
    {
      icon: 'ChartPie',
      name: 'Reports',
      description: 'Strategic Information Reports',
      route: '/app/strategic_info/reports',
      colors: ['from-purple-400', 'to-pink-500'], // 2-color gradient
      privileges: []
    }
  ];

  const handleCardClick = (route: string) => {
    console.log(`Navigating to: ${route}`);
    navigate(route);
  };

  return (
    <div className="min-h-screen bg-gray-50 p-1">
      <div className="max-w-8xl ml-0">
        <PageHeaderTitle
          icon="SquareLibrary"
          title="Strategic Information Unit"
          description="Strategic Information Unit area"
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