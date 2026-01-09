import React, { memo } from 'react';
import Text from './Text';

/**
 * Component untuk display USD value
 * @param {string} value - Formatted USD value (e.g., "$1,234.56")
 * @param {boolean} isLoading - Loading state
 * @param {string} size - Size variant (sm, md, lg)
 */
const USDValue = ({ value, isLoading, size = 'sm' }) => {
  const sizeVariants = {
    sm: 'small',
    md: 'body',
    lg: 'h4',
  };

  if (isLoading) {
    return (
      <Text variant={sizeVariants[size]} color="muted" className="animate-pulse">
        Loading USD...
      </Text>
    );
  }

  return (
    <Text variant={sizeVariants[size]} color="muted">
      ~{value}
    </Text>
  );
};

export default memo(USDValue);