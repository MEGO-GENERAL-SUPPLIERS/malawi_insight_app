// services/healthCheckService.ts
import ApiClient from "./apiClient";
import type { IApiResponse } from "~/types/interfaces/IApiResponse";

export interface HealthCheckData {
  serverAvailable: boolean;
  databaseStatus: boolean;
}

const apiClient = new ApiClient();

export const checkHealthAsync = 
  async (): Promise<IApiResponse<HealthCheckData>> => {
    try {
      const response = await apiClient.get<HealthCheckData>("/health_check");
      console.log('%capp/services/healthCheckService.ts:24 object', 'color: #007acc;', response);
      return response;
    } catch (error: any) {
      return {
        success: false,
        message: error.message ?? "Failed health check",
        data: { serverAvailable: false, databaseStatus: false }
      };
    }
  };