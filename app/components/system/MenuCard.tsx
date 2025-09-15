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
  colors, // optional colors array
  border = true // default true for faint cyan border
}) => {
  const [isHovered, setIsHovered] = useState<boolean>(false);

  const IconComponent = (LucideIcons[icon] as IconComponent) || (LucideIcons.HelpCircle as IconComponent);

  const handleClick = (): void => {
    if (onClick) onClick();
  };

  // Default gradient if no colors provided
  const gradientColors = colors && colors.length > 0 
    ? colors 
    : ['from-cyan-400', 'to-blue-500'];

  // Gradient background style
  const getGradientStyle = (): React.CSSProperties => {
    if (gradientColors.length === 3) {
      return {
        background: `linear-gradient(to bottom right, var(--${gradientColors[0].replace('from-', '')}), var(--${gradientColors[1].replace('via-', '')}), var(--${gradientColors[2].replace('to-', '')}))`
      };
    } else {
      return {
        background: `linear-gradient(to bottom right, var(--${gradientColors[0].replace('from-', '')}), var(--${gradientColors[1].replace('to-', '')}))`
      };
    }
  };

  return (
    <div
      className={`
        relative overflow-hidden rounded-md shadow-sm cursor-pointer
        transition-all duration-300 ease-in-out transform
        ${isHovered ? 'scale-105 shadow-lg' : ''}
        ${border ? 'border border-cyan-200' : ''}
      `}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      onClick={handleClick}
      style={getGradientStyle()}
    >
      {/* Blur overlay on hover only */}
      {isHovered && (
        <div className="absolute inset-0 backdrop-blur-sm transition-all duration-300 pointer-events-none" />
      )}

      <div className="relative z-10 p-6 flex flex-col items-center text-center space-y-3">
        {/* Icon */}
        <div className="transition-all duration-300">
          <IconComponent size={36} />
        </div>

        {/* Name */}
        <h3 className="font-semibold text-lg text-cyan-600 transition-colors duration-300">
          {name}
        </h3>

        {/* Description */}
        {description && (
          <p className="text-[0.7rem] text-gray-400 transition-colors duration-300">
            {description}
          </p>
        )}
      </div>
    </div>
  );
};

export default MenuCard;
