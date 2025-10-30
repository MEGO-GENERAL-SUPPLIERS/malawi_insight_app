// routes/_main.settings.tsx

import React from 'react';
import MenuCardGrid from '~/components/system/MenuCardGrid';
import PageHeaderTitle from '~/components/system/PageHeaderTitle';
import { type IMenuCard } from '~/types/interfaces/IMenuCard';
import { useNavigate } from 'react-router-dom';

const Settings: React.FC = () => {
  const navigate = useNavigate();

  const settingsCards: IMenuCard[] = [
    {
      icon: 'Wifi',
      name: 'Network/API Settings',
      description: 'Configure network and API settings',
      route: '/app/settings/network',
      colors: ['from-cyan-400', 'to-blue-500'],
      privileges: []
    }, 
    {
      icon: 'MapPinned',
      name: 'Locations Settings',
      description: 'Manage System locations',
      route: '/app/settings/locations',
      colors: ['from-purple-400', 'to-pink-500'],
      privileges: []
    },
    {
      icon: 'Shield',
      name: 'Role & Permissions',
      description: 'Configure roles and permissions',
      route: '/settings/roles',
      colors: ['from-purple-400', 'to-pink-500'],
      privileges: []
    },
    {
      icon: 'User',
      name: 'User Management',
      description: 'Manage system users',
      route: '/settings/users',
      colors: ['from-blue-400', 'to-blue-600'],
      privileges: []
    },
    {
      icon: 'Signature',
      name: 'Approval Chain Settings',
      description: 'Set  approval system',
      route: '/settings/system',
      colors: ['from-orange-400', 'to-red-500'],
      privileges: []
    },
    {
      icon: 'Server',
      name: 'System Settings',
      description: 'Configure system parameters',
      route: '/settings/system',
      colors: ['from-orange-400', 'to-red-500'],
      privileges: []
    },
    {
      icon: 'HardDrive',
      name: 'Backup & Restore',
      description: 'Data backup and restoration',
      route: '/settings/backup',
      colors: ['from-indigo-400', 'to-purple-500'],
      privileges: []
    },
    {
      icon: 'Activity',
      name: 'Audit Logs',
      description: 'View system audit logs',
      route: '/settings/audit',
      colors: ['from-pink-400', 'to-rose-500'],
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
          icon="Cog"
          title="Settings"
          description="View various reports"
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

export default Settings;