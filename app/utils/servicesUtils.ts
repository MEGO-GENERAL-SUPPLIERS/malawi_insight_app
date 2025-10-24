// utils/servicesUtils.ts
import { type IApiResponse } from "~/types/interfaces/IApiResponse";

/**
 * Formats the API response error messages.
 * If the response contains a status code in metadata, it prepends it to the message.
 * 
 * @param response The API response to format
 * @returns Formatted API response
 */
export function formatError<T>(response: IApiResponse<T>): IApiResponse<T> {
  if (!response.success && response.metadata?.status) {
    return {
      ...response,
      message: `Error ${response.metadata.status} : ${response.message}`,
    };
  }
  return response;
}
