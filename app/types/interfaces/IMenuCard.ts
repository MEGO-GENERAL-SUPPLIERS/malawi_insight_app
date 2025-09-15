// interfaces/menuCardInterface.ts

import { type LucideIconName } from '~/types/interfaces/ILucideIconTypes';

export interface IMenuCard {
  icon: LucideIconName;
  name: string;
  description?: string;
  route: string;
  colors: [string, string] | [string, string, string]; // Support 2 or 3 colors
  border?: boolean;
  privileges: string[]; // Array of required privileges
}

export interface IMenuCardProps {
  icon: LucideIconName;
  name: string;
  description?: string;
  onClick?: () => void;
  colors?: [string, string] | [string, string, string]; // Support 2 or 3 colors
  border?: boolean;
}

export interface IMenuCardGridProps {
  cards: IMenuCard[];
  userPrivileges?: string[];
  onCardClick: (route: string) => void;
}