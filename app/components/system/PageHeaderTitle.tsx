// components/custom-elements/PageHeaderTitle.tsx

import React from 'react';
import * as LucideIcons from 'lucide-react';
import { type IPageHeaderTitleProps } from '~/types/interfaces/IPageHeaderTitle';
import { type IconComponent } from '~/types/interfaces/ILucideIconTypes';

const PageHeaderTitle: React.FC<IPageHeaderTitleProps> = ({
  icon,
  title,
  description,
  alignment = 'left',
  iconSize = 32,
  className = ''
}) => {
  // Dynamically get the icon component if provided
  const IconComponent = icon 
    ? (LucideIcons[icon] as IconComponent) || (LucideIcons.HelpCircle as IconComponent)
    : null;

  // Determine alignment classes
  const alignmentClasses = {
    left: 'text-start',
    center: 'text-center',
    right: 'text-end'
  };

  const alignmentClass = alignmentClasses[alignment];

  return (
    <div className={`mb-8 ${alignmentClass} ${className} pb-3 border-b border-cyan-600`}>
      <div className="flex items-center gap-3 mb-2">
        {/* Icon */}
        {IconComponent && (
          <div className="text-gray-700">
            <IconComponent size={iconSize} />
          </div>
        )}
        
        {/* Title */}
        <h1 className="text-xl font-bold text-cyan-700">
          {title}
        </h1>
      </div>
      
      {/* Description */}
      {description && (
        <p className="text-gray-600 text-sm">
          {description}
        </p>
      )}
    </div>
  );
};

export default PageHeaderTitle;