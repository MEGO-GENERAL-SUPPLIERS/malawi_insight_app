// components/custom-elements/PageHeaderTitle.tsx

import React, { Fragment } from 'react';
import * as LucideIcons from 'lucide-react';
import { type IPageHeaderTitleProps } from '~/types/interfaces/IPageHeaderTitle';
import { type IconComponent } from '~/types/interfaces/ILucideIconTypes';

const PageHeaderTitle: React.FC<IPageHeaderTitleProps> = ({
  icon,
  iconColor = 'text-slate-700',
  iconSize: propIconSize = 32,
  title,
  titleColor = 'text-cyan-700',
  titleSize = 'text-xl',
  description,
  descriptionColor = 'text-gray-600',
  descriptionSize = 'text-sm',
  alignment = 'left',
  className = '',
  actions
}) => {
  const IconComponent = icon
    ? (LucideIcons[icon] as IconComponent) || (LucideIcons.HelpCircle as IconComponent)
    : null;

  const textAlignClass =
    alignment === 'left' ? 'text-start' :
    alignment === 'center' ? 'text-center' :
    'text-end';

  const renderActions = () => {
    if (!actions) return null;
    return Array.isArray(actions) ? actions : [actions];
  };

  return (
    <div className={`mb-8 ${textAlignClass} ${className} pb-3 border-b border-cyan-600`}>
      {/* Title row */}
      <div className="flex items-center gap-3 mb-2">
        {IconComponent && (
          <span className={iconColor}>
            <IconComponent size={propIconSize} />
          </span>
        )}
        <h1 className={`${titleSize} font-bold ${titleColor}`}>
          {title}
        </h1>
      </div>

      {/* Description + Actions row (same line) */}
      {(description || actions) && (
        <div className="flex items-center justify-between">
          {description && (
            <p className={`${descriptionSize} ${descriptionColor} flex-1`}>
              {description}
            </p>
          )}

          {/* If no description, actions still appear right-aligned */}
          {!description && <div className="flex-1"></div>}

          {actions && (
            <div className="flex items-center gap-2 ms-4 flex-shrink-0">
              {renderActions()?.map((action, index) => (
                <Fragment key={index}>{action}</Fragment>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default PageHeaderTitle;