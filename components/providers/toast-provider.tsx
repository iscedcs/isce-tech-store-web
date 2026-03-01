"use client";

import { useToast } from "@/hooks/use-toast";
import { ReactNode, createContext, useContext } from "react";
import { ToastContainer } from "../ui/toast-container";

const ToastContext = createContext<ReturnType<typeof useToast> | null>(null);

export function ToastProvider({ children }: { children: ReactNode }) {
  const toastState = useToast();

  return (
    <ToastContext.Provider value={toastState}>
      {children}
      <ToastContainer
        toasts={toastState.toasts}
        onDismiss={toastState.dismiss}
      />
    </ToastContext.Provider>
  );
}

export function useToastContext() {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error("useToastContext must be used within ToastProvider");
  }
  return context;
}
