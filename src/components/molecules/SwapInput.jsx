import React, { memo } from 'react';
import Text from '../atoms/Text';
import Spinner from '../atoms/Spinner';
import TokenSelector from './TokenSelector';
import useTokenBalance from '../../hooks/useTokenBalance';
import { sanitizeAmountInput } from '../../utils/swapUtils';

const SwapInput = ({
  label,
  token,
  onTokenSelect,
  amount,
  onAmountChange,
  excludeToken,
  walletAddress,
  readOnly = false,
  isLoading = false,
}) => {
  const { balance, isLoading: balanceLoading } = useTokenBalance(walletAddress, token);

  const handleAmountChange = (e) => {
    const sanitized = sanitizeAmountInput(e.target.value);
    onAmountChange(sanitized);
  };

  const handleMaxClick = () => {
    if (balance && !readOnly) {
      // Leave some ETH for gas if selling ETH
      if (token?.symbol === 'ETH') {
        const maxAmount = Math.max(0, parseFloat(balance) - 0.001);
        onAmountChange(maxAmount > 0 ? maxAmount.toString() : '0');
      } else {
        onAmountChange(balance);
      }
    }
  };

  return (
    <div className="bg-white/5 rounded-2xl p-4 border border-white/10 hover:border-white/20 transition-colors">
      {/* Header */}
      <div className="flex justify-between items-center mb-3">
        <Text variant="small" color="muted">
          {label}
        </Text>
        {walletAddress && token && (
          <div className="flex items-center gap-2">
            <Text variant="tiny" color="muted">
              Balance:{' '}
              {balanceLoading ? (
                <span className="inline-block w-12 h-3 bg-white/10 rounded animate-pulse" />
              ) : (
                <span className="text-white/80">{balance || '0'}</span>
              )}
            </Text>
            {!readOnly && parseFloat(balance) > 0 && (
              <button
                onClick={handleMaxClick}
                className="text-xs text-blue-400 hover:text-blue-300 font-semibold px-1.5 py-0.5 rounded hover:bg-blue-500/10 transition-colors"
              >
                MAX
              </button>
            )}
          </div>
        )}
      </div>

      {/* Input Row */}
      <div className="flex items-center gap-3">
        {/* Amount Input */}
        <div className="flex-1 min-w-0">
          {isLoading ? (
            <div className="flex items-center gap-2 h-10">
              <Spinner size="sm" color="blue" />
              <Text variant="small" color="muted">Getting quote...</Text>
            </div>
          ) : (
            <input
              type="text"
              inputMode="decimal"
              placeholder="0.0"
              value={amount}
              onChange={handleAmountChange}
              readOnly={readOnly}
              className={`
                w-full bg-transparent text-2xl font-bold text-white
                placeholder-white/30 outline-none
                ${readOnly ? 'cursor-default text-white/90' : ''}
              `}
            />
          )}
        </div>

        {/* Token Selector */}
        <TokenSelector
          selectedToken={token}
          onSelect={onTokenSelect}
          excludeToken={excludeToken}
          disabled={readOnly && !token}
        />
      </div>

      {/* USD Value - Optional */}
      {amount && parseFloat(amount) > 0 && !isLoading && (
        <div className="mt-2 pt-2 border-t border-white/5">
          <Text variant="tiny" color="light">
            {/* TODO: Add USD conversion */}
          </Text>
        </div>
      )}
    </div>
  );
};

export default memo(SwapInput);