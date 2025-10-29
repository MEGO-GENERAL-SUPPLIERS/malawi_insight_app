// utils/servicesUtils.ts
import { type IApiResponse } from "~/types/interfaces/IApiResponse";

/**
 * Formats and normalizes the API response:
 * - Prepends status code to error messages if available.
 * - Ensures data is always in a consistent array-like format:
 *   - null/undefined/empty → []
 *   - object → [object]
 *   - string → [string]
 *   - array → as-is
 *
 * @param response The API response to format
 * @returns The same IApiResponse<T> with normalized data and formatted message
 */
export function reformatResponse<T>(response: IApiResponse<T>): IApiResponse<T> {
  const { success, metadata, message, data } = response;

  // Format message
  const formattedMessage =
    !success && metadata?.status
      ? `Error ${metadata.status} : ${message}`
      : message;

  // Normalize data
  let normalizedData: any;
  if (Array.isArray(data)) {
    normalizedData = data;
  } else if (data === null || data === undefined || data === "") {
    normalizedData = [];
  } else {
    normalizedData = data; //[data];
  }

  // Return the same structure while keeping the same generic type
  return {
    ...response,
    message: formattedMessage,
    data: normalizedData,
  };
}
