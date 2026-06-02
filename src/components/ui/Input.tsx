import { InputHTMLAttributes, ReactNode } from 'react';

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  icon?: ReactNode;
}

export function Input({
  label,
  error,
  icon,
  id,
  className = '',
  ...props
}: InputProps) {
  const inputClasses = [
    'input',
    error ? 'input-error' : '',
    className,
  ]
    .filter(Boolean)
    .join(' ');

  return (
    <div className="input-group">
      {label && (
        <label htmlFor={id} className="input-label">
          {label}
        </label>
      )}
      {icon ? (
        <div className="input-icon-wrapper">
          <span className="input-icon">{icon}</span>
          <input id={id} className={inputClasses} {...props} />
        </div>
      ) : (
        <input id={id} className={inputClasses} {...props} />
      )}
      {error && <p className="input-error-text">{error}</p>}
    </div>
  );
}
