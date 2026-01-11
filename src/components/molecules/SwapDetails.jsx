import React, { memo } from 'react';
import Text from '../atoms/Text';
import { getPriceImpactSeverity } from '../../utils/swapUtils';

const SwapDetails = ({ quote, slippageBps }) => {
  if (!quote) return null;

  const priceImpact = quote.estimatedPriceImpact 
    ? parseFloat(quote.estimatedPriceImpact) 
    : 0;
  
  const impactSeverity = getPriceImpactSeverity(priceImpact);
  
  const impactColors = {
    low: 'text-green-400',
    medium: 'text-yellow-400',
    high: 'text-orange-400',
    critical: 'text-red-400',
  };

  const rate = quote.buyAmountFormatted && quote.sellAmountFormatted
    ? (parseFloat(quote.buyAmountFormatted) / parseFloat(quote.sellAmountFormatted)).toFixed(6)
    : '0';

  return (
    <div className="bg-white/5 rounded-xl p-4 space-y-3 border border-white/10">
      {/* Exchange Rate */}
      <div className="flex justify-between items-center">
        <Text variant="small" color="muted">Rate</Text>
        <Text variant="small">
          1 {quote.sellToken?.symbol} = {rate} {quote.buyToken?.symbol}
        </Text>
      </div>

      {/* Price Impact */}
      <div className="flex justify-between items-center">
        <Text variant="small" color="muted">Price Impact</Text>
        <Text variant="small" className={impactColors[impactSeverity]}>
          {priceImpact.toFixed(2)}%
          {impactSeverity === 'critical' && ' ⚠️'}
        </Text>
      </div>

      {/* Minimum Received */}
      <div className="flex justify-between items-center">
        <Text variant="small" color="muted">Minimum Received</Text>
        <Text variant="small">
          {quote.minBuyAmountFormatted} {quote.buyToken?.symbol}
        </Text>
      </div>

      {/* Slippage */}
      <div className="flex justify-between items-center">
        <Text variant="small" color="muted">Slippage Tolerance</Text>
        <Text variant="small">
          {(slippageBps / 100).toFixed(1)}%
        </Text>
      </div>

      {/* Gas Estimate */}
      <div className="flex justify-between items-center">
        <Text variant="small" color="muted">Estimated Gas</Text>
        <Text variant="small">
          ~{quote.gasCostETH?.toFixed(6)} ETH
        </Text>
      </div>

      {/* Route */}
      {quote.route?.fills && quote.route.fills.length > 0 && (
        <div className="pt-2 border-t border-white/10">
          <Text variant="tiny" color="muted" className="mb-2">
            Route
          </Text>
          <div className="flex flex-wrap gap-1">
            {quote.route.fills.slice(0, 3).map((fill, i) => (
              <span 
                key={i}
                className="px-2 py-0.5 bg-blue-500/20 text-blue-400 text-xs rounded-full"
              >
                {fill.source}
              </span>
            ))}
            {quote.route.fills.length > 3 && (
              <span className="px-2 py-0.5 bg-white/10 text-white/60 text-xs rounded-full">
                +{quote.route.fills.length - 3} more
              </span>
            )}
          </div>
        </div>
      )}

      {/* High Impact Warning */}
      {impactSeverity === 'critical' && (
        <div className="p-3 bg-red-500/10 border border-red-500/30 rounded-lg">
          <Text variant="small" color="danger">
            ⚠️ High price impact! You may receive significantly less than expected.
          </Text>
        </div>
      )}
    </div>
  );
};

export default memo(SwapDetails);