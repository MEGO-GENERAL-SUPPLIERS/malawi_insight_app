// routes/_main.templates.tsx

import React, { Suspense} from 'react';
import { type IMenuCard } from '~/types/interfaces/IMenuCard';
import { useNavigator } from "~/hooks/useNavigator";

const MenuCardGrid = React.lazy(() => import('~/components/system/MenuCardGrid'));
const MenuCardsSkeletonLoader = React.lazy(() => import("~/components/system/skeletons/MenuCardsSkeletonLoader"));
const PageHeaderTitle = React.lazy(() => import('../components/system/PageHeaderTitle'));

const Templates: React.FC = () => {
  const { navigateTo } = useNavigator();

  const templateCards: IMenuCard[] = [
    {
      icon: 'HandHeart',
      name: 'Care and Treatment',
      description: 'Care and Treatment Tools',
      route: 'programs_care_and_treatment',
      colors: ['blue-400', 'blue-500', 'blue-600'], // 3-color gradient
      privileges: []
    },
    {
      icon: 'Syringe',
      name: 'HTS',
      description: 'HIV Testing Services',
      route: 'programs_hts',
      colors: ['from-purple-400', 'to-pink-500'], // 2-color gradient
      privileges: []
    },
    {
      icon: 'Droplets',
      name: 'Viral Load',
      description: 'Viral Load Management',
      route: 'programs_viral_load',
      colors: ['blue-400', 'blue-500', 'blue-600'], // 3-color gradient
      privileges: []
    },
    {
      icon: 'Hand',
      name: 'Prevention',
      description: 'Prevention Program',
      route: 'programs_prevention_dashboard',
      colors: ['blue-400', 'blue-500', 'blue-600'], // 3-color gradient
      privileges: []
    },
    {
      icon: 'Boxes',
      name: 'HSS',
      description: 'Health Systems Strengthing',
      route: 'programs_hss',
      colors: ['blue-400', 'blue-500', 'blue-600'], // 3-color gradient
      privileges: []
    }
  ];

  const handleCardClick = (route: string) => {
    navigateTo(route);
  };

  return (
    <div className="min-h-screen bg-gray-50 p-1">
      <div className="max-w-8xl ml-0">
        <Suspense fallback={<MenuCardsSkeletonLoader />}>
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
        </Suspense>
      </div>
    </div>
  );
};

export default Templates;