// routes/_main.templates.tsx

import React from 'react';
import PageHeaderTitle from '../components/system/PageHeaderTitle';
import MenuCardGrid from '~/components/system/MenuCardGrid';
import { type IMenuCard } from '~/types/interfaces/IMenuCard';

const Templates: React.FC = () => {
  const templateCards: IMenuCard[] = [
    {
      icon: 'CloudUpload',
      name: 'Upload Template(s)',
      description: 'Upload report templates',
      route: '/templates/reports',
      colors: ['blue-400', 'blue-500', 'blue-600'], // 3-color gradient
      privileges: []
    },
    {
      icon: 'Layout',
      name: 'Templates Upload Tracker',
      description: 'Templates upload monthly tracker',
      route: '/templates/layouts',
      colors: ['from-purple-400', 'to-pink-500'], // 2-color gradient
      privileges: []
    },
    {
      icon: 'Send',
      name: 'Templates Submission (DEC)',
      description: 'Submit templates by DECs',
      route: '/templates/reports',
      colors: ['blue-400', 'blue-500', 'blue-600'], // 3-color gradient
      privileges: []
    },
    {
      icon: 'ThumbsUp',
      name: 'Templates Approval (M&EO)',
      description: 'Review and attend to templates by M&EOs',
      route: '/templates/reports',
      colors: ['blue-400', 'blue-500', 'blue-600'], // 3-color gradient
      privileges: []
    },
    {
      icon: 'ThumbsUp',
      name: 'Templates Approval (M&E Manager)',
      description: 'Approval of templates by M&EO Manager',
      route: '/templates/reports',
      colors: ['blue-400', 'blue-500', 'blue-600'], // 3-color gradient
      privileges: []
    },
    {
      icon: 'ThumbsUp',
      name: 'Templates Approval (Lead)',
      description: 'Approval of templates by M&E Lead',
      route: '/templates/reports',
      colors: ['blue-400', 'blue-500', 'blue-600'], // 3-color gradient
      privileges: []
    },
    {
      icon: 'Download',
      name: 'Export Templates',
      description: 'Export template configurations',
      route: '/templates/export',
      colors: ['from-cyan-400', 'to-blue-500'], // 2-color gradient
      privileges: ['can_download_templates']
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
          icon="Files"
          title="Template Management"
          description="Manage and configure various templates"
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