// interfaces/lucideIconTypes.ts

import * as LucideIcons from 'lucide-react';

// Type for Lucide icon names
export type LucideIconName = keyof typeof LucideIcons;

// Type for icon component
export type IconComponent = React.ComponentType<{ size?: number; className?: string }>;