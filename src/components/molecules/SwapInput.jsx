import React, { memo } from 'react';
import Text from '../atoms/Text';
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
        onAmountChange(maxAmount.toString());
      } else {
        onAmountChange(balance);
      }
    }
  };

  return (
    <div className="bg-white/5 rounded-2xl p-4 border border-white/10">
      {/* Header */}
      <div className="flex justify-between items-center mb-3">
        <Text variant="small" color="muted">
          {label}
        </Text>
        {walletAddress && token && (
          <div className="flex items-center gap-2">
            <Text variant="tiny" color="muted">
              Balance: {balanceLoading ? '...' : balance || '0'}
            </Text>
            {!readOnly && (
              <button
                onClick={handleMaxClick}
                className="text-xs text-blue-400 hover:text-blue-300 font-semibold"
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
        <div className="flex-1">
          {isLoading ? (
            <div className="h-10 bg-white/5 rounded-lg animate-pulse" />
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
                ${readOnly ? 'cursor-default' : ''}
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
    </div>
  );
};

export default memo(SwapInput);