import React, { memo } from 'react';

const sizes = {
  sm: 'h-4 w-4 border-2',
  md: 'h-6 w-6 border-2',
  lg: 'h-10 w-10 border-3',
  xl: 'h-14 w-14 border-4',
};

const colors = {
  white: 'border-white/30 border-t-white',
  blue: 'border-blue-500/30 border-t-blue-500',
  primary: 'border-blue-600/30 border-t-blue-600',
};

const Spinner = ({ size = 'md', color = 'blue', className = '' }) => {
  return (
    <div
      className={`
        animate-spin rounded-full mx-auto
        ${sizes[size]}
        ${colors[color]}
        ${className}
      `}
    />
  );
};

export default memo(Spinner);