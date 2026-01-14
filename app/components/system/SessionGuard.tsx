import { useEffect, useRef } from "react";  
import { useNavigator } from "~/hooks/useNavigator";
import { ToastAlertComponentController } from "~/components/controllers/ToastAlertComponentController";
import { useAuth } from "~/hooks/useAuth";
import { localStorageUtils } from "~/utils/localStorageUtils";
import { AlertComponentController } from "../controllers/AlertComponentController";

export const SessionGuard = () => {
  const navigator = useNavigator();
  const auth = useAuth();
  const hasLoggedOut = useRef(false);

  useEffect(() => {
    hasLoggedOut.current = false;

    const checkSession = () => {
      try{
        const api = localStorageUtils.getStoredApi();
        const token = api?.token; 
        if(!token){
          handleSessionExpiration();
          return;
        }

        const payload = parseJwt(token);
        const currentTime = Date.now() / 1000;

        if(payload.exp < currentTime){
          handleSessionExpiration();
        }
      } catch(error) {
        console.error("Error checking session:", error);
        handleSessionExpiration();
      }
    };

    const handleSessionExpiration = () => {
      //logout
      hasLoggedOut.current = true;
      localStorageUtils.clearStoredApiTokens();
      // localStorageUtils.clearStoredUser();

      ToastAlertComponentController.show({
        message: `Your session has expired. Pleaser login again.`,
        type: `info`,
        autoHideDuration: 12000
      });

      AlertComponentController.dismiss();
      AlertComponentController.show({
        title: "Session Expired",
        message: "Your session has expired. Please login again to continue.",
        type: "error",
        dismissable: false,
        buttons: [
          {
            label: "Log In Again",
            className: "btn btn-success",
            onClick: () => {
             
              auth.logout();
            }
          }
        ]
      });
    };

    // initial session check
    checkSession();

    const intervalId = setInterval(checkSession, 5 * 60 * 1000); // check every 5 minutes

    return () => { 
      clearInterval(intervalId);
    };
  }, [navigator]);

  return null;
};



const parseJwt = (token: string): { exp: number } => {
  try {
    const base64Url = token.split('.')[1];
    const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
    const jsonPayload = decodeURIComponent(
      atob(base64)
        .split('')
        .map(c => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
        .join('')
    );
    return JSON.parse(jsonPayload);
  } catch (error) {
    throw new Error('Invalid JWT token');
  }
};