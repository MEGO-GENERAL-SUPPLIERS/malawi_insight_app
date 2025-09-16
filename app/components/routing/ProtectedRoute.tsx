import React, { type ReactNode } from "react";
import { Navigate } from "react-router-dom";
import { useAuth } from "~/hooks/useAuth";
interface ProtectedRouteProps {
  children: ReactNode;
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children }) => {
  const { isAuthenticated, loading } = useAuth(); 

  if (loading) return null;

  return isAuthenticated ? <>{children}</> : <Navigate to="/" replace />;
};

export default ProtectedRoute;
