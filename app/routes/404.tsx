import React from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft } from "lucide-react";
import { useAuth } from "~/hooks/useAuth";

const NotFoundPage: React.FC = () => {
  const navigate =  useNavigate();
  const { isAuthenticated } = useAuth();

  return(
    <div className="flex flex-col items-center justify-center min-h-screen bg-white p-6">
      {/* Back Button at Top */}
      <button
        onClick={() => navigate(-1)}
        className="absolute top-6 left-6 flex items-center gap-2 px-4 py-2 bg-gray-200 hover:cursor-pointer rounded hover:bg-gray-300 transition"
      >
        <ArrowLeft size={16} />
        Back
      </button>

      <img
        src="/img/404Error.png"
        alt="404 Not Found"
        className="w-full lg:w-[55%] max-w-full mb-6 filter hue-rotate-0 saturate-80 "
      />

      <h1 className="text-3xl font-bold text-gray-800 mb-2">Oops! Page Not Found</h1>
      <p className="text-gray-600 mb-4">
        The page you are looking for doesn’t exist, is under maintenance or development or has been moved.
      </p>
      <div className="flex gap-4">
        <button
          onClick={() => navigate(-1)}
          className="px-6 py-2 bg-gray-300 text-gray-800 rounded hover:cursor-pointer hover:bg-gray-400 transition mr-4"
        >
          <ArrowLeft size={16} /> Back
        </button>
        { isAuthenticated && 
          <button
            onClick={() => navigate("/app/dashboard")}
            className="px-6 py-2 bg-emerald-500 text-white rounded hover:cursor-pointer hover:bg-emerald-700 transition"
          >
            Back to Dashboard
          </button>
        }
      </div>
    </div>
  );
};

export default NotFoundPage;