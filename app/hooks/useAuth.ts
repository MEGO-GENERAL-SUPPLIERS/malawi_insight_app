import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { localStorageUtils } from "~/utils/localStorageUtils";
import { isTokenValid } from "~/utils/jwtUtils";

export const useAuth = () => {
  const navigate = useNavigate();
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [loading, setLoading] = useState(true); // 🔹 new

  const checkAuth = () => {
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
    setLoading(false); // 🔹 mark check as done
    return valid;
  };

  const logout = () => {
    localStorageUtils.addOrUpdateLocalStorageObject({
      user: { id: "", person_id: "", roles: [], privileges: [], logged_in: false, last_login: "" },
      api: { token: "", refresh_token: "" },
    });
    setIsAuthenticated(false);
    navigate("/", { replace: true });
  };

  useEffect(() => {
    checkAuth();
  }, []);

  return { isAuthenticated, checkAuth, logout, loading, setIsAuthenticated }; // 🔹 expose loading
};
