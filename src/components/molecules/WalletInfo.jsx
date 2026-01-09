import React, { memo, useMemo } from 'react';
import Text from '../atoms/Text';
import CopyButton from './CopyButton';
import USDValue from '../atoms/USDValue';
import useEthPrice from '../../hooks/useEthPrice';
import { formatBalanceWithUSD } from '../../utils/formatCurrency';

const WalletInfo = ({ address, balance, isLoading }) => {
  // Fetch ETH price
  const { ethPrice, isLoading: isPriceLoading } = useEthPrice();

  // Memoize formatted address
  const formattedAddress = useMemo(() => {
    if (!address) return '';
    return `${address.slice(0, 6)}...${address.slice(-4)}`;
  }, [address]);

  // Calculate USD value
  const usdValue = useMemo(() => {
    if (!balance || !ethPrice) return null;
    const { usdFormatted } = formatBalanceWithUSD(balance, ethPrice);
    return usdFormatted;
  }, [balance, ethPrice]);

  return (
    <div className="bg-white rounded-lg p-4 shadow-md border border-gray-200">
      <div className="space-y-3">
        <div>
          <Text variant="small" color="muted" className="mb-1">
            Wallet Address
          </Text>
          <div className="flex items-center gap-2">
            <Text variant="body" className="font-mono">
              {formattedAddress}
            </Text>
            <CopyButton text={address} size={16} />
          </div>
        </div>
        
        <div>
          <Text variant="small" color="muted" className="mb-1">
            Balance
          </Text>
          <div className="flex flex-col gap-1">
            {isLoading ? (
              <div className="flex items-center gap-2">
                <div className="animate-spin rounded-full h-4 w-4 border-2 border-blue-500 border-t-transparent"></div>
                <Text variant="small" color="muted">
                  Loading...
                </Text>
              </div>
            ) : (
              <>
                <Text variant="h4" className="font-bold text-blue-600">
                  {balance || '0.0000'} ETH
                </Text>
                {usdValue && (
                  <USDValue 
                    value={usdValue} 
                    isLoading={isPriceLoading}
                    size="sm"
                  />
                )}
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

// Memo dengan custom comparison
export default memo(WalletInfo, (prevProps, nextProps) => {
  return (
    prevProps.address === nextProps.address &&
    prevProps.balance === nextProps.balance &&
    prevProps.isLoading === nextProps.isLoading
  );
});