import React from 'react';

export type ItemStatusType =
  | 'available'
  | 'reserved'
  | 'completed'
  | 'hidden'
  | 'expired'
  | 'pending';

export interface BadgeProps {
  status: ItemStatusType;
  className?: string;
}

export const Badge: React.FC<BadgeProps> = ({ status, className = '' }) => {
  // Statuses must be readable by text AND shape/icon (not color alone, per spec)
  const config: Record<
    ItemStatusType,
    { label: string; bg: string; text: string; border: string; icon: string }
  > = {
    available: {
      label: 'Available',
      bg: 'bg-success-light',
      text: 'text-success-text',
      border: 'border-success/30',
      icon: '●', // filled circle
    },
    reserved: {
      label: 'Reserved',
      bg: 'bg-warning-light',
      text: 'text-warning-text',
      border: 'border-warning/30',
      icon: '◆', // diamond
    },
    completed: {
      label: 'Completed',
      bg: 'bg-stone-50',
      text: 'text-stone-400',
      border: 'border-stone-200',
      icon: '✓', // check
    },
    hidden: {
      label: 'Hidden',
      bg: 'bg-beige-100',
      text: 'text-earth-100',
      border: 'border-beige-200',
      icon: '⊘', // slashed circle
    },
    expired: {
      label: 'Expired',
      bg: 'bg-stone-100',
      text: 'text-stone-400',
      border: 'border-stone-300',
      icon: '✕', // cross
    },
    pending: {
      label: 'Pending',
      bg: 'bg-info-light',
      text: 'text-info-text',
      border: 'border-info/30',
      icon: '⏳', // hour glass
    },
  };

  const item = config[status] || config.available;

  return (
    <span
      className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-sm text-caption font-medium border ${item.bg} ${item.text} ${item.border} ${className}`}
      role="status"
    >
      <span aria-hidden="true" className="text-[10px] leading-none">
        {item.icon}
      </span>
      <span>{item.label}</span>
    </span>
  );
};
