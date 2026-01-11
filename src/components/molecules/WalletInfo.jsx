import React, { memo, useMemo } from 'react';
import Text from '../atoms/Text';
import CopyButton from './CopyButton';
import BalanceDisplay from './BalanceDisplay';
import { truncateAddress } from '../../utils/formatBalance';
import { ExternalLinkIcon } from '../atoms/icons';

const WalletInfo = ({ address, balance, isLoading }) => {
  const formattedAddress = useMemo(() => {
    return truncateAddress(address, 8, 6);
  }, [address]);

  const explorerUrl = `https://basescan.org/address/${address}`;

  return (
    <div className="space-y-6">
      {/* Address Section */}
      <div>
        <Text variant="small" color="muted" className="mb-2">
          Wallet Address
        </Text>
        <div className="flex items-center gap-3 flex-wrap">
          <Text variant="body" className="font-mono bg-white/5 px-3 py-2 rounded-lg">
            {formattedAddress}
          </Text>
          <CopyButton text={address} size={16} />
          <a
            href={explorerUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="p-2 rounded-lg hover:bg-white/10 transition-colors"
            title="View on BaseScan"
          >
            <ExternalLinkIcon size={16} className="text-white/50 hover:text-white/80" />
          </a>
        </div>
      </div>

      {/* Balance Section */}
      <div>
        <Text variant="small" color="muted" className="mb-2">
          Balance
        </Text>
        <BalanceDisplay balance={balance} isLoading={isLoading} size="lg" />
      </div>
    </div>
  );
};

export default memo(WalletInfo, (prev, next) => {
  return (
    prev.address === next.address &&
    prev.balance === next.balance &&
    prev.isLoading === next.isLoading
  );
});