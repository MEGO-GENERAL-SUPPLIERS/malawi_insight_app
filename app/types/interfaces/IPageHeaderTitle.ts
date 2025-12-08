// interfaces/IPageHeaderTitle.ts

import { type LucideIconName } from './ILucideIconTypes';
import type { ReactNode } from 'react';

export interface IPageHeaderTitleProps {
  icon?: LucideIconName;
  title: string;
  titleColor?: string;
  titleSize?: string;
  description?: string;
  descriptionColor?: string;
  descriptionSize?: string;
  alignment?: 'left' | 'center' | 'right';
  iconSize?: number;
  iconColor?: string;
  className?: string;
  actions?: ReactNode | ReactNode[];
}