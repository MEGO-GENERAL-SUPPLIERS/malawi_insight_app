import React, { type FC, useState } from "react";
import { XCircle } from "lucide-react";
import ApiConfigModal from "~/components/system/ApiConfigModal";

interface SuperUserModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: () => void;
  children: React.ReactNode;
  isLoading?: boolean;
}

const SuperUserModal: FC<SuperUserModalProps> = ({ isOpen, onClose, onSubmit, children, isLoading }) => {
  const [showConfigModal, setShowConfigModal] = useState(false);

  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!isLoading) onSubmit();
  };

  const handleConfigUpdate = (config: { protocol: string; host: string; port?: string; base: string }) => {
    console.log("Updated config:", config);
    setShowConfigModal(false);
  };

  return (
    <>
      {/* SuperUser Modal */}
      <div
        className={`fixed inset-0 z-50 flex items-center justify-center bg-black/40 transition-opacity ${
          isOpen ? "opacity-100 pointer-events-auto" : "opacity-0 pointer-events-none"
        }`}
      >
        <div
          className={`bg-white dark:bg-gray-800 w-full max-w-md mx-4 sm:mx-auto rounded-xl shadow-lg p-6 sm:p-8 transform transition-transform duration-500 ${
            isOpen ? "translate-y-0" : "-translate-y-full"
          } overflow-auto max-h-[90vh]`}
        >
          <div className="flex justify-between items-center mb-2">
            <h2 className="text-xl font-bold text-gray-900 dark:text-white">Create Super User</h2>
            <button onClick={onClose} className="text-gray-500 hover:text-gray-700 dark:hover:text-gray-300">
              <XCircle className="w-6 h-6" />
            </button>
          </div>
          <p className="text-sm text-gray-600 dark:text-gray-300 mb-4 mt-4">
            System has no superuser. Please instantiate one to proceed.
          </p>

          <form onSubmit={handleFormSubmit} className="space-y-4">
            {children}

            {/* Buttons */}
            <div className="flex justify-between mt-4">
              <button
                type="submit"
                disabled={isLoading}
                className="w-full mr-2 py-3 bg-green-600 hover:bg-green-700 cursor-pointer text-white rounded-lg font-semibold transition flex items-center justify-center disabled:bg-gray-400 disabled:cursor-not-allowed"
              >
                {isLoading ? (
                  <div className="w-6 h-6 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                ) : (
                  "Submit"
                )}
              </button>
              <button
                type="button"
                className="w-full ml-2 py-3 bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white rounded-lg font-semibold transition"
                onClick={() => setShowConfigModal(true)}
              >
                Config
              </button>
            </div>
          </form>
        </div>
      </div>

      {/* Config Modal */}
      <ApiConfigModal
        isOpen={showConfigModal}
        onClose={() => setShowConfigModal(false)}
      />
    </>
  );
};

export default SuperUserModal;
