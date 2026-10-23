import React, { useEffect } from 'react';
import { Button } from './Button';

export interface DialogProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  description?: string;
  children?: React.ReactNode;
  confirmText?: string;
  onConfirm?: () => void;
  isDestructive?: boolean;
}

export const Dialog: React.FC<DialogProps> = ({
  isOpen,
  onClose,
  title,
  description,
  children,
  confirmText,
  onConfirm,
  isDestructive = false,
}) => {
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-earth/40 backdrop-blur-xs"
      role="dialog"
      aria-modal="true"
      aria-labelledby="dialog-title"
    >
      <div
        className="w-full max-w-lg bg-ivory rounded-md border border-beige-200 shadow-dialog p-6 text-left flex flex-col gap-4"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-start justify-between">
          <div>
            <h2 id="dialog-title" className="text-h3 font-heading text-earth">
              {title}
            </h2>
            {description && (
              <p className="text-body-sm text-stone-400 mt-1">{description}</p>
            )}
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-sm text-stone-400 hover:text-earth hover:bg-beige-100 transition-colors"
            aria-label="Close dialog"
          >
            ✕
          </button>
        </div>

        {children && <div className="py-2 text-body">{children}</div>}

        <div className="flex justify-end gap-2.5 pt-2 border-t border-beige-200">
          <Button variant="secondary" size="md" onClick={onClose}>
            Cancel
          </Button>
          {confirmText && onConfirm && (
            <Button
              variant={isDestructive ? 'danger' : 'primary'}
              size="md"
              onClick={onConfirm}
            >
              {confirmText}
            </Button>
          )}
        </div>
      </div>
    </div>
  );
};
