// routes/_main.settings.tsx

import React from 'react';
import MenuCardGrid from '~/components/system/MenuCardGrid';
import PageHeaderTitle from '~/components/system/PageHeaderTitle';
import { type IMenuCard } from '~/types/interfaces/IMenuCard';
import { useNavigate } from 'react-router-dom';

const LocationsSettings: React.FC = () => {
  const navigate = useNavigate();

  const settingsCards: IMenuCard[] = [
    {
      icon: 'Map',
      name: 'Province',
      description: 'Manage Provinces',
      route: '/app/settings/locations/provinces',
      colors: ['from-cyan-400', 'to-blue-500'],
      privileges: []
    }, 
    {
      icon: 'MapPinned',
      name: 'District',
      description: 'Manage districts',
      route: '/app/settings/locations/districts',
      colors: ['from-purple-400', 'to-pink-500'],
      privileges: []
    },
    {
      icon: 'Hospital',
      name: 'Facilities',
      description: 'Manage Facilities',
      route: '/app/settings/locations/facilities',
      colors: ['from-purple-400', 'to-pink-500'],
      privileges: []
    }
  ];

  const handleCardClick = (route: string) => {
    console.log(`Navigating to: ${route}`);
    navigate(route);
  };

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-8xl mx-auto">
        <PageHeaderTitle
          icon="MapPinned"
          title="Locations Settings"
          description="Manage location settings"
          alignment="left"
        />
        
        <MenuCardGrid 
          cards={settingsCards} 
          onCardClick={handleCardClick}
        />
      </div>
    </div>
  );
};

export default LocationsSettings;