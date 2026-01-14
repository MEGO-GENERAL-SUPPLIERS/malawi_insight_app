// localStorageUtils.ts
import { type IAppStorage } from "~/types/interfaces/ILocalStorageInterfaces";
import { type IUser } from "~/types/interfaces/ILocalStorageInterfaces";

// Application main name
export const APP_NAME = "malawi_insight";

// Local storage sub keys
export const LOCAL_STORAGE_KEYS = {
  USER: "user",
  DEVICE: "device",
  API: "api",
  SERVER: "server",
  NETWORK: "network",
  // APP_NAME: APP_NAME,
  APP: "app"
};

// Default structure for the app object
export const DEFAULT_APP_STRUCTURE: IAppStorage = {
  user: {
    id: "",
    person_id: "",
    first_name: "",
    other_names: "",
    last_name: "",
    full_name: "",
    gender: "",
    date_of_birth: "",
    national_id: "",
    status: "",
    inactivity_duration: 30, // minutes
    auto_logout_count: 30,   // seconds
    roles: [],
    privileges: [],
    locations: null,
    logged_in: false,
    last_login: ""
  },
  device: {
    brand: "",
    lati: "",
    location_id: "",
    location_name: "",
    long: "",
    name: "",
    persistent: false,
    serial_number: "",
    token: "emmanuel.nyondo.admin",
    type: "",
  },
  api: {
    protocol: "http",
    server: "localhost",
    port: "5203",
    base: "api/v1",
    timeout: 30000,
    token: "",
    refresh_token: ""
  },
  app: {
    ui: {
      sidebar_show: "",
      navbar_autohide: "",
      footer_show: ""
    },
    theme: {
      theme: "light"
    }
  },
  server: {
    retry: 2,
    available: false,
    database_status: "unknown", // e.g. "up", "down"
    last_check: null,           // timestamp of last check
    status: "disconnected",     // "connected" | "connecting" | "disconnected"
  },
  network: {
    retry: 2,
    last_latency: null,
    last_check: null,
    check_time: 15000, // ms between checks
    strength: "unknown", // "none" | "weak" | "fair" | "good" | "excellent"
  }
};

