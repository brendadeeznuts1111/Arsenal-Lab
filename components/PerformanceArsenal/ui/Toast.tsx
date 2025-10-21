// components/PerformanceArsenal/ui/Toast.tsx
import React, { useState, useCallback, useEffect } from 'react';

interface Toast {
  id: string;
  message: string;
  type: 'success' | 'error' | 'warning';
  duration?: number;
}

interface ToastContext {
  toasts: Toast[];
  showToast: (message: string, type?: Toast['type'], duration?: number) => void;
  dismissToast: (id: string) => void;
}

const ToastContext = React.createContext<ToastContext | undefined>(undefined);

export function Toast({ message, type, onDismiss }: any) {
  useEffect(() => {
    const timer = setTimeout(onDismiss, 3000);
    return () => clearTimeout(timer);
  }, [onDismiss]);

  return (
    <div className={`toast toast-${type}`}>
      {message}
      <button onClick={onDismiss} className="toast-dismiss">×</button>
    </div>
  );
}

export function useToaster() {
  const [toasts, setToasts] = useState<Toast[]>([]);

  const showToast = useCallback((message: string, type: Toast['type'] = 'success', duration = 3000) => {
    const id = Math.random().toString(36).substr(2, 9);
    setToasts(prev => [...prev, { id, message, type, duration }]);
  }, []);

  const dismissToast = useCallback((id: string) => {
    setToasts(prev => prev.filter(toast => toast.id !== id));
  }, []);

  return {
    toasts,
    showToast,
    dismissToast
  };
}
