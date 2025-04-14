import React from 'react';
import { ToastNotification } from '../types';

interface ToastProps {
  toast: ToastNotification;
  onClose: () => void;
}

const Toast: React.FC<ToastProps> = ({ toast, onClose }) => {
  if (!toast.visible) return null;

  return (
    <div className="fixed top-4 right-4 z-50 bg-white shadow-lg rounded-lg p-4 min-w-[300px] transform transition-all duration-300 ease-in-out">
      <div className="flex items-start">
        <div className="flex-1">
          <p className="text-gray-800">{toast.message}</p>
          {toast.link && (
            <a href="#" className="text-[#FF9EAA] hover:text-[#ff8a9a] mt-2 inline-block">
              {toast.link}
            </a>
          )}
        </div>
        <button
          onClick={onClose}
          className="ml-4 text-gray-400 hover:text-gray-600"
        >
          <i className="fas fa-times"></i>
        </button>
      </div>
    </div>
  );
};

export default Toast;