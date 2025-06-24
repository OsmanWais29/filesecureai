
import React from 'react';

export interface NavItem {
  to: string;
  page: React.ComponentType;
}

// Empty nav items for now - can be populated later if needed
export const navItems: NavItem[] = [];
