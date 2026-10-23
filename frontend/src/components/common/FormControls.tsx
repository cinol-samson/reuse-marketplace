import React from 'react';

export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  hint?: string;
}

export const Input: React.FC<InputProps> = ({
  label,
  error,
  hint,
  id,
  className = '',
  disabled,
  ...props
}) => {
  const inputId = id || (label ? label.toLowerCase().replace(/\s+/g, '-') : undefined);

  return (
    <div className="w-full flex flex-col gap-1.5 text-left">
      {label && (
        <label
          htmlFor={inputId}
          className="text-body-sm font-medium text-earth select-none"
        >
          {label}
        </label>
      )}
      <input
        id={inputId}
        disabled={disabled}
        className={`w-full px-3.5 py-2 text-body bg-ivory-50 text-earth border rounded-md shadow-inner-warm transition-colors duration-150 placeholder:text-stone-300 focus:bg-ivory focus:border-clay-300 focus-visible:ring-1 focus-visible:ring-clay-300 disabled:opacity-50 disabled:bg-beige-50 ${
          error ? 'border-error text-error-text' : 'border-beige-200 hover:border-stone-200'
        } ${className}`}
        aria-invalid={!!error}
        aria-describedby={error ? `${inputId}-error` : hint ? `${inputId}-hint` : undefined}
        {...props}
      />
      {error && (
        <p id={`${inputId}-error`} className="text-caption text-error-text mt-0.5">
          {error}
        </p>
      )}
      {hint && !error && (
        <p id={`${inputId}-hint`} className="text-caption text-stone-400 mt-0.5">
          {hint}
        </p>
      )}
    </div>
  );
};

export interface TextareaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string;
  error?: string;
  hint?: string;
}

export const Textarea: React.FC<TextareaProps> = ({
  label,
  error,
  hint,
  id,
  className = '',
  disabled,
  rows = 3,
  ...props
}) => {
  const textareaId = id || (label ? label.toLowerCase().replace(/\s+/g, '-') : undefined);

  return (
    <div className="w-full flex flex-col gap-1.5 text-left">
      {label && (
        <label
          htmlFor={textareaId}
          className="text-body-sm font-medium text-earth select-none"
        >
          {label}
        </label>
      )}
      <textarea
        id={textareaId}
        rows={rows}
        disabled={disabled}
        className={`w-full px-3.5 py-2 text-body bg-ivory-50 text-earth border rounded-md shadow-inner-warm transition-colors duration-150 placeholder:text-stone-300 focus:bg-ivory focus:border-clay-300 focus-visible:ring-1 focus-visible:ring-clay-300 disabled:opacity-50 disabled:bg-beige-50 resize-y ${
          error ? 'border-error text-error-text' : 'border-beige-200 hover:border-stone-200'
        } ${className}`}
        aria-invalid={!!error}
        aria-describedby={error ? `${textareaId}-error` : hint ? `${textareaId}-hint` : undefined}
        {...props}
      />
      {error && (
        <p id={`${textareaId}-error`} className="text-caption text-error-text mt-0.5">
          {error}
        </p>
      )}
      {hint && !error && (
        <p id={`${textareaId}-hint`} className="text-caption text-stone-400 mt-0.5">
          {hint}
        </p>
      )}
    </div>
  );
};

export interface SelectProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
  label?: string;
  error?: string;
  options: Array<{ value: string; label: string }>;
}

export const Select: React.FC<SelectProps> = ({
  label,
  error,
  options,
  id,
  className = '',
  ...props
}) => {
  const selectId = id || (label ? label.toLowerCase().replace(/\s+/g, '-') : undefined);

  return (
    <div className="w-full flex flex-col gap-1.5 text-left">
      {label && (
        <label htmlFor={selectId} className="text-body-sm font-medium text-earth select-none">
          {label}
        </label>
      )}
      <select
        id={selectId}
        className={`w-full px-3.5 py-2 text-body bg-ivory-50 text-earth border rounded-md shadow-inner-warm transition-colors duration-150 focus:bg-ivory focus:border-clay-300 focus-visible:ring-1 focus-visible:ring-clay-300 cursor-pointer ${
          error ? 'border-error' : 'border-beige-200 hover:border-stone-200'
        } ${className}`}
        {...props}
      >
        {options.map((opt) => (
          <option key={opt.value} value={opt.value}>
            {opt.label}
          </option>
        ))}
      </select>
      {error && <p className="text-caption text-error-text mt-0.5">{error}</p>}
    </div>
  );
};

export interface CheckboxProps extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'type'> {
  label: React.ReactNode;
  description?: string;
}

export const Checkbox: React.FC<CheckboxProps> = ({
  label,
  description,
  id,
  className = '',
  ...props
}) => {
  const generatedId = React.useId();
  const checkboxId = id || generatedId;

  return (
    <div className="flex items-start gap-2.5 text-left">
      <input
        type="checkbox"
        id={checkboxId}
        className={`mt-1 h-4 w-4 rounded text-clay-300 border-beige-200 focus:ring-clay-400 focus:ring-offset-ivory cursor-pointer ${className}`}
        {...props}
      />
      <label htmlFor={checkboxId} className="text-body-sm text-earth cursor-pointer select-none">
        <span className="font-medium text-earth">{label}</span>
        {description && <p className="text-caption text-stone-400 mt-0.5">{description}</p>}
      </label>
    </div>
  );
};
