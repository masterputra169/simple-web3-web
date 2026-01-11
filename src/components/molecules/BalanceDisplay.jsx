import React, { memo, useMemo, useState, useEffect } from 'react';
import Text from '../atoms/Text';
import Spinner from '../atoms/Spinner';
import useEthPrice from '../../hooks/useEthPrice';
import { formatBalanceWithUSD } from '../../utils/formatCurrency';

const BalanceDisplay = ({ balance, rawBalance, isLoading = false, size = 'lg' }) => {
  const { ethPrice, isLoading: isPriceLoading } = useEthPrice();
  const [usdFlash, setUsdFlash] = useState(false);

  const usdValue = useMemo(() => {
    const balanceToUse = rawBalance || balance;
    if (!balanceToUse || !ethPrice) return null;
    return formatBalanceWithUSD(balanceToUse, ethPrice).usdFormatted;
  }, [rawBalance, balance, ethPrice]);

  // Flash effect saat USD value berubah
  useEffect(() => {
    if (usdValue) {
      setUsdFlash(true);
      const timer = setTimeout(() => setUsdFlash(false), 200);
      return () => clearTimeout(timer);
    }
  }, [usdValue]);

  const textSizes = {
    sm: { balance: 'body', usd: 'tiny' },
    md: { balance: 'h4', usd: 'small' },
    lg: { balance: 'h2', usd: 'body' },
  };

  if (isLoading && !balance) {
    return (
      <div className="flex items-center gap-3">
        <Spinner size="md" color="blue" />
        <Text variant="body" color="muted">Loading balance...</Text>
      </div>
    );
  }

  return (
    <div className="space-y-1">
      <div className="flex items-baseline gap-2">
        <Text variant={textSizes[size].balance} className="font-bold gradient-text tabular-nums">
          {balance || '0.0000'}
        </Text>
        <Text variant={textSizes[size].usd} color="muted">ETH</Text>
        {isLoading && balance && (
          <Spinner size="sm" color="blue" className="ml-2" />
        )}
      </div>
      <div className="flex items-center gap-2">
        {ethPrice ? (
          <Text 
            variant={textSizes[size].usd} 
            color="light" 
            className={`tabular-nums transition-all duration-150 ${usdFlash ? 'text-blue-400' : ''}`}
          >
            ≈ {usdValue || '$0.00'}
          </Text>
        ) : isPriceLoading ? (
          <Text variant={textSizes[size].usd} color="light" className="animate-pulse">
            Loading USD...
          </Text>
        ) : null}
        <div className="h-1.5 w-1.5 rounded-full bg-green-400 animate-pulse" title="Real-time" />
      </div>
    </div>
  );
};

export default memo(BalanceDisplay);