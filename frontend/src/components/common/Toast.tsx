import React from 'react';

export interface ToastProps {
  type?: 'success' | 'warning' | 'error' | 'info';
  message: string;
  onDismiss?: () => void;
}

export const Toast: React.FC<ToastProps> = ({ type = 'info', message, onDismiss }) => {
  const styles = {
    success: 'bg-success-light text-success-text border-success/30',
    warning: 'bg-warning-light text-warning-text border-warning/30',
    error: 'bg-error-light text-error-text border-error/30',
    info: 'bg-info-light text-info-text border-info/30',
  };

  return (
    <div
      role="status"
      className={`fixed bottom-6 right-6 z-50 flex items-center gap-3 px-4 py-3 rounded-md border shadow-paper ${styles[type]}`}
    >
      <span className="text-body-sm font-medium">{message}</span>
      {onDismiss && (
        <button
          onClick={onDismiss}
          className="text-stone-400 hover:text-earth text-caption p-1"
          aria-label="Dismiss message"
        >
          ✕
        </button>
      )}
    </div>
  );
};
