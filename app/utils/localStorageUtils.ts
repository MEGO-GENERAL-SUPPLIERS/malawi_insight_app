// localStorageUtils.ts
import { type IAppStorage } from "~/types/interfaces/ILocalStorageInterfaces";

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
  }
};
