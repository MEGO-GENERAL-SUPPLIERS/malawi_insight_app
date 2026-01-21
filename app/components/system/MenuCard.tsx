// components/system/MenuCard.tsx
import React, { useState } from 'react';
import * as LucideIcons from 'lucide-react';
import { type IMenuCardProps } from '~/types/interfaces/IMenuCard';
import { type IconComponent } from '~/types/interfaces/ILucideIconTypes';

const MenuCard: React.FC<IMenuCardProps> = ({ 
  icon, 
  name, 
  description, 
  onClick,
  gradientClasses, // Array of gradient classes
  border = true,
  textColor = 'text-cyan-600' // Allow customization of text color
}) => {
  const [isHovered, setIsHovered] = useState<boolean>(false);

  const IconComponent = (LucideIcons[icon] as IconComponent) || (LucideIcons.HelpCircle as IconComponent);

  const handleClick = (): void => {
    if (onClick) onClick();
  };

  // Build gradient class string from array
  const buildGradientClass = (): string => {
    if (!gradientClasses || gradientClasses.length === 0) {
      return 'bg-gradient-to-br from-gray-50 to-gray-50';
    }

    // Check if first element contains 'bg-gradient-to-'
    const firstItem = gradientClasses[0];
    const hasBgGradient = firstItem.startsWith('bg-gradient-to-');

    if (hasBgGradient) {
      // First element is the full bg-gradient directive, rest are colors
      return gradientClasses.join(' ');
    } else {
      // No bg-gradient directive, add default and join all color classes
      return `bg-gradient-to-br ${gradientClasses.join(' ')}`;
    }
  };

  const bgGradient = buildGradientClass();

  // Determine text color classes
  const getTextColorClass = (): string => {
    if (textColor === 'white') return 'text-white';
    if (textColor === 'black') return 'text-gray-900';
    return textColor; // Allow custom class
  };

  const textColorClass = getTextColorClass();

  return (
    <div
      className={`
        relative overflow-hidden rounded-md shadow-sm cursor-pointer
        transition-all duration-300 ease-in-out transform
        ${isHovered ? 'scale-105 shadow-lg' : ''}
        ${border ? 'border-2 border-cyan-400' : ''}
        ${bgGradient}
      `}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      onClick={handleClick}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          handleClick();
        }
      }}
    >
      {/* Blur overlay on hover */}
      <div 
        className={`
          absolute inset-0 backdrop-blur-sm 
          transition-opacity duration-300 pointer-events-none
          ${isHovered ? 'opacity-100' : 'opacity-0'}
        `} 
      />

      <div className="relative z-10 p-6 flex flex-col items-center text-center space-y-3">
        {/* Icon */}
        <div className={`transition-all duration-300 ${isHovered ? 'scale-110' : ''}`}>
          <IconComponent 
            size={36} 
            className={`${textColorClass} drop-shadow-sm`}
            aria-hidden="true"
          />
        </div>

        {/* Name */}
        <h3 className={`font-semibold text-lg ${textColorClass} drop-shadow-xs transition-colors duration-300`}>
          {name}
        </h3>

        {/* Description */}
        {description && (
          <p className={`text-sm ${textColorClass === 'text-white' ? 'text-white/90' : 'text-gray-400'} transition-colors duration-300`}>
            {description}
          </p>
        )}
      </div>
    </div>
  );
};

export default MenuCard;