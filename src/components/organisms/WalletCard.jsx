import React, { memo } from 'react';
import Text from '../atoms/Text';
import Button from '../atoms/Button';
import WalletInfo from '../molecules/WalletInfo';
import EthPriceDisplay from '../molecules/EthPriceDisplay';
import { RefreshIcon } from '../atoms/icons';

const WalletCard = ({
  walletAddress,
  balance,
  rawBalance,
  isLoading,
  error,
  onRefresh,
}) => {
  return (
    <div className="glass rounded-2xl p-6 md:p-8">
      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <div className="flex items-center gap-3">
          <Text variant="h3">Your Wallet</Text>
          <div className="flex items-center gap-1.5 px-2 py-1 bg-green-500/20 rounded-full">
            <div className="h-2 w-2 rounded-full bg-green-400 animate-pulse" />
            <Text variant="tiny" color="success">Live</Text>
          </div>
        </div>
        <Button
          onClick={onRefresh}
          variant="ghost"
          size="sm"
          loading={isLoading}
          disabled={isLoading}
          title="Force refresh"
        >
          <RefreshIcon size={16} className={`mx-auto ${isLoading ? 'animate-spin' : ''}`} />
          <span className="hidden sm:inline">Refresh</span>
        </Button>
      </div>

      {/* Wallet Info */}
      <WalletInfo
        address={walletAddress}
        balance={balance}
        rawBalance={rawBalance}
        isLoading={isLoading}
      />

      {/* Error Message */}
      {error && (
        <div className="mt-4 p-3 bg-red-500/10 border border-red-500/30 rounded-xl">
          <Text variant="small" color="danger">
            ⚠️ {error}
          </Text>
        </div>
      )}

      {/* ETH Price */}
      <div className="mt-6 pt-6 border-t border-white/10">
        <EthPriceDisplay variant="detailed" />
      </div>
    </div>
  );
};

export default memo(WalletCard);