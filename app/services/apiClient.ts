// apiClient.ts
import axios, { type AxiosInstance, type AxiosRequestConfig } from "axios";
import { type IApiResponse } from "~/types/interfaces/IApiResponse";
import { localStorageUtils, DEFAULT_APP_STRUCTURE } from "~/utils/localStorageUtils";

export default class ApiClient {
  private axiosInstance: AxiosInstance;

  constructor() {
    const appStorage = localStorageUtils.ensureLocalAppStructure();
    const apiConfig = appStorage.api || DEFAULT_APP_STRUCTURE.api;

    // Build baseURL: protocol + server + optional port + optional base path
    let baseURL = `${apiConfig.protocol}://${apiConfig.server}`;
    if (apiConfig.port && apiConfig.port !== "80" && apiConfig.port !== "443") {
      baseURL += `:${apiConfig.port}`;
    }
    if (apiConfig.base) {
      baseURL += `/${apiConfig.base.replace(/^\/|\/$/g, "")}`; // remove leading/trailing slashes
    }

    this.axiosInstance = axios.create({
      baseURL,
      timeout: apiConfig.timeout || 10000,
      headers: { "Content-Type": "application/json" },
    });

    // Attach token if exists
    if (apiConfig.token) {
      this.axiosInstance.defaults.headers.common["Authorization"] = `Bearer ${apiConfig.token}`;
    }
  }

  private handleSuccess<T>(data: T, message = "Request successful"): IApiResponse<T> {
    return { success: true, message, data };
  }

  private handleError<T>(error: any): IApiResponse<T> {
    let message = "An error occurred";

    if (axios.isAxiosError(error)) {
        if (error.response) {
            message = error.response.data?.message || error.response.statusText;
        } else if (error.request) {
            message = "No response received from server";
        } else {
            message = error.message;
        }
    } else {
        message = String(error);
    }

    // Cast null as T
    return { success: false, message, data: null as unknown as T };
}

  async get<T>(url: string, config?: AxiosRequestConfig): Promise<IApiResponse<T>> {
    try {
      const response = await this.axiosInstance.get<T>(url, config);
      return this.handleSuccess(response.data);
    } catch (error) {
      return this.handleError(error);
    }
  }

  async post<T>(url: string, data?: any, config?: AxiosRequestConfig): Promise<IApiResponse<T>> {
    try {
      const response = await this.axiosInstance.post<T>(url, data, config);
      return this.handleSuccess(response.data);
    } catch (error) {
      return this.handleError(error);
    }
  }

  async put<T>(url: string, data?: any, config?: AxiosRequestConfig): Promise<IApiResponse<T>> {
    try {
      const response = await this.axiosInstance.put<T>(url, data, config);
      return this.handleSuccess(response.data);
    } catch (error) {
      return this.handleError(error);
    }
  }

  async delete<T>(url: string, config?: AxiosRequestConfig): Promise<IApiResponse<T>> {
    try {
      const response = await this.axiosInstance.delete<T>(url, config);
      return this.handleSuccess(response.data);
    } catch (error) {
      return this.handleError(error);
    }
  }
}
