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

  const handleUpdate = async () => {
    setIsLoading(true);
    try {
      const config = { protocol, server, port, base };

      // Update parent if onUpdate exists
      if (onUpdate) onUpdate(config);

      // Persist to localStorage
      localStorageUtils.addOrUpdateLocalStorageObject({ api: config });

      toast.success("API configuration cached successfully!");
      onClose();
    } catch (error: any) {
      toast.error("Failed to cache API configuration.");
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
          <button onClick={onClose} className="cursor-pointer text-gray-500 hover:text-gray-700 dark:hover:text-gray-300">
            <XCircle className="w-6 h-6" />
          </button>
        </div>

        <div className="space-y-4">
          <input className="w-full p-3 border rounded dark:bg-gray-200" placeholder="Protocol" value={protocol} onChange={(e) => setProtocol(e.target.value)} />
          <input className="w-full p-3 border rounded dark:bg-gray-200" placeholder="Host" value={server} onChange={(e) => setServer(e.target.value)} />
          <input className="w-full p-3 border rounded dark:bg-gray-200" placeholder="Port (optional)" value={port} onChange={(e) => setPort(e.target.value)} />
          <input className="w-full p-3 border rounded dark:bg-gray-200" placeholder="Base" value={base} onChange={(e) => setBase(e.target.value)} />
        </div>

        <div className="mt-6 flex justify-end space-x-3">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 rounded-lg bg-gray-300 dark:bg-gray-500 hover:bg-gray-400 dark:hover:bg-gray-600 transition cursor-pointer"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={handleUpdate}
            disabled={isLoading}
            className="px-4 py-2 rounded-lg bg-blue-500 hover:bg-blue-600 text-white transition flex items-center justify-center cursor-pointer"
          >
            {isLoading ? <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div> : "Update Config"}
          </button>
        </div>
      </div>
    </div>
  );
};

export default ApiConfigModal;
