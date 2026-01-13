import React from "react";

interface PageLoaderProps {
  loading?: boolean;          // Whether loader is active
  text?: string;              // Optional message
  loaderType?: "crescent" | "spinner"; // Default loader style
}

const PageLoader: React.FC<PageLoaderProps> = ({
  loading = true,
  text,
  loaderType = "crescent",
}) => {
  if (!loading) return null;

  return (
    <div className="fixed inset-0 z-[2000] flex flex-col items-center justify-center bg-gradient-to-br from-black/20 via-green-700/50 to-cyan-700/50 backdrop-blur-[0.15rem]">
      {/* Loader */}
      <div className="flex flex-col items-center justify-center space-y-4">
        {loaderType === "crescent" && (
          <div className="w-12 h-12 border-4 border-t-cyan-600 border-r-transparent border-b-transparent border-l-transparent rounded-full animate-spin"></div>
        )}
        {loaderType === "spinner" && (
          <div className="w-10 h-10 border-4 border-cyan-600 border-solid rounded-full animate-spin"></div>
        )}
        {text && <p className="text-gray-400 dark:text-gray-200 text-sm">{text}</p>}
      </div>
    </div>
  );
};

export default PageLoader;
