import { useState, useCallback, useEffect } from 'react';

let toastIdCounter = 0;
let listeners = [];

const toastState = {
  toasts: [],
};

const emit = () => {
  listeners.forEach(listener => listener(toastState.toasts));
};

export const toast = {
  success: (message, duration = 3000) => {
    const id = ++toastIdCounter;
    toastState.toasts.push({ id, type: 'success', message, duration });
    emit();
    setTimeout(() => toast.dismiss(id), duration);
  },
  error: (message, duration = 5000) => {
    const id = ++toastIdCounter;
    toastState.toasts.push({ id, type: 'error', message, duration });
    emit();
    setTimeout(() => toast.dismiss(id), duration);
  },
  info: (message, duration = 3000) => {
    const id = ++toastIdCounter;
    toastState.toasts.push({ id, type: 'info', message, duration });
    emit();
    setTimeout(() => toast.dismiss(id), duration);
  },
  dismiss: (id) => {
    toastState.toasts = toastState.toasts.filter(t => t.id !== id);
    emit();
  },
};

export const useToast = () => {
  const [toasts, setToasts] = useState(toastState.toasts);

  useEffect(() => {
    listeners.push(setToasts);
    return () => {
      listeners = listeners.filter(l => l !== setToasts);
    };
  }, []);

  const dismiss = useCallback((id) => {
    toast.dismiss(id);
  }, []);

  return { toasts, toast, dismiss };
};

