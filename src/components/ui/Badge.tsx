import { ReactNode } from 'react';

type BadgeVariant = 'default' | 'primary' | 'secondary' | 'success' | 'warning' | 'error';

interface BadgeProps {
  children: ReactNode;
  variant?: BadgeVariant;
  className?: string;
  id?: string;
}

export function Badge({
  children,
  variant = 'default',
  className = '',
  id,
}: BadgeProps) {
  const classes = [
    'badge',
    variant !== 'default' ? `badge-${variant}` : '',
    className,
  ]
    .filter(Boolean)
    .join(' ');

  return (
    <span className={classes} id={id}>
      {children}
    </span>
  );
}
