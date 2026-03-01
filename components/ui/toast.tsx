"use client";

import { useEffect } from "react";

interface ToastProps {
  id: string;
  title: string;
  description?: string;
  duration?: number;
  onDismiss: (id: string) => void;
}

export function Toast({
  id,
  title,
  description,
  duration = 3000,
  onDismiss,
}: ToastProps) {
  useEffect(() => {
    if (duration > 0) {
      const timer = setTimeout(() => onDismiss(id), duration);
      return () => clearTimeout(timer);
    }
  }, [id, duration, onDismiss]);

  return (
    <div className="animate-in fade-in slide-in-from-bottom-4 duration-300 bg-secondary-dark-2 border border-secondary-gray rounded-lg p-4 shadow-lg min-w-75">
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-primary-light font-semibold text-sm">{title}</p>
          {description && (
            <p className="text-secondary-foreground text-xs mt-1">
              {description}
            </p>
          )}
        </div>
        <button
          onClick={() => onDismiss(id)}
          className="text-secondary-gray hover:text-primary-light transition-colors shrink-0">
          ✕
        </button>
      </div>
    </div>
  );
}
