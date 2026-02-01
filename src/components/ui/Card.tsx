import React from 'react';

type CardProps = {
  children: React.ReactNode;
  className?: string;
} & React.HTMLAttributes<HTMLDivElement>;

export const Card: React.FC<CardProps> = ({
  children,
  className = '',
  ...props
}) => {
  return (
    <div
      className={`glass-card ${className}`}
      {...props}
    >
      {children}
    </div>
  );
};
