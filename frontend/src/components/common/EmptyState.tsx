import React from 'react';
import { Button } from './Button';

export interface EmptyStateProps {
  illustration?: React.ReactNode;
  title: string;
  description: string;
  actionText?: string;
  onAction?: () => void;
}

export const EmptyState: React.FC<EmptyStateProps> = ({
  illustration,
  title,
  description,
  actionText,
  onAction,
}) => {
  return (
    <div className="flex flex-col items-center justify-center py-16 px-6 text-center max-w-md mx-auto">
      {illustration && <div className="mb-4 text-stone-300">{illustration}</div>}
      <h3 className="text-h3 font-heading text-earth">{title}</h3>
      <p className="text-body text-stone-400 mt-2 mb-6">{description}</p>
      {actionText && onAction && (
        <Button variant="secondary" onClick={onAction}>
          {actionText}
        </Button>
      )}
    </div>
  );
};
