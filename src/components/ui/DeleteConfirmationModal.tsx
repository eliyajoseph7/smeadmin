import React from 'react';
import { Trash2, AlertTriangle } from 'lucide-react';

interface DeleteConfirmationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  message: string;
  itemName?: string;
  isLoading?: boolean;
  confirmText?: string;
  cancelText?: string;
  type?: 'danger' | 'warning';
}

const DeleteConfirmationModal: React.FC<DeleteConfirmationModalProps> = ({
  isOpen,
  onClose,
  onConfirm,
  title,
  message,
  itemName,
  isLoading = false,
  confirmText = 'Delete',
  cancelText = 'Cancel',
  type = 'danger'
}) => {
  if (!isOpen) return null;

  const isDanger = type === 'danger';
  const iconBgColor = isDanger ? 'bg-red-100' : 'bg-yellow-100';
  const iconColor = isDanger ? 'text-red-600' : 'text-yellow-600';
  const buttonBgColor = isDanger ? 'bg-red-500 hover:bg-red-600 focus:ring-red-300' : 'bg-yellow-500 hover:bg-yellow-600 focus:ring-yellow-300';

  return (
    <div className="fixed inset-0 bg-gray-900 bg-opacity-50 flex items-center justify-center z-50 p-4 backdrop-blur-sm">
      <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full mx-4 transform transition-all duration-200 scale-100">
        <div className="p-8 text-center">
          {/* Icon */}
          <div className={`mx-auto flex items-center justify-center h-16 w-16 rounded-full ${iconBgColor} mb-6 shadow-lg`}>
            {isDanger ? (
              <Trash2 className={`h-8 w-8 ${iconColor}`} />
            ) : (
              <AlertTriangle className={`h-8 w-8 ${iconColor}`} />
            )}
          </div>

          {/* Title */}
          <h3 className="text-xl font-semibold text-gray-900 mb-3">
            {title}
          </h3>

          {/* Message */}
          <div className="mb-8">
            <p className="text-gray-600 leading-relaxed">
              {message}
            </p>
            {itemName && (
              <p className="mt-3 text-sm font-medium text-gray-800 bg-gray-50 px-4 py-2 rounded-lg border">
                "{itemName}"
              </p>
            )}
          </div>

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row gap-3 sm:gap-4">
            <button
              onClick={onClose}
              disabled={isLoading}
              className="
                flex-1 px-6 py-3 bg-gray-100 hover:bg-gray-200 text-gray-700 font-medium rounded-xl
                transition-all duration-200 transform hover:scale-105 active:scale-95
                focus:outline-none focus:ring-4 focus:ring-gray-300 focus:ring-opacity-50
                disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none
                shadow-md hover:shadow-lg
                min-h-[48px] flex items-center justify-center
              "
            >
              {cancelText}
            </button>
            
            <button
              onClick={onConfirm}
              disabled={isLoading}
              className={`
                flex-1 px-6 py-3 ${buttonBgColor} text-white font-medium rounded-xl
                transition-all duration-200 transform hover:scale-105 active:scale-95
                focus:outline-none focus:ring-4 focus:ring-opacity-50
                disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none
                shadow-lg hover:shadow-xl
                min-h-[48px] flex items-center justify-center
              `}
            >
              {isLoading ? (
                <div className="flex items-center justify-center">
                  <div className="animate-spin rounded-full h-5 w-5 border-2 border-white border-t-transparent mr-2"></div>
                  Deleting...
                </div>
              ) : (
                confirmText
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DeleteConfirmationModal;
