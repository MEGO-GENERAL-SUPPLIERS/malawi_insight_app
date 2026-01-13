import React, { useState, useEffect } from "react";
import { XCircle } from "lucide-react";
import { localStorageUtils } from "~/utils/localStorageUtils";
import { toast } from "react-toastify";

interface ApiConfigModalProps {
  isOpen: boolean;
  onClose: () => void;
  onUpdate?: (config: { protocol: string; server: string; port?: string; base: string }) => void;
}

const ApiConfigModal: React.FC<ApiConfigModalProps> = ({ isOpen, onClose, onUpdate }) => {
  const [protocol, setProtocol] = useState("http");
  const [server, setServer] = useState("localhost");
  const [port, setPort] = useState("3000");
  const [base, setBase] = useState("api/v1");
  const [isLoading, setIsLoading] = useState(false);

  // Initialize fields from localStorage when modal opens
  useEffect(() => {
    if (!isOpen) return;

    const appData = localStorageUtils.ensureLocalAppStructure();
    const apiConfig = appData.api;
    setProtocol(apiConfig.protocol || "http");
    setServer(apiConfig.server || "localhost");
    setPort(apiConfig.port || "3000");
    setBase(apiConfig.base || "api/v1");
  }, [isOpen]);

  const buildBaseUrl = () => {
    // Normalize base: ensure no leading/trailing slashes
    const normalizedBase = base.replace(/^\/+|\/+$/g, "");
    let url = `${protocol}://${server}`;
    if (port && port !== "80" && port !== "443") {
      url += `:${port}`;
    }
    url += `/${normalizedBase}`;
    return url;
  };

  const handleUpdate = async () => {
    setIsLoading(true);

    const infoToastId = toast.info("API settings cached. Testing configuration...", {
      autoClose: false,
    });

    try {
      const config = { protocol, server, port, base };

      localStorageUtils.addOrUpdateLocalStorageObject({ api: config });

      const normalizedBase = base.replace(/^\/+|\/+$/g, "");
      let baseUrl = `${protocol}://${server}`;
      if (port && port !== "80" && port !== "443") {
        baseUrl += `:${port}`;
      }
      baseUrl += `/${normalizedBase}`;
      const healthCheckUrl = `${baseUrl}/health_check`;

      const response = await fetch(healthCheckUrl, { method: "GET" });
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }
      const data = await response.json();

      if (onUpdate) onUpdate(config);

      toast.dismiss(infoToastId);
      toast.success("API configuration validated successfully!");

      onClose();
    } catch (error: any) {
      toast.dismiss(infoToastId);
      toast.error(`API test failed: ${error.message || "Unable to reach health check endpoint"}`);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div
      className={`fixed inset-0 z-50 flex items-center justify-center bg-black/40 transition-opacity ${
        isOpen ? "opacity-100 pointer-events-auto" : "opacity-0 pointer-events-none"
      }`}
    >
      <div
        className={`bg-white dark:bg-gray-800 w-full max-w-md mx-4 sm:mx-auto rounded-xl shadow-lg py-6 px-6 sm:p-8 transform transition-transform duration-500 ${
          isOpen ? "translate-y-0" : "-translate-y-full"
        } overflow-auto max-h-[90vh]`}
      >
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-bold text-gray-900 dark:text-white">API Configuration</h2>
          <button
            onClick={onClose}
            className="cursor-pointer text-gray-500 hover:text-gray-700 dark:hover:text-gray-300"
            disabled={isLoading}
          >
            <XCircle className="w-6 h-6" />
          </button>
        </div>

        <div className="space-y-4">
          <input
            className="w-full p-3 border rounded dark:bg-gray-700 dark:text-white dark:border-gray-600"
            placeholder="Protocol (e.g., http, https)"
            value={protocol}
            onChange={(e) => setProtocol(e.target.value.trim())}
            disabled={isLoading}
          />
          <input
            className="w-full p-3 border rounded dark:bg-gray-700 dark:text-white dark:border-gray-600"
            placeholder="Host (e.g., localhost, api.example.com)"
            value={server}
            onChange={(e) => setServer(e.target.value.trim())}
            disabled={isLoading}
          />
          <input
            className="w-full p-3 border rounded dark:bg-gray-700 dark:text-white dark:border-gray-600"
            placeholder="Port (optional, e.g., 3000)"
            value={port}
            onChange={(e) => setPort(e.target.value.trim())}
            disabled={isLoading}
          />
          <input
            className="w-full p-3 border rounded dark:bg-gray-700 dark:text-white dark:border-gray-600"
            placeholder="Base path (e.g., api/v1)"
            value={base}
            onChange={(e) => setBase(e.target.value.trim())}
            disabled={isLoading}
          />
        </div>

        <div className="mt-6 flex justify-end space-x-3">
          <button
            type="button"
            onClick={onClose}
            disabled={isLoading}
            className="px-4 py-2 rounded-lg bg-gray-300 dark:bg-red-600 hover:bg-gray-400 dark:hover:bg-red-500 transition cursor-pointer disabled:opacity-50"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={handleUpdate}
            disabled={isLoading}
            className="px-4 py-2 rounded-lg bg-blue-500 hover:bg-blue-600 text-white transition flex items-center justify-center cursor-pointer disabled:opacity-70"
          >
            {isLoading ? (
              <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
            ) : (
              "Save & Test"
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

export default ApiConfigModal;