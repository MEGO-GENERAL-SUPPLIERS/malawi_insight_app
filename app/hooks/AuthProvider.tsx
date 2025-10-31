// hooks/AuthProvider.tsx
import React, { createContext, useContext, useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { localStorageUtils } from "~/utils/localStorageUtils";
import { isTokenValid } from "~/utils/jwtUtils";

interface AuthContextType {
  isAuthenticated: boolean;
  loading: boolean;
  setIsAuthenticated: (value: boolean) => void;
  logout: () => void;
  checkAuth: () => boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const navigate = useNavigate();
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [loading, setLoading] = useState(true);

  const checkAuth = useCallback(() => {
    const storage = localStorageUtils.ensureLocalAppStructure();
    const user = storage.user;
    const token = storage.api.token;

    const valid =
      !!user?.id &&
      !!user?.person_id &&
      Array.isArray(user?.roles) &&
      user.roles.length > 0 &&
      !!token &&
      user.logged_in === true &&
      !!user.last_login &&
      isTokenValid(token);

    setIsAuthenticated(valid);
    setLoading(false);
    return valid;
  }, []);

  const logout = useCallback(() => {
    localStorageUtils.addOrUpdateLocalStorageObject({
      user: { id: "", person_id: "", roles: [], privileges: [], logged_in: false, last_login: "", locations: null },
      api: { token: "", refresh_token: "" },
    });
    setIsAuthenticated(false);
    navigate("/", { replace: true });
  }, [navigate]);

  useEffect(() => {
    checkAuth();
  }, [checkAuth]);

  return (
    <AuthContext.Provider value={{ isAuthenticated, loading, setIsAuthenticated, logout, checkAuth }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error("useAuth must be used within AuthProvider");
  return context;
};
