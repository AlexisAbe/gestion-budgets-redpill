
import { useState, useEffect } from "react";

export interface Toast {
  id: string;
  title?: string;
  description?: string;
  action?: React.ReactNode;
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

// Create a toast function that accepts toast parameters
export const toast = (props: Omit<Toast, "id">) => {
  const id = Math.random().toString(36).substring(2, 9);
  state.toasts = [...state.toasts, { ...props, id }];
  notifyListeners();
  
  // Auto dismiss after 5 seconds
  setTimeout(() => {
    toast.dismiss(id);
  }, 5000);
  
  return id;
};

// Add methods to the toast object
toast.dismiss = (id: string) => {
  state.toasts = state.toasts.filter((toast) => toast.id !== id);
  notifyListeners();
};

toast.success = (description: string) => {
  return toast({ 
    title: "Succès",
    description, 
    variant: "success" 
  });
};

toast.error = (description: string) => {
  return toast({ 
    title: "Erreur",
    description, 
    variant: "destructive" 
  });
};

toast.warning = (description: string) => {
  return toast({ 
    title: "Attention",
    description, 
    variant: "warning" 
  });
};
