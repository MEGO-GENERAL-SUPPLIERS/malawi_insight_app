export interface IUser{
  id?: string | number | undefined;
  person_id?: string;
  first_name?: string;
  other_names?: string; 
  last_name?: string; 
  full_name?: string;
  gender?: string; 
  date_of_birth?: string; 
  national_id?: string;
  status?: string;
  inactivity_duration?: number; //min
  auto_logout_count?: number; //seconds
  roles?: string[];
  privileges?: string[];
  logged_in?: boolean;
  last_login?: string;
}

export interface IDevice {
  brand: string;
  lati: string;
  long: string;
  name: string;
  serial_number: string;
  token: string;
  persistent: boolean;
  location_id: string;
  location_name: string;
  type: string;
}

export interface IApi{
  protocol?: string | undefined;
  server?: string | undefined;
  port?: string;
  base?: string;
  timeout?: number | null;
  token?: string;
  refresh_token?: string;
}

export interface IApp{
  ui: {
    sidebar_show?: string;    // "true" or "false"
    navbar_autohide?: string; // "true" or "false"
    footer_show?: string;     // "true" or "false"
  };
  theme: ITheme;
};


export interface IServer {
  retry?: number;
  available?: boolean;
  database_status?: boolean | "unknown" | "up" | "down";
  last_check?: any; 
  status?: "connected" | "disconnected" | "connecting";
}

export interface INetwork {
  retry?: number;
  check_time?: any;
  internet?: boolean;
  last_latency?: any;
  last_check?: string | null;
  strength?: "offline" | "unknown" | "none" | "weak" | "slow" | "fair" | "average" | "good" | "excellent"; 
}

export interface ITheme {
  theme: 'light' | 'dark';
}

export interface IAppStorage {
  user: IUser;
  device: IDevice;
  api: IApi;
  server: IServer;
  network: INetwork;
  app: IApp;
}