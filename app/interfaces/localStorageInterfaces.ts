declare interface IUser{
  id: string;
  role: string;
  inactivity_duration: number;
  auto_logout_count: number;
}

declare interface IDevice {
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

declare interface IApi{
  protocol: string;
    server: string;
    port: string;
    base: string;
    token: string;
    refresh_token: string;
}

declare interface IServer {
  retry: number;
}

declare interface INetwork {
  retry: number;
}

export interface IAppStorage {
  user: IUser;
  device: IDevice;
  api: IApi;
  server: IServer;
  network: INetwork;
}