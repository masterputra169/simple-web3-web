import React, { memo } from 'react';

const variants = {
  h1: 'text-4xl md:text-5xl font-bold',
  h2: 'text-3xl md:text-4xl font-bold',
  h3: 'text-2xl font-semibold',
  h4: 'text-xl font-semibold',
  body: 'text-base',
  small: 'text-sm',
  tiny: 'text-xs',
};

const colors = {
  default: 'text-white',
  muted: 'text-white/60',
  light: 'text-white/40',
  primary: 'text-blue-400',
  success: 'text-green-400',
  warning: 'text-yellow-400',
  danger: 'text-red-400',
  gradient: 'gradient-text',
};

const Text = ({
  children,
  variant = 'body',
  color = 'default',
  className = '',
  as,
  ...props
}) => {
  // Determine element type
  const Component = as || (variant.startsWith('h') ? variant : 'p');

  return (
    <Component
      className={`${variants[variant]} ${colors[color]} ${className}`}
      {...props}
    >
      {children}
    </Component>
  );
};

export default memo(Text);