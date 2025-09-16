import React, { type ReactNode } from "react";
import { Navigate } from "react-router-dom";
import { localStorageUtils } from "~/utils/localStorageUtils";

interface ProtectedRouteProps {
  children: ReactNode;
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children }) => {
  const storage = localStorageUtils.ensureLocalAppStructure();
  const user = storage.user;
  const api = storage.api;

  const isAuthenticated =
    !!user?.id &&
    !!user?.person_id &&
    Array.isArray(user?.roles) &&
    user.roles.length > 0 &&
    !!api?.token &&
    user.logged_in === true &&
    !!user.last_login;

  return isAuthenticated ? <>{children}</> : <Navigate to="/" replace />;
};

export default ProtectedRoute;
