
import { useState, useEffect } from "react";

interface Toast {
  id: string;
  title?: string;
  description?: string;
  variant?: "default" | "destructive" | "success" | "warning";
}

export function useToast() {
  const [toasts, setToasts] = useState<Toast[]>([]);

  const addToast = (toast: Omit<Toast, "id">) => {
    const id = Math.random().toString(36).substring(2, 9);
    setToasts((prev) => [...prev, { ...toast, id }]);
    return id;
  };

  const dismissToast = (id: string) => {
    setToasts((prev) => prev.filter((toast) => toast.id !== id));
  };

  return {
    toasts,
    toast: addToast,
    dismiss: dismissToast,
  };
}

// Singleton toast instance for use outside of React components
interface ToastState {
  toasts: Toast[];
  listeners: Set<() => void>;
}

const state: ToastState = {
  toasts: [],
  listeners: new Set(),
};

const notifyListeners = () => {
  state.listeners.forEach((listener) => listener());
};

export const toast = {
  toast: (toast: Omit<Toast, "id">) => {
    const id = Math.random().toString(36).substring(2, 9);
    state.toasts = [...state.toasts, { ...toast, id }];
    notifyListeners();
    
    // Auto dismiss after 5 seconds
    setTimeout(() => {
      toast.dismiss(id);
    }, 5000);
    
    return id;
  },
  dismiss: (id: string) => {
    state.toasts = state.toasts.filter((toast) => toast.id !== id);
    notifyListeners();
  },
  success: (description: string) => {
    return toast.toast({ 
      title: "Succès",
      description, 
      variant: "success" 
    });
  },
  error: (description: string) => {
    return toast.toast({ 
      title: "Erreur",
      description, 
      variant: "destructive" 
    });
  },
  warning: (description: string) => {
    return toast.toast({ 
      title: "Attention",
      description, 
      variant: "warning" 
    });
  },
};
