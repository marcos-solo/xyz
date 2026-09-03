import React from 'react';

interface IatLogoProps {
  className?: string;
  variant?: 'full' | 'mark' | 'horizontal';
  size?: 'sm' | 'md' | 'lg' | 'xl';
}

export const IatLogo: React.FC<IatLogoProps> = ({
  className = '',
  size = 'md',
}) => {
  const sizeClasses = {
    sm: 'h-9 max-w-[140px]',
    md: 'h-13 max-w-[190px]',
    lg: 'h-18 max-w-[240px]',
    xl: 'h-24 max-w-[320px]',
  };

  return (
    <div className={`inline-flex items-center justify-center select-none ${className}`}>
      <img
        src="/iat-logo.png"
        alt="Institute of Advanced Technology Ltd"
        className={`object-contain ${sizeClasses[size]}`}
      />
    </div>
  );
};
