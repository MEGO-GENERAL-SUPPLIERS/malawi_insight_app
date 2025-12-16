import React, { useState, useEffect } from "react";
import { Eye, EyeOff, Mail, Lock, ArrowRight, CogIcon } from "lucide-react";
import { localStorageUtils } from "../utils/localStorageUtils";
import { type IAppStorage, type IUser, type IApi } from "~/types/interfaces/ILocalStorageInterfaces";
import { useNavigate } from "react-router";
import { authenticateUser, checkSuperUser, createSuperUser } from "~/services/authService";
import SuperUserModal from "~/components/system/SuperUserModal";
import ApiConfigModal from "~/components/system/ApiConfigModal";
import { type IApiResponse } from "~/types/interfaces/IApiResponse";
import { type IAuthResponse } from "~/types/interfaces/IAuthResponse";
import { useAuth } from "~/hooks/useAuth";
import { ToastAlertComponentController } from "~/components/controllers/ToastAlertComponentController";
import ServerNetworkIndicator from "~/components/system/ServerNetworkIndicator";
import { validationUtils } from "~/utils/validationUtils";

const Auth = () => {
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessages, setErrorMessages] = useState<string[]>([]);
  const [showSuperModal, setShowSuperModal] = useState(false);
  const [showConfigModal, setShowConfigModal] = useState(false);

  // Superuser form state
  const [superFirstName, setSuperFirstName] = useState("");
  const [superLastName, setSuperLastName] = useState("");
  const [superUsername, setSuperUsername] = useState("");
  const [superEmail, setSuperEmail] = useState("");
  const [superPassword, setSuperPassword] = useState("");

  const { isAuthenticated, loading, setIsAuthenticated } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!loading && isAuthenticated) {
      navigate("/app/dashboard", { replace: true });
    }
  }, [isAuthenticated, loading, navigate]);

  useEffect(() => {
    localStorageUtils.ensureLocalAppStructure();
  }, []);

  useEffect(() => {
    const saved = localStorage.getItem("rememberMe");
    if (saved === "true") setRememberMe(true);
  }, []);

  // 🧩 Listen for database success event from ServerNetworkIndicator
  useEffect(() => {
    const handleDatabaseReady = async () => {
      console.log("✅ Database connection established — checking for Super User...");

      try {
        const result = await checkSuperUser();

        if (!result.success) {
          console.log("❌ No superuser found — showing modal...");
          setShowSuperModal(true);
        } else {
          console.log("✅ Superuser exists — skipping modal.");
          setShowSuperModal(false);
        }
      } catch (error) {
        console.error("⚠️ Failed to check superuser:", error);
      }
    };

    window.addEventListener("database-ready", handleDatabaseReady);

    return () => {
      window.removeEventListener("database-ready", handleDatabaseReady);
    };
  }, []);

  // hanlde success redirection - liste to isAuthenticated state
  useEffect(() => {
    if (isAuthenticated) {
      navigate("/app/dashboard", { replace: true });
    }
  }, [isAuthenticated, navigate]);

  const handleCreateSuperUser = async () => {
    if (!superFirstName || !superLastName || !superUsername || !superEmail || !superPassword) {
      ToastAlertComponentController.show({
        type: "error",
        message: "Please fill in all fields",
        icon: "XCircle",
        autoHideDuration: 3500,
        positionY: "top",
        positionX: "center",
      });
      return;
    }

    setIsLoading(true);
    const result = await createSuperUser({
      firstName: superFirstName,
      lastName: superLastName,
      username: superUsername,
      email: superEmail,
      password: superPassword,
    });
    setIsLoading(false);

    if (result.success) {
      ToastAlertComponentController.show({
        type: "success",
        message: "Super User created successfully",
        autoHideDuration: 3500
      });
      setShowSuperModal(false);
    } else {
      ToastAlertComponentController.show({
        type: "error",
        message: result.message || "Failed to create super user",
        icon: "XCircle",
      });
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setErrorMessages([]);

    try {
      var errors: string[] = [];

      if(!validationUtils.isStringWithoutSpaces(email)) errors.push("Username/Email is required.");
      if(!validationUtils.isValidInput(password)) errors.push("Password is required.");

      if(errors.length > 0){
        setErrorMessages(errors);
        return;
      }

      const response: IApiResponse<IAuthResponse> = await authenticateUser(email, password);

      if (!response.success || !response.data) {
        ToastAlertComponentController.show({
          type: "error",
          message: response.message || "Login failed. Please try again.",
          icon: "XCircle",
          positionY: "top",
          positionX: "center",
          autoHideDuration: 4500,
        });
        return;
      }

      handleLoginSuccess(response.data);
      ToastAlertComponentController.show({
        type: "info",
        message: "Logging in...",
        positionY: "top",
        positionX: "center",
        autoHideDuration: 1000,
      });
      setIsAuthenticated(true);

    } catch (error) {
      console.log("Unexpected Error", error);
      ToastAlertComponentController.show({
        type: "error",
        message: "An unexpected error occurred",
        icon: "XCircle",
        positionY: "top",
        positionX: "center",
        autoHideDuration: 4500,
      });
    } finally {
      setIsLoading(false);
    }
  };


  const handleLoginSuccess = (authData: IAuthResponse) => {
    const user: Partial<IUser> = {
      id: authData.userId?.toString(),
      person_id: authData.personId?.toString(),
      first_name: authData.firstName,
      other_names: authData.otherNames ?? "",
      last_name: authData.lastName,
      full_name: [authData.firstName, authData.otherNames, authData.lastName].filter(Boolean).join(" "),
      gender: authData.gender ?? "",
      date_of_birth: authData.dateOfBirth ?? "",
      national_id: authData.nationalId ?? "",
      status: authData.status,
      roles: authData.roles ?? [],
      privileges: authData.privileges ?? [],
      logged_in: true,
      last_login: new Date().toISOString(),
    };

    const api: Partial<IApi> = {
      token: authData.accessToken,
      refresh_token: authData.refreshToken,
    };

    localStorageUtils.addOrUpdateLocalStorageObject({ user, api });
    setIsAuthenticated(true);
    console.log("Login info cached in localStorage successfully");
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-white to-red-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 flex items-center justify-center p-4 relative">
      {/* Main Container */}
      <div className="w-full max-w-md relative z-10">
        <div className="bg-white/80 dark:bg-gray-800/90 backdrop-blur-2xl rounded-3xl shadow-2xl border-white/20 dark:border-gray-700/30 p-8 transition-all duration-300 hover:shadow-3xl">
          {/* Header */}
          <div className="text-center mb-6">
            <div className="w-50 h-20 mx-auto mb-4 rounded-xl flex items-center justify-center">
              <img src="/img/rtc-logo.png" alt="App Logo" className="w-25 h-25 object-contain" />
            </div>
            <h1 className="text-2xl font-bold mb-2">
              <span className="bg-gradient-to-r from-green-700 via-green-600 to-green-500 bg-clip-text text-transparent">M</span>{""}
              <span className="bg-gradient-to-r from-red-800 via-red-700 to-red-900 bg-clip-text text-transparent">ID</span>
              <span className="bg-gradient-to-r from-gray-800 via-gray-700 to-gray-900 bg-clip-text text-transparent">S</span>
            </h1>
            <p className="text-gray-600 dark:text-gray-300 text-sm">Malawi Integrated Data System</p>
          </div>

          {errorMessages.length > 0 && (
            <div className="pb-4 px-1 text-red-600">
              {errorMessages.map((error, index) => (
                <div key={index}>{error}</div>
              ))}
            </div>
          )}

          {/* Login Form */}
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Email / username */}
            <div className="relative group">
              <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                <Mail className="h-5 w-5 text-gray-400 group-focus-within:text-green-600 transition-colors" />
              </div>
              <input
                type="text"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Username / Email address"
                className="w-full pl-12 pr-12 py-4 bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-green-500 outline-none transition-all duration-200 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400"
                required
              />
            </div>

            {/* Password */}
            <div className="relative group">
              <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                <Lock className="h-5 w-5 text-gray-400 group-focus-within:text-green-600 transition-colors" />
              </div>
              <input
                type={showPassword ? "text" : "password"}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Password"
                className="w-full pl-12 pr-12 py-4 bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-green-500 outline-none transition-all duration-200 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400"
                required
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute inset-y-0 right-0 pr-4 flex items-center text-gray-400 hover:text-green-600 transition-colors"
              >
                {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
              </button>
            </div>

            <div className="flex">
              <div className="flex flex-1 items-center justify-between">
                {/* Remember Me */}
                {/* <label className="flex items-center cursor-pointer group">
                  <input
                    type="checkbox"
                    checked={rememberMe}
                    onChange={(e) => {
                      setRememberMe(e.target.checked);
                      localStorage.setItem("rememberMe", String(e.target.checked));
                    }}
                    className="sr-only"
                  />
                  <div
                    className={`w-5 h-5 rounded border-2 mr-3 flex items-center justify-center transition-all duration-200 ${
                      rememberMe ? "bg-green-600 border-green-600" : "border-gray-300 dark:border-gray-600 group-hover:border-green-600"
                    }`}
                  >
                    {rememberMe && (
                      <svg className="w-3 h-3 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                      </svg>
                    )}
                  </div>
                  <span className="text-sm text-gray-600 dark:text-gray-300 group-hover:text-green-600 transition-colors">Remember me</span>
                </label> */}
              </div>

              {/* Api Config */}
              <div
                onClick={() => setShowConfigModal(true)}
                className="flex text-sm text-primary-100 dark:text-gray-300 group-hover:text-primary-500 transition-colors cursor-pointer"
              >
                <CogIcon className="h-5 w-5" />
                API Config
              </div>
            </div>

            {/* Login Button */}
            <button
              onClick={handleSubmit}
              disabled={isLoading}
              className="w-full bg-gradient-to-r cursor-pointer from-green-600 to-green-700 hover:from-green-700 hover:to-green-800 disabled:from-gray-400 disabled:to-gray-500 text-white font-semibold py-4 rounded-xl transition-all duration-200 flex items-center justify-center space-x-2 shadow-lg hover:shadow-xl disabled:cursor-not-allowed group"
            >
              {isLoading ? (
                <div className="w-6 h-6 border-2 border-white border-t-transparent rounded-full animate-spin" suppressHydrationWarning></div>
              ) : (
                <>
                  <span>Sign In</span>
                  <ArrowRight className="h-5 w-5 group-hover:translate-x-1 transition-transform" />
                </>
              )}
            </button>
          </form>
        </div>
      </div>

      {/* SuperUser Modal */}
      <SuperUserModal
        isOpen={showSuperModal}
        onClose={() => {}}
        onSubmit={handleCreateSuperUser}
        isLoading={isLoading}
      >
        <input className="w-full p-3 border rounded" placeholder="First Name" value={superFirstName} onChange={(e) => setSuperFirstName(e.target.value)} />
        <input className="w-full p-3 border rounded" placeholder="Last Name" value={superLastName} onChange={(e) => setSuperLastName(e.target.value)} />
        <input className="w-full p-3 border rounded" placeholder="Username" value={superUsername} onChange={(e) => setSuperUsername(e.target.value)} />
        <input className="w-full p-3 border rounded" type="email" placeholder="Email" value={superEmail} onChange={(e) => setSuperEmail(e.target.value)} />
        <input className="w-full p-3 border rounded" type="password" placeholder="Password" value={superPassword} onChange={(e) => setSuperPassword(e.target.value)} />
      </SuperUserModal>

      <ApiConfigModal isOpen={showConfigModal} onClose={() => setShowConfigModal(false)} />

      <ToastAlertComponentController.render />

      {/* Bottom-right indicator */}
      <div className="fixed bottom-4 right-4 z-50">
        <ServerNetworkIndicator
          showNetworkIndicator={true}
          showServerIndicator={true}
          showDatabaseIndicator={false}
        />
      </div>
    </div>
  );
};

export default Auth;
