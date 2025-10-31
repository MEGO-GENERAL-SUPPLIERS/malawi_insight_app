// routes/_main.templates.tsx

import React from 'react';
import PageHeaderTitle from '../components/system/PageHeaderTitle';
import MenuCardGrid from '~/components/system/MenuCardGrid';
import { type IMenuCard } from '~/types/interfaces/IMenuCard';

const Templates: React.FC = () => {
  const templateCards: IMenuCard[] = [
    {
      icon: 'HandHeart',
      name: 'Care and Treatment',
      description: 'Care and Treatment Tools',
      route: '/app/programs/care_and_treatment/',
      colors: ['blue-400', 'blue-500', 'blue-600'], // 3-color gradient
      privileges: []
    },
    {
      icon: 'Syringe',
      name: 'HTS',
      description: 'HIV Testing Services',
      route: '/app/programs/hts/',
      colors: ['from-purple-400', 'to-pink-500'], // 2-color gradient
      privileges: []
    },
    {
      icon: 'Droplets',
      name: 'Viral Load',
      description: 'Viral Load Management',
      route: '/app/programs/viral_load/',
      colors: ['blue-400', 'blue-500', 'blue-600'], // 3-color gradient
      privileges: []
    },
    {
      icon: 'Hand',
      name: 'Prevention',
      description: 'Prevention Program',
      route: '/app/programs/prevention/',
      colors: ['blue-400', 'blue-500', 'blue-600'], // 3-color gradient
      privileges: []
    },
    {
      icon: 'Boxes',
      name: 'HSS',
      description: 'Health Systems Strengthing',
      route: '/app/programs/hss/',
      colors: ['blue-400', 'blue-500', 'blue-600'], // 3-color gradient
      privileges: []
    }
  ];

  const handleCardClick = (route: string) => {
    console.log(`Navigating to: ${route}`);
    // Implement navigation logic here (react-router, next/router, etc.)
  };

  return (
    <div className="min-h-screen bg-gray-50 p-1">
      <div className="max-w-8xl ml-0">
        <PageHeaderTitle
          icon="Atom"
          title="Programs"
          description="Access and interact with various program modules"
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