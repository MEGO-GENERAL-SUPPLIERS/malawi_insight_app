import React from "react";
import { Navigate } from "react-router-dom";
import { useAuth } from "~/hooks/AuthProvider";
import { localStorageUtils } from "~/utils/localStorageUtils";

const ProtectedRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { isAuthenticated, loading } = useAuth();

  if (loading) return null; // or spinner

  const lStorage = localStorageUtils.ensureLocalAppStructure();

  return (isAuthenticated || lStorage?.user?.logged_in) ? <>{children}</> : <Navigate to="/" replace />;
};

export default ProtectedRoute;