// ================= Utility Functions =================
export const localStorageUtils = {
  deepMerge(target: any, source: any): any {
    const result = { ...target };
    for (let key in source) {
      if (source.hasOwnProperty(key)) {
        if (
          typeof source[key] === "object" &&
          source[key] !== null &&
          !Array.isArray(source[key]) &&
          typeof result[key] === "object" &&
          result[key] !== null
        ) {
          result[key] = localStorageUtils.deepMerge(result[key], source[key]);
        } else {
          result[key] = source[key]; // overwrite with new value
        }
      }
    }
    return result;
  },

  getLocalStorageItem(key: string) {
    const item = localStorage.getItem(key);
    return item ? JSON.parse(item) : null;
  },

  /** Overwrite or add new values for the APP_NAME object */
  addOrUpdateLocalStorageObject(newValues: Partial<IAppStorage>) {
    const existing: IAppStorage = localStorageUtils.ensureLocalAppStructure();
    const merged = localStorageUtils.deepMerge(existing, newValues);
    localStorage.setItem(APP_NAME, JSON.stringify(merged));
    return merged;
  },

  /** Ensure APP_NAME object exists and fill missing keys with default structure */
  ensureLocalAppStructure(): IAppStorage {
    if (typeof window === "undefined") {
      // Running on server, return default structure
      return DEFAULT_APP_STRUCTURE;
    }

    // Try to read from localStorage
    const existingData = localStorageUtils.getLocalStorageItem(APP_NAME);

    if (!existingData) {
      // Key does not exist, create it
      localStorage.setItem(APP_NAME, JSON.stringify(DEFAULT_APP_STRUCTURE));
      return DEFAULT_APP_STRUCTURE;
    }

    // Merge existing data with default to ensure missing keys are added
    const mergedData: IAppStorage = localStorageUtils.deepMerge(DEFAULT_APP_STRUCTURE, existingData);

    // -------------------- THEME CHECK --------------------
    if (!mergedData.app?.theme?.theme) {
      const prefersDark = window.matchMedia?.("(prefers-color-scheme: dark)").matches;
      
      // Ensure theme object exists
      mergedData.app.theme = mergedData.app.theme || { theme: "light" };
      
      // Set theme based on preference
      mergedData.app.theme.theme = prefersDark ? "dark" : "light";
    }
    // -----------------------------------------------------

    // Persist merged result
    localStorage.setItem(APP_NAME, JSON.stringify(mergedData));

    return mergedData;
  },


  /**
   * Get the stored user from localStorage with proper typing
   * Returns IUser | null if user doesn't exist or is invalid
   */
  getStoredUser(): IUser | null {
  
    if (typeof window === "undefined") {
      return null;
    }

    try {
      const appData = localStorageUtils.ensureLocalAppStructure();
      const userData = appData?.user;

      // Check if we have a valid user object with required IUser fields
      if (userData && 
          userData.id !== undefined && 
          userData.id !== null && 
          userData.first_name && 
          userData.last_name) {
        
        // Convert id to number if it's stored as string in localStorage
        const user: IUser = {
          ...userData,
          id: typeof userData.id === 'string' ? parseInt(userData.id, 10) : userData.id,
          // Ensure arrays are properly initialized
          roles: userData.roles || [],
          locations: userData.locations || {
            countries: [],
            provinces: [],
            districts: [],
            facilities: []
          },
          custom_user_privileges: userData.custom_user_privileges || [],
          contacts: userData.contacts || []
        };

        return user;
      }

      console.warn('Invalid or incomplete user data in localStorage');
      return null;
    } catch (error) {
      console.error('Error reading user from localStorage:', error);
      return null;
    }
  },


  /**
   * Type guard to check if an object is a valid IUser
   */
  isValidUser(user: any): user is IUser {
    return user && 
          typeof user.id === 'number' && 
          typeof user.first_name === 'string' && 
          typeof user.last_name === 'string' && 
          typeof user.username === 'string' &&
          Array.isArray(user.roles);
  },


  /**
   * Get user facilities from localStorage
   * Returns array of facilities or empty array if none found
   */
  getUserFacilities(): Array<{ id: number; name: string; code?: string }>{
    const user = this.getStoredUser();
    return user?.locations?.facilities || [];
  },


  /**
   * Check if user is logged in and has valid session
  */
  isUserLoggedIn(): boolean {
    const user = this.getStoredUser();
    return !!(user && user.id && user.status !== 'inactive');
  },


  /**
   * Update user data in localStorage
   */
  updateStoredUser(userUpdates: Partial<IUser>): IUser | null{
    try {
      const currentUser = this.getStoredUser();
      if (!currentUser) {
        console.warn('No user found to update');
        return null;
      }

      const updatedUser = { ...currentUser, ...userUpdates };
      localStorageUtils.addOrUpdateLocalStorageObject({ user: updatedUser });
      
      return updatedUser;
    } catch (error) {
      console.error('Error updating user in localStorage:', error);
      return null;
    }
  },


  /**
   * Clear user data from localStorage (logout)
  */
  clearStoredUser(): void {
    try {
      localStorageUtils.addOrUpdateLocalStorageObject({
        user: {
          ...DEFAULT_APP_STRUCTURE.user,
          logged_in: false
        }
      });
    } catch (error) {
      console.error('Error clearing user from localStorage:', error);
    }
  },


  /**
   * Get the stored API configuration from localStorage with proper typing
   * Returns the api object or default if missing/invalid
  */
  getStoredApi(): typeof DEFAULT_APP_STRUCTURE.api {
    try {
      const appData = localStorageUtils.ensureLocalAppStructure();
      return appData?.api || DEFAULT_APP_STRUCTURE.api;
    } catch (error) {
      console.error('Error reading API config from localStorage:', error);
      return DEFAULT_APP_STRUCTURE.api;
    }
  },


  /**
   * Clear only the sensitive/token fields in the API section (e.g., on logout)
   * Preserves protocol, server, port, base, timeout for reuse
  */
  clearStoredApiTokens(): void {
    try {
      const currentApi = localStorageUtils.getStoredApi();
      const sanitizedApi = {
        ...currentApi,
        token: "",
        refresh_token: ""
      };
      localStorageUtils.addOrUpdateLocalStorageObject({ api: sanitizedApi });
    } catch (error) {
      console.error('Error clearing API tokens from localStorage:', error);
    }
  }
};
