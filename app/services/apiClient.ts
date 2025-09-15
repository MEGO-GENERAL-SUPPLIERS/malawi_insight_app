// apiClient.ts
import axios, { type AxiosInstance, type AxiosRequestConfig } from "axios";
import { type IApiResponse } from "~/types/interfaces/IApiResponse";
import { localStorageUtils, DEFAULT_APP_STRUCTURE } from "~/utils/localStorageUtils";

export default class ApiClient {
  private axiosInstance: AxiosInstance;

  constructor() {
    const appStorage = localStorageUtils.ensureLocalAppStructure();
    const apiConfig = appStorage.api || DEFAULT_APP_STRUCTURE.api;

    let baseURL = `${apiConfig.protocol}://${apiConfig.server}`;
    if (apiConfig.port && apiConfig.port !== "80" && apiConfig.port !== "443") {
      baseURL += `:${apiConfig.port}`;
    }
    if (apiConfig.base) {
      baseURL += `/${apiConfig.base.replace(/^\/|\/$/g, "")}`;
    }

    this.axiosInstance = axios.create({
      baseURL,
      timeout: apiConfig.timeout || 10000,
      headers: { "Content-Type": "application/json" },
    });

    if (apiConfig.token) {
      this.axiosInstance.defaults.headers.common["Authorization"] = `Bearer ${apiConfig.token}`;
    }
  }

  private isIApiResponse<T>(obj: any): obj is IApiResponse<T> {
    return obj && typeof obj === "object" && "success" in obj && "message" in obj && "data" in obj;
  }

  private handleSuccess<T>(data: any, message = "Request successful"): IApiResponse<T> {
    // If response is already IApiResponse, return it as is
    if (this.isIApiResponse<T>(data)) {
      return data;
    }
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

    return { success: false, message, data: null as unknown as T };
  }

  async get<T>(url: string, config?: AxiosRequestConfig): Promise<IApiResponse<T>> {
    try {
      const response = await this.axiosInstance.get(url, config);
      return this.handleSuccess<T>(response.data);
    } catch (error) {
      return this.handleError<T>(error);
    }
  }

  async post<T>(url: string, data?: any, config?: AxiosRequestConfig): Promise<IApiResponse<T>> {
    try {
      const response = await this.axiosInstance.post(url, data, config);
      return this.handleSuccess<T>(response.data);
    } catch (error) {
      return this.handleError<T>(error);
    }
  }

  async put<T>(url: string, data?: any, config?: AxiosRequestConfig): Promise<IApiResponse<T>> {
    try {
      const response = await this.axiosInstance.put(url, data, config);
      return this.handleSuccess<T>(response.data);
    } catch (error) {
      return this.handleError<T>(error);
    }
  }

  async delete<T>(url: string, config?: AxiosRequestConfig): Promise<IApiResponse<T>> {
    try {
      const response = await this.axiosInstance.delete(url, config);
      return this.handleSuccess<T>(response.data);
    } catch (error) {
      return this.handleError<T>(error);
    }
  }
}
