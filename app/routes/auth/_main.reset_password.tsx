import React, { useEffect, useState } from "react";
import { Lock, Eye, EyeOff, ArrowRight, ArrowLeft } from "lucide-react";
import { useNavigate, useLocation } from "react-router";
import { passwordReset } from "~/services/authService";

const ResetPassword = () => {
  const navigate = useNavigate();
  const location = useLocation();

  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  const [isLoading, setIsLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const token = new URLSearchParams(location.search).get("token");

  // Validate token on mount (simulate backend check)
  useEffect(() => {
    const validateToken = async () => {
      if (!token) {
        setError("Invalid or missing token.");
        setIsLoading(false);
        return;
      }

      try {
        // Optional: call API to validate token
        // const response = await authService.validateToken(token);
        // if (!response.success) throw new Error(response.message);

        // Simulate token validation
        setTimeout(() => {
          setIsLoading(false);
        }, 400);
      } catch (err: any) {
        setError(err.message || "Token is invalid or expired.");
        setIsLoading(false);
      }
    };

    validateToken();
  }, [token]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (password !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }

    if (!token) {
      setError("Invalid token.");
      return;
    }

    setSubmitting(true);
    try {
      const response = await passwordReset({ token, password });

      if (response.success) {
        setSuccess(true);
      } else {
        setError(response.message || "Failed to reset password.");
      }
    } catch (err: any) {
      setError(err.message || "Something went wrong.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-white to-red-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="bg-white/80 dark:bg-gray-800/90 backdrop-blur-2xl rounded-3xl shadow-2xl border-white/20 dark:border-gray-700/30 p-8">

          {/* Header */}
          <div className="text-center mb-6">
            <div className="w-50 h-20 mx-auto mb-4 flex items-center justify-center">
              <img src="/img/rtc-logo.png" className="w-25 h-25 object-contain" />
            </div>
            <h2 className="text-2xl font-bold text-gray-800 dark:text-white">Reset Password</h2>
            <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">Create a new secure password</p>
          </div>

          {/* Loading */}
          {isLoading && (
            <div className="flex justify-center py-6">
              <div className="w-8 h-8 border-4 border-green-600 border-t-transparent rounded-full animate-spin" />
            </div>
          )}

          {/* Error / Invalid token */}
          {!isLoading && error && !success && (
            <div className="text-center space-y-4">
              <p className="text-red-600 dark:text-red-400 font-medium">{error}</p>
              <button
                onClick={() => navigate("/")}
                className="text-green-700 hover:underline text-sm"
              >
                Back to login
              </button>
            </div>
          )}

          {/* Success */}
          {!isLoading && success && (
            <div className="text-center space-y-4">
              <p className="text-green-700 dark:text-green-400 font-medium">Password updated successfully</p>
              <button
                onClick={() => navigate("/")}
                className="bg-gradient-to-r from-green-600 to-green-700 text-white px-5 py-2 rounded-lg"
              >
                Login
              </button>
            </div>
          )}

          {/* Form */}
          {!isLoading && !success && !error && (
            <form onSubmit={handleSubmit} className="space-y-6">

              {/* Password */}
              <div className="relative group">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                  <Lock className="h-5 w-5 text-gray-400 group-focus-within:text-green-600" />
                </div>
                <input
                  type={showPassword ? "text" : "password"}
                  placeholder="New password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  className="w-full pl-12 pr-12 py-4 bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-green-500 outline-none text-gray-900 dark:text-white"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 pr-4 flex items-center text-gray-400 hover:text-green-600"
                >
                  {showPassword ? <EyeOff /> : <Eye />}
                </button>
              </div>

              {/* Confirm Password */}
              <div className="relative">
                <input
                  type={showPassword ? "text" : "password"}
                  placeholder="Confirm password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  required
                  className="w-full pl-4 py-4 bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-green-500 outline-none text-gray-900 dark:text-white"
                />
              </div>

              {password !== confirmPassword && confirmPassword && (
                <p className="text-red-600 text-sm">Passwords do not match</p>
              )}

              {/* Submit */}
              <button
                disabled={submitting || password !== confirmPassword}
                className="w-full bg-gradient-to-r from-green-600 to-green-700 text-white font-semibold py-4 rounded-xl flex items-center justify-center space-x-2 disabled:opacity-60"
              >
                {submitting ? (
                  <div className="w-6 h-6 border-2 border-white border-t-transparent rounded-full animate-spin" />
                ) : (
                  <>
                    <span>Reset Password</span>
                    <ArrowRight />
                  </>
                )}
              </button>

              {/* Back */}
              <div className="flex justify-center">
                <button
                  type="button"
                  onClick={() => navigate("/")}
                  className="flex items-center text-sm text-gray-600 hover:text-green-700 space-x-2"
                >
                  <ArrowLeft className="h-4 w-4" />
                  <span>Back to login</span>
                </button>
              </div>

            </form>
          )}
        </div>
      </div>
    </div>
  );
};

export default ResetPassword;
