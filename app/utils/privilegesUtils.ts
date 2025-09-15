// utils/privilegesUtils.ts

import { localStorageUtils, APP_NAME } from './localStorageUtils';
import { type IAppStorage } from '../types/interfaces/ILocalStorageInterfaces';

export const privilegesUtils = {
  /**
   * Get user privileges from localStorage
   * @returns Array of user privileges in lowercase
   */
  getUserPrivileges(): string[] {
    try {
      const appData: IAppStorage = localStorageUtils.ensureLocalAppStructure();
      const privileges = appData.user.privileges || [];
      
      // Convert to lowercase for consistent comparison
      return privileges.map(privilege => privilege.toLowerCase());
    } catch (error) {
      console.error('Error getting user privileges:', error);
      return [];
    }
  },

  /**
   * Check if user has any of the required privileges
   * @param requiredPrivileges Array of required privileges
   * @param userPrivileges Optional user privileges array (fetched automatically if not provided)
   * @returns boolean indicating if user has access
   */
  hasAnyPrivilege(requiredPrivileges: string[], userPrivileges?: string[]): boolean {
    // If no privileges required, allow access
    if (!requiredPrivileges || requiredPrivileges.length === 0) {
      return true;
    }

    // Get user privileges if not provided
    const privileges = userPrivileges || privilegesUtils.getUserPrivileges();
    
    // Convert required privileges to lowercase for comparison
    const normalizedRequired = requiredPrivileges.map(priv => priv.toLowerCase());
    
    // Check if user has any of the required privileges
    return normalizedRequired.some(required => privileges.includes(required));
  },

  /**
   * Check if user has all required privileges
   * @param requiredPrivileges Array of required privileges
   * @param userPrivileges Optional user privileges array (fetched automatically if not provided)
   * @returns boolean indicating if user has all required privileges
   */
  hasAllPrivileges(requiredPrivileges: string[], userPrivileges?: string[]): boolean {
    // If no privileges required, allow access
    if (!requiredPrivileges || requiredPrivileges.length === 0) {
      return true;
    }

    // Get user privileges if not provided
    const privileges = userPrivileges || privilegesUtils.getUserPrivileges();
    
    // Convert required privileges to lowercase for comparison
    const normalizedRequired = requiredPrivileges.map(priv => priv.toLowerCase());
    
    // Check if user has all required privileges
    return normalizedRequired.every(required => privileges.includes(required));
  },

  /**
   * Filter array of items based on privilege requirements
   * @param items Array of items with privileges property
   * @param userPrivileges Optional user privileges array
   * @returns Filtered array of items user has access to
   */
  filterByPrivileges<T extends { privileges: string[] }>(
    items: T[], 
    userPrivileges?: string[]
  ): T[] {
    const privileges = userPrivileges || privilegesUtils.getUserPrivileges();
    
    return items.filter(item => 
      privilegesUtils.hasAnyPrivilege(item.privileges, privileges)
    );
  },

  /**
   * Update user privileges in localStorage
   * @param newPrivileges Array of new privileges
   */
  updateUserPrivileges(newPrivileges: string[]): void {
    try {
      localStorageUtils.addOrUpdateLocalStorageObject({
        user: {
          privileges: newPrivileges
        } as any
      });
    } catch (error) {
      console.error('Error updating user privileges:', error);
    }
  },

  /**
   * Debug function to log current user privileges
   */
  debugPrivileges(): void {
    const privileges = privilegesUtils.getUserPrivileges();
    console.log('Current user privileges:', privileges);
  }
};