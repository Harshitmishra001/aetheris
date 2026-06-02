import { ReactNode } from 'react';

interface CardProps {
  children: ReactNode;
  variant?: 'default' | 'glass';
  hover?: boolean;
  className?: string;
  id?: string;
}

export function Card({
  children,
  variant = 'default',
  hover = false,
  className = '',
  id,
}: CardProps) {
  const classes = [
    variant === 'glass' ? 'card-glass' : 'card',
    hover && variant === 'default' ? 'card-hover' : '',
    className,
  ]
    .filter(Boolean)
    .join(' ');

  return (
    <div className={classes} id={id}>
      {children}
    </div>
  );
}
