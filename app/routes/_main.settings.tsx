// routes/_main.settings.tsx

import React, {Suspense} from 'react';
import MenuCardGrid from '~/components/system/MenuCardGrid';
import PageHeaderTitle from '~/components/system/PageHeaderTitle';
import { type IMenuCard } from '~/types/interfaces/IMenuCard';
import { useNavigator } from "~/hooks/useNavigator";

const Settings: React.FC = () => {
  const { navigateTo } = useNavigator();

  const settingsCards: IMenuCard[] = [
    {
      icon: 'Wifi',
      name: 'Network/API Config',
      description: 'Configure network and API Config',
      route: '/app/settings/network',
      colors: ['from-cyan-400', 'to-blue-500'],
      privileges: []
    }, 
    {
      icon: 'MapPinned',
      name: 'Locations Settings',
      description: 'Manage System locations',
      route: 'settings_locations',
      colors: ['from-purple-400', 'to-pink-500'],
      privileges: ['can_manage_locations']
    },
    {
      icon: 'Shield',
      name: 'Role & Permissions',
      description: 'Configure roles and permissions',
      route: 'settings_roles',
      colors: ['from-purple-400', 'to-pink-500'],
      privileges: ['can_manage_role_privileges']
    },
    {
      icon: 'User',
      name: 'User Management',
      description: 'Manage system users',
      route: 'settings_users',
      colors: ['from-blue-400', 'to-blue-600'],
      privileges: ['can_manage_users']
    },
    {
      icon: 'Signature',
      name: 'Approval Chain Settings',
      description: 'Set  approval system',
      route: 'settings_approvals',
      colors: ['from-orange-400', 'to-red-500'],
      privileges: ['can_manage_approval_chains']
    },
    {
      icon: 'Server',
      name: 'System Settings',
      description: 'Configure system parameters',
      route: 'settings_system',
      colors: ['from-orange-400', 'to-red-500'],
      privileges: ['can_manage_system_settings']
    },
    {
      icon: 'HardDrive',
      name: 'Backup & Restore',
      description: 'Data backup and restoration',
      route: 'settings_backup',
      colors: ['from-indigo-400', 'to-purple-500'],
      privileges: ['can_manage_backup_settings']
    },
    {
      icon: 'Activity',
      name: 'Audit Logs',
      description: 'View system audit logs',
      route: 'settings_audit',
      colors: ['from-pink-400', 'to-rose-500'],
      privileges: ['can_access_audit_logs']
    }
  ];

  const handleCardClick = (route: string) => {
    navigateTo(route);
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