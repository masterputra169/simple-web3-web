import React, { memo, useState, useCallback, useEffect } from 'react';
import { usePrivy, useWallets } from '@privy-io/react-auth';
import { createWalletClient, custom } from 'viem';
import { base } from 'viem/chains';
import Text from '../atoms/Text';
import Button from '../atoms/Button';
import Spinner from '../atoms/Spinner';
import SwapInput from '../molecules/SwapInput';
import SwapDetails from '../molecules/SwapDetails';
import useSwap from '../../hooks/useSwap';
import { BASE_TOKENS, DEFAULT_SLIPPAGE_BPS } from '../../config/swap';
import { ExternalLinkIcon } from '../atoms/icons';

// Swap icon component
const SwapIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <path d="M7 16V4M7 4L3 8M7 4L11 8" />
    <path d="M17 8V20M17 20L21 16M17 20L13 16" />
  </svg>
);

const SwapCard = () => {
  const { authenticated, user } = usePrivy();
  const { wallets } = useWallets();
  const walletAddress = user?.wallet?.address;

  // State
  const [sellToken, setSellToken] = useState(BASE_TOKENS.ETH);
  const [buyToken, setBuyToken] = useState(BASE_TOKENS.USDC);
  const [sellAmount, setSellAmount] = useState('');
  const [slippageBps, setSlippageBps] = useState(DEFAULT_SLIPPAGE_BPS);
  const [walletClient, setWalletClient] = useState(null);
  const [showSettings, setShowSettings] = useState(false);

  // Swap hook
  const {
    isLoading,
    error,
    quote,
    txHash,
    txStatus,
    getQuote,
    swap,
    reset,
  } = useSwap(walletAddress, walletClient);

  // Initialize wallet client
  useEffect(() => {
    const initWalletClient = async () => {
      if (wallets && wallets.length > 0) {
        const wallet = wallets[0];
        const provider = await wallet.getEthereumProvider();
        
        const client = createWalletClient({
          chain: base,
          transport: custom(provider),
        });
        
        setWalletClient(client);
      }
    };

    if (authenticated) {
      initWalletClient();
    }
  }, [authenticated, wallets]);

  // Debounced quote fetch
  useEffect(() => {
    if (!sellAmount || !sellToken || !buyToken || !walletAddress) {
      return;
    }

    const timer = setTimeout(() => {
      getQuote(sellToken, buyToken, sellAmount, slippageBps);
    }, 500);

    return () => clearTimeout(timer);
  }, [sellAmount, sellToken, buyToken, slippageBps, walletAddress, getQuote]);

  // Switch tokens
  const handleSwitchTokens = useCallback(() => {
    setSellToken(buyToken);
    setBuyToken(sellToken);
    setSellAmount('');
    reset();
  }, [sellToken, buyToken, reset]);

  // Handle swap
  const handleSwap = useCallback(async () => {
    if (!quote) return;
    
    const result = await swap(sellToken, buyToken, sellAmount, slippageBps);
    
    if (result.success) {
      setSellAmount('');
    }
  }, [quote, swap, sellToken, buyToken, sellAmount, slippageBps]);

  // Slippage options
  const slippageOptions = [10, 50, 100]; // 0.1%, 0.5%, 1%

  // Button state
  const getButtonState = () => {
    if (!authenticated) return { text: 'Connect Wallet', disabled: true };
    if (!sellToken || !buyToken) return { text: 'Select tokens', disabled: true };
    if (!sellAmount || parseFloat(sellAmount) === 0) return { text: 'Enter amount', disabled: true };
    if (isLoading) return { text: 'Loading...', disabled: true };
    if (txStatus === 'pending') return { text: 'Confirming...', disabled: true };
    if (error) return { text: 'Try Again', disabled: false };
    if (!quote) return { text: 'Getting quote...', disabled: true };
    if (quote.issues?.balance) return { text: 'Insufficient balance', disabled: true };
    return { text: 'Swap', disabled: false };
  };

  const buttonState = getButtonState();

  return (
    <div className="glass rounded-2xl p-6 max-w-md mx-auto">
      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <Text variant="h4">Swap</Text>
        <button
          onClick={() => setShowSettings(!showSettings)}
          className="p-2 rounded-lg hover:bg-white/10 transition-colors"
          title="Settings"
        >
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <circle cx="12" cy="12" r="3" />
            <path d="M12 1v2M12 21v2M4.22 4.22l1.42 1.42M18.36 18.36l1.42 1.42M1 12h2M21 12h2M4.22 19.78l1.42-1.42M18.36 5.64l1.42-1.42" />
          </svg>
        </button>
      </div>

      {/* Slippage Settings */}
      {showSettings && (
        <div className="mb-4 p-4 bg-white/5 rounded-xl border border-white/10">
          <Text variant="small" color="muted" className="mb-3">
            Slippage Tolerance
          </Text>
          <div className="flex gap-2">
            {slippageOptions.map((bps) => (
              <button
                key={bps}
                onClick={() => setSlippageBps(bps)}
                className={`
                  px-3 py-1.5 rounded-lg text-sm font-medium transition-colors
                  ${slippageBps === bps 
                    ? 'bg-blue-500 text-white' 
                    : 'bg-white/10 text-white/70 hover:bg-white/15'}
                `}
              >
                {(bps / 100).toFixed(1)}%
              </button>
            ))}
            <input
              type="number"
              placeholder="Custom"
              value={!slippageOptions.includes(slippageBps) ? slippageBps / 100 : ''}
              onChange={(e) => setSlippageBps(Math.min(500, Math.max(1, parseFloat(e.target.value) * 100 || 50)))}
              className="w-20 px-3 py-1.5 rounded-lg bg-white/10 text-white text-sm outline-none focus:ring-1 focus:ring-blue-500"
            />
          </div>
        </div>
      )}

      {/* Sell Input */}
      <SwapInput
        label="You pay"
        token={sellToken}
        onTokenSelect={setSellToken}
        amount={sellAmount}
        onAmountChange={setSellAmount}
        excludeToken={buyToken}
        walletAddress={walletAddress}
      />

      {/* Switch Button */}
      <div className="flex justify-center -my-2 relative z-10">
        <button
          onClick={handleSwitchTokens}
          className="p-2 rounded-xl bg-slate-700 border border-white/10 hover:bg-slate-600 transition-colors"
        >
          <SwapIcon />
        </button>
      </div>

      {/* Buy Input */}
      <SwapInput
        label="You receive"
        token={buyToken}
        onTokenSelect={setBuyToken}
        amount={quote?.buyAmountFormatted || ''}
        onAmountChange={() => {}}
        excludeToken={sellToken}
        walletAddress={walletAddress}
        readOnly
        isLoading={isLoading && !!sellAmount}
      />

      {/* Swap Details */}
      {quote && !error && (
        <div className="mt-4">
          <SwapDetails quote={quote} slippageBps={slippageBps} />
        </div>
      )}

      {/* Error Message */}
      {error && (
        <div className="mt-4 p-3 bg-red-500/10 border border-red-500/30 rounded-xl">
          <Text variant="small" color="danger">
            ⚠️ {error}
          </Text>
        </div>
      )}

      {/* Success Message */}
      {txStatus === 'success' && txHash && (
        <div className="mt-4 p-3 bg-green-500/10 border border-green-500/30 rounded-xl">
          <Text variant="small" color="success" className="mb-2">
            ✅ Swap successful!
          </Text>
          <a
            href={`https://basescan.org/tx/${txHash}`}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-1 text-blue-400 text-sm hover:underline"
          >
            View on BaseScan
            <ExternalLinkIcon size={14} />
          </a>
        </div>
      )}

      {/* Swap Button */}
      <div className="mt-6">
        <Button
          onClick={handleSwap}
          variant="primary"
          size="lg"
          disabled={buttonState.disabled}
          loading={isLoading || txStatus === 'pending'}
          className="w-full"
        >
          {txStatus === 'pending' ? (
            <div className="flex items-center gap-2">
              <Spinner size="sm" color="white" />
              Confirming...
            </div>
          ) : (
            buttonState.text
          )}
        </Button>
      </div>

      {/* Security Notice */}
      <div className="mt-4 text-center">
        <Text variant="tiny" color="light">
          🔒 Powered by 0x Protocol • Secure & Non-custodial
        </Text>
      </div>
    </div>
  );
};

export default memo(SwapCard);