import React from 'react';

export interface FilterChipProps {
  label: string;
  isSelected?: boolean;
  onClick: () => void;
  icon?: React.ReactNode;
}

export const FilterChip: React.FC<FilterChipProps> = ({
  label,
  isSelected = false,
  onClick,
  icon,
}) => {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-sm text-body-sm font-medium transition-all duration-150 cursor-pointer border ${
        isSelected
          ? 'bg-clay-300 text-ivory border-clay-400 shadow-paper'
          : 'bg-ivory hover:bg-beige-50 text-earth border-beige-200 hover:border-stone-200'
      }`}
      aria-pressed={isSelected}
    >
      {icon && <span className="text-current">{icon}</span>}
      <span>{label}</span>
    </button>
  );
};
