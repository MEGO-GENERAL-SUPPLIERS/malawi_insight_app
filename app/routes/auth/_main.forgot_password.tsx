import React, { useState } from "react";
import { Mail, ArrowLeft, ArrowRight } from "lucide-react";
import { useNavigate } from "react-router";
import { passwordForgot } from "~/services/authService";

const ForgotPassword = () => {
  const navigate = useNavigate();

  const [email, setEmail] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [sent, setSent] = useState(false);
  const [message, setMessage] = useState("");
  const [messageGood, setMessageGood] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setMessage("");
    setMessageGood(false);

    try {
      const params = { email };
      const response = await passwordForgot(params);

      if (response.success) {
        // Even if email does not exist, for security we show same message
        setSent(true);
        setMessageGood(true);
        setMessage(
          response.message ||
            "If an account exists with this email, a reset link has been sent."
        );
      } else {
        // Show friendly message, do not expose email existence
        setSent(true);
        setMessageGood(false);
        setMessage(
          response.message ||
            "If an account exists with this email, a reset link has been sent."
        );
      }
    } catch (err: any) {
      setSent(false);
      setMessageGood(false);
      setMessage(err.message || "Failed to initiate password reset process.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-linear-to-br from-green-50 via-white to-red-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="bg-white/80 dark:bg-gray-800/90 backdrop-blur-2xl rounded-3xl shadow-2xl border-white/20 dark:border-gray-700/30 p-8">

          {/* Logo */}
          <div className="text-center mb-6">
            <div className="w-50 h-20 mx-auto mb-4 flex items-center justify-center">
              <img src="/img/rtc-logo.png" className="w-25 h-25 object-contain" />
            </div>

            <h2 className="text-2xl font-bold text-gray-800 dark:text-white">
              Forgot Password
            </h2>

            <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
              Enter your registered email to receive a reset link
            </p>

            {message && (
              <div
                className={`p-3 font-medium ${
                  messageGood ? "text-green-600 dark:text-green-400" : "text-red-500"
                }`}
              >
                {message}
              </div>
            )}
          </div>

          {/* Success message */}
          {sent ? (
            <div className="text-center space-y-4">
              { messageGood ? 
                <div className="text-green-700 dark:text-green-400 font-medium">
                  Check your email for the reset link.
                </div>
                : null
              }

              <button
                onClick={() => navigate("/")}
                className="text-sm text-green-700 hover:underline cursor-pointer"
              >
                Back to login
              </button>
            </div>
          ) : (
            /* Form */
            <form onSubmit={handleSubmit} className="space-y-6">

              {/* Email input */}
              <div className="relative group">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                  <Mail className="h-5 w-5 text-gray-400 group-focus-within:text-green-600 transition-colors" />
                </div>

                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => {
                    setEmail(e.target.value);
                    if (e.target.value === "") setMessage("");
                  }}
                  placeholder="Email address"
                  className="w-full pl-12 pr-4 py-4 bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-green-500 outline-none text-gray-900 dark:text-white"
                />
              </div>

              {/* Submit button */}
              <button
                type="submit"
                disabled={isLoading}
                className="w-full bg-linear-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800 text-white font-semibold py-4 rounded-xl transition-all flex items-center justify-center space-x-2 disabled:opacity-60 cursor-pointer"
              >
                {isLoading ? (
                  <div className="w-6 h-6 border-2 border-white border-t-transparent rounded-full animate-spin" />
                ) : (
                  <>
                    <span>Send Reset Link</span>
                    <ArrowRight className="h-5 w-5" />
                  </>
                )}
              </button>

              {/* Back button */}
              <div className="flex justify-center">
                <button
                  type="button"
                  onClick={() => navigate("/")}
                  className="flex items-center text-sm text-gray-600 hover:text-green-700 transition-colors space-x-2 cursor-pointer"
                >
                  <ArrowLeft className="h-4 w-4" />
                  <span>Back to Login</span>
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};

export default ForgotPassword;
