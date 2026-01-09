import React, { memo } from 'react';
import Text from '../atoms/Text';
import useEthPrice from '../../hooks/useEthPrice';
import { formatUSD } from '../../utils/formatCurrency';

/**
 * Component untuk display current ETH price
 * Optional: bisa ditampilkan di header atau footer
 */
const EthPriceDisplay = ({ variant = 'compact' }) => {
  const { ethPrice, isLoading, error } = useEthPrice();

  if (error) return null;

  if (variant === 'compact') {
    return (
      <div className="flex items-center gap-2 px-3 py-1.5 bg-gray-100 rounded-lg">
        <Text variant="tiny" color="muted">
          ETH:
        </Text>
        {isLoading ? (
          <div className="animate-spin rounded-full h-3 w-3 border-2 border-gray-400 border-t-transparent"></div>
        ) : (
          <Text variant="tiny" className="font-semibold">
            {formatUSD(ethPrice)}
          </Text>
        )}
      </div>
    );
  }

  if (variant === 'detailed') {
    return (
      <div className="bg-gradient-to-r from-gray-50 to-gray-100 rounded-lg p-3 border border-gray-200">
        <Text variant="small" color="muted" className="mb-1">
          Current ETH Price
        </Text>
        {isLoading ? (
          <div className="flex items-center gap-2">
            <div className="animate-spin rounded-full h-4 w-4 border-2 border-blue-500 border-t-transparent"></div>
            <Text variant="small" color="muted">
              Loading...
            </Text>
          </div>
        ) : (
          <Text variant="h4" className="font-bold text-gray-900">
            {formatUSD(ethPrice)}
          </Text>
        )}
        <Text variant="tiny" color="light" className="mt-1">
          via CoinGecko • Updates every 60s
        </Text>
      </div>
    );
  }

  return null;
};

export default memo(EthPriceDisplay);