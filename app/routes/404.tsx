import React from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft } from "lucide-react";

const NotFoundPage: React.FC = () => {
  const navigate =  useNavigate();

  return(
    <div className="flex flex-col items-center justify-center min-h-screen bg-white p-6">
      {/* Back Button at Top */}
      <button
        onClick={() => navigate(-1)}
        className="absolute top-6 left-6 flex items-center gap-2 px-4 py-2 bg-gray-200 hover:cursor-pointer rounded hover:bg-gray-300 transition"
      >
        <ArrowLeft size={18} />
        Back
      </button>

      <img
        src="/img/404Error.png"
        alt="404 Not Found"
        className="w-[60%] max-w-full mb-6 filter hue-rotate-0 saturate-80"
      />

      <h1 className="text-3xl font-bold text-gray-800 mb-2">Oops! Page Not Found</h1>
      <p className="text-gray-600 mb-4">
        The page you are looking for doesn’t exist, is under maintenance or development or has been moved.
      </p>

      <button
        onClick={() => navigate("/app/dashboard")}
        className="px-6 py-2 bg-emerald-500 text-white rounded hover:bg-emerald-700 transition"
      >
        Go Back Home
      </button>
    </div>
  );
};

export default NotFoundPage;