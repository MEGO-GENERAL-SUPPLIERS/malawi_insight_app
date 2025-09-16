// utils/authUtils.ts
import { localStorageUtils } from "~/utils/localStorageUtils";
import { isTokenValid } from "~/utils/jwtUtils";

export const isAuthenticated = (): boolean => {
  const storage = localStorageUtils.ensureLocalAppStructure();
  const user = storage.user;
  const token = storage.api.token;

  return !!user?.id &&
         !!user?.person_id &&
         Array.isArray(user?.roles) &&
         user.roles.length > 0 &&
         !!token &&
         user.logged_in === true &&
         !!user.last_login &&
         isTokenValid(token);
};