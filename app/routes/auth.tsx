import React, { useState, useEffect } from "react";
import { Eye, EyeOff, Mail, Lock, ArrowRight } from "lucide-react";
import { localStorageUtils } from "../utils/localStorageUtils";
import { type IAppStorage } from "~/interfaces/localStorageInterfaces";

const Auth = () => {
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  // Local storage set 
  useEffect(() => {
    const appData: IAppStorage = localStorageUtils.ensureLocalAppStructure();
    console.info('App Data Load...: ', appData);
  }, []);

  // ✅ Client-only initialization for rememberMe (hydration safe)
  useEffect(() => {
    const saved = localStorage.getItem("rememberMe");
    if (saved === "true") setRememberMe(true);
  }, []);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    // Simulate login process
    setTimeout(() => setIsLoading(false), 2000);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-white to-red-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 flex items-center justify-center p-4 transition-colors duration-300">
      {/* Background Pattern */}
      <div className="absolute inset-0 opacity-5 dark:opacity-10">
        <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-tl from-gray-600 to-gray-600"></div>
        {/* ✅ SVG pattern moved into CSS */}
        <div className="absolute top-0 left-0 w-full h-full bg-auth-pattern"></div>
      </div>

      {/* Main Container */}
      <div className="w-full max-w-md relative z-10">
        <div className="bg-white/80 dark:bg-gray-800/90 backdrop-blur-2xl rounded-3xl shadow-2xl border-white/20 dark:border-gray-700/30 p-8 transition-all duration-300 hover:shadow-3xl">
          {/* Header */}
          <div className="text-center mb-6">
            <div className="w-50 h-20 mx-auto mb-4 rounded-xl flex items-center justify-center">
              <img
                src="/img/rtc-logo.png"
                alt="App Logo"
                className="w-25 h-25 object-contain"
              />
            </div>

            <h1 className="text-3xl font-bold mb-2">
              <span className="bg-gradient-to-r from-green-700 via-green-600 to-green-500 bg-clip-text text-transparent">
                Malawi
              </span>{" "}
              <span className="bg-gradient-to-r from-gray-800 via-gray-700 to-gray-900 bg-clip-text text-transparent">
                Insight
              </span>
            </h1>
            <p className="text-gray-600 dark:text-gray-300 text-sm">
              Welcome! Please sign in to continue
            </p>
          </div>

          {/* Login Form */}
          <div className="space-y-6">
            {/* Email Input */}
            <div className="relative group">
              <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                <Mail className="h-5 w-5 text-gray-400 group-focus-within:text-green-600 transition-colors" />
              </div>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Email address"
                className="w-full pl-12 pr-4 py-4 bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-transparent outline-none transition-all duration-200 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400"
                required
              />
            </div>

            {/* Password Input */}
            <div className="relative group">
              <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                <Lock className="h-5 w-5 text-gray-400 group-focus-within:text-green-600 transition-colors" />
              </div>
              <input
                type={showPassword ? "text" : "password"}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Password"
                className="w-full pl-12 pr-12 py-4 bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-transparent outline-none transition-all duration-200 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400"
                required
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute inset-y-0 right-0 pr-4 flex items-center text-gray-400 hover:text-green-600 transition-colors"
              >
                {showPassword ? (
                  <EyeOff className="h-5 w-5" />
                ) : (
                  <Eye className="h-5 w-5" />
                )}
              </button>
            </div>

            {/* Remember Me */}
            <div className="flex items-center justify-between">
              <label className="flex items-center cursor-pointer group">
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
                    rememberMe
                      ? "bg-green-600 border-green-600"
                      : "border-gray-300 dark:border-gray-600 group-hover:border-green-600"
                  }`}
                >
                  {rememberMe && (
                    <svg
                      className="w-3 h-3 text-white"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth="2"
                        d="M5 13l4 4L19 7"
                      />
                    </svg>
                  )}
                </div>
                <span className="text-sm text-gray-600 dark:text-gray-300 group-hover:text-green-600 transition-colors">
                  Remember me
                </span>
              </label>

              <a
                href="#"
                className="text-sm text-red-600 hover:text-red-700 dark:text-red-400 dark:hover:text-red-300 transition-colors font-medium"
              >
                Forgot password?
              </a>
            </div>

            {/* Login Button */}
            <button
              onClick={handleSubmit}
              disabled={isLoading}
              className="w-full bg-gradient-to-r cursor-pointer from-green-600 to-green-700 hover:from-green-700 hover:to-green-800 disabled:from-gray-400 disabled:to-gray-500 text-white font-semibold py-4 rounded-xl transition-all duration-200 flex items-center justify-center space-x-2 shadow-lg hover:shadow-xl disabled:cursor-not-allowed group"
            >
              {isLoading ? (
                // ✅ Suppress hydration warning because spinner differs
                <div
                  className="w-6 h-6 border-2 border-white border-t-transparent rounded-full animate-spin"
                  suppressHydrationWarning
                ></div>
              ) : (
                <>
                  <span>Sign In</span>
                  <ArrowRight className="h-5 w-5 group-hover:translate-x-1 transition-transform" />
                </>
              )}
            </button>
          </div>

          {/* Footer */}
          <div className="mt-8 flex items-center">
            <div className="flex-1 border-t border-gray-300 dark:border-gray-600"></div>
            <span className="px-4 text-sm text-gray-500 dark:text-gray-400 bg-white dark:bg-gray-800">
              v2.0.0 | Config
            </span>
            <div className="flex-1 border-t border-gray-300 dark:border-gray-600"></div>
          </div>
        </div>

        {/* Footer Logos */}
        <div className="mt-8 text-center space-y-4">
          <div className="flex justify-center items-center space-x-6">
            {/*<div className="w-8 h-8 bg-gradient-to-br from-green-600 to-green-700 rounded-lg flex items-center justify-center">
              <span className="text-white text-sm font-bold">MI</span>
            </div>*/}
            <div className="w-15 h-15 bg-none">
              <img 
                src="/img/malawi-waving-flag.webp"
                alt="Malawi waving flag"
                className="w-[100%] h-[100%] object-contain"
              />
            </div>
            <div className="w-11 h-11 bg-none flex items-center justify-center">
              <img 
                src="/img/malawi-cort-of-arms.png"
                alt="Malawi Court of Arms"
                className="w-[100%] h-[100%] object-contain" 
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Auth;
