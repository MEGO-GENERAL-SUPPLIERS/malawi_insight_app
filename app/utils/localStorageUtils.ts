// localStorageUtils.ts
import { type IAppStorage } from "~/interfaces/localStorageInterfaces";

// Application main name
export const APP_NAME = "malawi_insight";

// Local storage sub keys
export const LOCAL_STORAGE_KEYS = {
  USER: "user",
  DEVICE: "device",
  API: "api",
  SERVER: "server",
  NETWORK: "network",
  APP: APP_NAME,
};

// Default structure for the app object
export const DEFAULT_APP_STRUCTURE: IAppStorage = {
  user: {
    id: "",
    role: "",
    inactivity_duration: 30, // minutes
    auto_logout_count: 30,   // seconds
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
    protocol: "https",
    server: "localhost",
    port: "3000",
    base: "api/v1",
    token: "",
    refresh_token: ""
  },
  server: { retry: 2 },
  network: { retry: 2 },
};

// ================= Utility Functions =================
export const localStorageUtils = {
  /** Deep merge source into target without overwriting existing keys */
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
        } else if (result[key] === undefined) {
          // Only add missing keys
          result[key] = source[key];
        }
      }
    }
    return result;
  },

  /** Create a localStorage key if it does not exist */
  createLocalStorageItem(key: string, value: any) {
    if (!localStorage.getItem(key)) {
      localStorage.setItem(key, JSON.stringify(value));
    }
    return localStorage.getItem(key);
  },

  /** Get parsed item from localStorage */
  getLocalStorageItem(key: string) {
    const item = localStorage.getItem(key);
    return item ? JSON.parse(item) : null;
  },

  /** Add or update an object in localStorage */
  addOrUpdateLocalStorageObject(key: string, newValues: any) {
    let existingObject = localStorageUtils.getLocalStorageItem(key) || {};
    const merged = localStorageUtils.deepMerge(newValues, existingObject);
    localStorage.setItem(key, JSON.stringify(merged));
    return merged;
  },

  /** Update a specific property in nested object */
  updateNestedValue(
    key: string,
    topLevelKey: string,
    childKey: string,
    newValue: any
  ) {
    let data = localStorageUtils.getLocalStorageItem(key) || {};
    if (data[topLevelKey] && data[topLevelKey].hasOwnProperty(childKey)) {
      data[topLevelKey][childKey] = newValue;
      localStorage.setItem(key, JSON.stringify(data));
      console.log(`Updated ${topLevelKey}.${childKey} = ${newValue}`);
    } else {
      console.error(`Invalid key combination: ${topLevelKey}.${childKey}`);
    }
  },

  /** Ensure the main app object exists and fill missing defaults */
  ensureLocalAppStructure(customDefault = DEFAULT_APP_STRUCTURE) {
    let existingData = localStorageUtils.getLocalStorageItem(APP_NAME) || {};
    const mergedData = localStorageUtils.deepMerge(customDefault, existingData);
    localStorage.setItem(APP_NAME, JSON.stringify(mergedData));
    return mergedData;
  },
};
