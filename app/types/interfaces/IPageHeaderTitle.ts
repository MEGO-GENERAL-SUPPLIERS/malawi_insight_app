// interfaces/IPageHeaderTitle.ts

import { type LucideIconName } from './ILucideIconTypes';

export interface IPageHeaderTitleProps {
  icon?: LucideIconName;
  title: string;
  description?: string;
  alignment?: 'left' | 'center' | 'right';
  iconSize?: number;
  className?: string;
}