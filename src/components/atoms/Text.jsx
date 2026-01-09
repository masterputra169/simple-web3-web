import React from 'react';

const Text = ({ 
  children, 
  variant = 'body', 
  className = '',
  color = 'default'
}) => {
  const variants = {
    h1: 'text-4xl font-bold',
    h2: 'text-3xl font-bold',
    h3: 'text-2xl font-semibold',
    h4: 'text-xl font-semibold',
    body: 'text-base',
    small: 'text-sm',
    tiny: 'text-xs'
  };

  const colors = {
    default: 'text-gray-900',
    muted: 'text-gray-600',
    light: 'text-gray-400',
    primary: 'text-blue-600',
    white: 'text-white'
  };

  const Component = variant.startsWith('h') ? variant : 'p';

  return (
    <Component className={`${variants[variant]} ${colors[color]} ${className}`}>
      {children}
    </Component>
  );
};

export default Text;