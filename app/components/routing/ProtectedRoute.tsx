import React, { type ReactNode } from "react";
import { Navigate } from "react-router-dom";
import { isAuthenticated } from "~/utils/authUtils";

interface ProtectedRouteProps {
  children: ReactNode;
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children }) => {
   return isAuthenticated() ? <>{children}</> : <Navigate to="/" replace />;
};

export default ProtectedRoute;
