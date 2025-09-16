// utils/jwtUtils.ts
import { jwtDecode } from "jwt-decode";

interface JwtPayload {
  exp: number; // expiration timestamp in seconds
  iat?: number;
  [key: string]: any;
}

/**
 * Returns true if the JWT token is valid (not expired)
 */
export const isTokenValid = (token: string): boolean => {
  if (!token) return false;

  try {
    const decoded = jwtDecode<JwtPayload>(token);
    const currentTime = Math.floor(Date.now() / 1000); // seconds
    return decoded.exp > currentTime;
  } catch {
    return false;
  }
};

/**
 * Returns decoded payload or null
 */
export const decodeToken = (token: string): JwtPayload | null => {
  if (!token) return null;
  try {
    return jwtDecode<JwtPayload>(token);
  } catch {
    return null;
  }
};
