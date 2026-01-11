import React, { memo, useState, useEffect, useRef } from 'react';
import Text from '../atoms/Text';
import Spinner from '../atoms/Spinner';
import useEthPrice from '../../hooks/useEthPrice';
import { formatUSD } from '../../utils/formatCurrency';

const EthPriceDisplay = ({ variant = 'compact' }) => {
  const { ethPrice, isLoading, isConnected } = useEthPrice();
  const [priceFlash, setPriceFlash] = useState(null); // 'up' | 'down' | null
  const prevPriceRef = useRef(null);
  const timerRef = useRef(null);

  // Flash effect saat harga berubah
  useEffect(() => {
    // Skip jika tidak ada harga
    if (ethPrice === null) return;
    
    // Skip jika ini harga pertama
    if (prevPriceRef.current === null) {
      prevPriceRef.current = ethPrice;
      return;
    }

    const priceDiff = ethPrice - prevPriceRef.current;
    
    // Update previous price
    prevPriceRef.current = ethPrice;
    
    // Skip jika perubahan terlalu kecil
    if (Math.abs(priceDiff) < 0.001) return;

    // Clear timer sebelumnya
    if (timerRef.current) {
      clearTimeout(timerRef.current);
    }

    // Set flash direction: positif = up (hijau), negatif = down (merah)
    setPriceFlash(priceDiff > 0 ? 'up' : 'down');

    // Reset flash setelah 500ms
    timerRef.current = setTimeout(() => {
      setPriceFlash(null);
    }, 500);

    return () => {
      if (timerRef.current) {
        clearTimeout(timerRef.current);
      }
    };
  }, [ethPrice]);

  const flashColor = priceFlash === 'up' 
    ? 'text-green-400' 
    : priceFlash === 'down' 
      ? 'text-red-400' 
      : '';

  // Compact variant
  if (variant === 'compact') {
    return (
      <div className="flex items-center gap-2 px-3 py-1.5 bg-white/5 rounded-lg border border-white/10">
        <div className="flex items-center gap-1.5">
          <div className={`h-1.5 w-1.5 rounded-full ${isConnected ? 'bg-green-400 animate-pulse' : 'bg-yellow-400'}`} />
          <Text variant="tiny" color="muted">ETH:</Text>
        </div>
        {isLoading ? (
          <Spinner size="sm" color="white" />
        ) : (
          <div className="flex items-center gap-1">
            <Text 
              variant="tiny" 
              className={`font-semibold tabular-nums transition-colors duration-150 ${flashColor}`}
            >
              {ethPrice ? formatUSD(ethPrice) : '--'}
            </Text>
            {priceFlash && (
              <span className={`text-xs ${flashColor}`}>
                {priceFlash === 'up' ? '▲' : '▼'}
              </span>
            )}
          </div>
        )}
      </div>
    );
  }

  // Detailed variant
  if (variant === 'detailed') {
    return (
      <div className="glass rounded-xl p-4">
        <div className="flex items-center justify-between mb-2">
          <Text variant="small" color="muted">ETH Price</Text>
          <div className="flex items-center gap-1.5">
            <div className={`h-2 w-2 rounded-full ${isConnected ? 'bg-green-400 animate-pulse' : 'bg-yellow-400'}`} />
            <Text variant="tiny" color={isConnected ? 'success' : 'warning'}>
              {isConnected ? 'Live' : 'Offline'}
            </Text>
          </div>
        </div>
        
        {isLoading ? (
          <div className="flex items-center gap-2">
            <Spinner size="sm" color="blue" />
            <Text variant="small" color="muted">Fetching price...</Text>
          </div>
        ) : (
          <div className="flex items-baseline gap-2">
            <Text 
              variant="h3" 
              className={`font-bold tabular-nums transition-colors duration-150 ${flashColor || 'text-blue-400'}`}
            >
              {ethPrice ? formatUSD(ethPrice) : '--'}
            </Text>
            {priceFlash && (
              <span className={`text-meds ${flashColor} transition-opacity duration-150`}>
                {priceFlash === 'up' ? '▲' : '▼'}
              </span>
            )}
          </div>
        )}
      </div>
    );
  }

  return null;
};

export default memo(EthPriceDisplay);