import React, { useState, useCallback, useEffect } from 'react';
import { ToastMessage } from '../types';

// Hook to manage toast state
export function useToasts() {
  const [toasts, setToasts] = useState<ToastMessage[]>([]);

  const addToast = useCallback((message: string, type: ToastMessage['type'] = 'info') => {
    const id = Date.now();
    setToasts(prevToasts => [...prevToasts, { id, message, type }]);
  }, []);

  const removeToast = useCallback((id: number) => {
    setToasts(prevToasts => prevToasts.filter(toast => toast.id !== id));
  }, []);

  return { toasts, addToast, removeToast };
}

// ---- Toast Component ----
interface ToastProps {
  message: string;
  type: 'success' | 'error' | 'info';
  onDismiss: () => void;
}

function Toast({ message, type, onDismiss }: ToastProps) {
  useEffect(() => {
    const timer = setTimeout(() => {
      onDismiss();
    }, 5000); // Auto-dismiss after 5 seconds

    return () => clearTimeout(timer);
  }, [onDismiss]);

  const baseClasses = 'w-full max-w-sm p-4 rounded-lg shadow-lg flex items-center text-white';
  const typeClasses = {
    success: 'bg-green-500',
    error: 'bg-red-500',
    info: 'bg-blue-500',
  };

  const Icon = () => {
      let path;
      switch(type) {
          case 'success':
              path = <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />;
              break;
          case 'error':
              path = <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />;
              break;
          default:
              path = <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />;
      }
      return <svg className="w-6 h-6 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">{path}</svg>
  }

  return (
    <div className={`${baseClasses} ${typeClasses[type]}`}>
      <Icon />
      <span className="flex-grow">{message}</span>
      <button onClick={onDismiss} className="ml-4 p-1 rounded-full hover:bg-white/20">
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
      </button>
    </div>
  );
}


// ---- Toast Container Component ----
interface ToastContainerProps {
  toasts: ToastMessage[];
  removeToast: (id: number) => void;
}

export function ToastContainer({ toasts, removeToast }: ToastContainerProps) {
  return (
    <div className="fixed bottom-4 right-4 z-50 space-y-3">
      {toasts.map(toast => (
        <Toast
          key={toast.id}
          message={toast.message}
          type={toast.type}
          onDismiss={() => removeToast(toast.id)}
        />
      ))}
    </div>
  );
}
