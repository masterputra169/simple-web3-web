import React, { memo, useState, useCallback, useEffect } from 'react';
import { usePrivy, useWallets } from '@privy-io/react-auth';
import { createWalletClient, createPublicClient, custom, http } from 'viem';
import { base } from 'viem/chains';
import Text from '../atoms/Text';
import Button from '../atoms/Button';
import Spinner from '../atoms/Spinner';
import SwapInput from '../molecules/SwapInput';
import SwapDetails from '../molecules/SwapDetails';
import Notification from '../molecules/Notification';
import useSwap from '../../hooks/useSwap';
import { BASE_TOKENS, DEFAULT_SLIPPAGE_BPS } from '../../config/swap';
import { ExternalLinkIcon } from '../atoms/icons';

// Settings Icon
const SettingsIcon = memo(() => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="12" r="3" />
    <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z" />
  </svg>
));

// Swap Arrow Icon
const SwapArrowIcon = memo(() => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M7 16V4M7 4L3 8M7 4L11 8" />
    <path d="M17 8V20M17 20L21 16M17 20L13 16" />
  </svg>
));

// Base chain ID
const BASE_CHAIN_ID = 8453;

// Public client for reading blockchain data
const publicClient = createPublicClient({
  chain: base,
  transport: http('https://mainnet.base.org'),
});

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
  const [currentChainId, setCurrentChainId] = useState(null);
  const [isSwitchingNetwork, setIsSwitchingNetwork] = useState(false);
  
  // Notification state
  const [notification, setNotification] = useState(null);

  // Swap hook
  const {
    isLoading,
    error,
    quote,
    txHash,
    txStatus,
    txDetails,
    approvalNeeded,
    approvalTarget,
    isApproving,
    getQuote,
    swap,
    reset,
    switchToBase,
    approveToken,
  } = useSwap(walletAddress, walletClient, publicClient);

  // Show notification helper
  const showNotification = useCallback((type, title, message, hash = null) => {
    setNotification({ type, title, message, txHash: hash });
  }, []);

  // Close notification
  const closeNotification = useCallback(() => {
    setNotification(null);
  }, []);

  // Initialize wallet client and check chain
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

        try {
          const chainId = await client.getChainId();
          setCurrentChainId(chainId);
        } catch (err) {
          console.error('Failed to get chain ID:', err);
        }

        provider.on('chainChanged', (chainIdHex) => {
          const newChainId = parseInt(chainIdHex, 16);
          setCurrentChainId(newChainId);
        });
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

  // Handle network switch
  const handleSwitchNetwork = async () => {
    setIsSwitchingNetwork(true);
    try {
      const switched = await switchToBase();
      if (switched) {
        showNotification('success', 'Network Switched', 'Successfully switched to Base network');
        const chainId = await walletClient.getChainId();
        setCurrentChainId(chainId);
      } else {
        showNotification('error', 'Switch Failed', 'Failed to switch network. Please try manually.');
      }
    } catch (err) {
      showNotification('error', 'Switch Failed', err.message);
    } finally {
      setIsSwitchingNetwork(false);
    }
  };

  // Handle token approval
  const handleApprove = async () => {
    if (!approvalTarget) {
      showNotification('error', 'Approval Error', 'No approval target found. Please refresh quote.');
      return;
    }
    
    try {
      showNotification('loading', 'Approving Token', `Approving ${sellToken.symbol} for trading...`);
      
      const result = await approveToken(sellToken.address, approvalTarget);
      
      if (result.success) {
        showNotification('success', 'Approval Successful', `${sellToken.symbol} approved for trading`, result.hash);
        // Refresh quote after approval
        await getQuote(sellToken, buyToken, sellAmount, slippageBps);
      }
    } catch (err) {
      showNotification('error', 'Approval Failed', err.message);
    }
  };

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
    
    showNotification('loading', 'Processing Swap', 'Please confirm the transaction in your wallet...');
    
    const result = await swap(sellToken, buyToken, sellAmount, slippageBps);
    
    if (result.success) {
      showNotification(
        'success', 
        'Swap Successful! 🎉', 
        `Swapped ${sellAmount} ${sellToken.symbol} for ${quote.buyAmountFormatted} ${buyToken.symbol}`,
        result.txHash
      );
      setSellAmount('');
    } else if (result.needsApproval) {
      showNotification('warning', 'Approval Required', `Please approve ${sellToken.symbol} before swapping`);
    } else {
      showNotification('error', 'Swap Failed', result.error);
    }
  }, [quote, swap, sellToken, buyToken, sellAmount, slippageBps, showNotification]);

  const isWrongNetwork = currentChainId && currentChainId !== BASE_CHAIN_ID;

  // Slippage options
  const slippageOptions = [10, 50, 100];

  // Button state
  const getButtonState = () => {
    if (!authenticated) return { text: 'Connect Wallet', disabled: true };
    if (isWrongNetwork) return { text: 'Switch to Base', disabled: false, action: 'switch' };
    if (approvalNeeded && !isApproving) return { text: `Approve ${sellToken.symbol}`, disabled: false, action: 'approve' };
    if (isApproving) return { text: 'Approving...', disabled: true };
    if (!sellToken || !buyToken) return { text: 'Select tokens', disabled: true };
    if (!sellAmount || parseFloat(sellAmount) === 0) return { text: 'Enter amount', disabled: true };
    if (isLoading) return { text: 'Getting quote...', disabled: true };
    if (txStatus === 'pending') return { text: 'Confirming...', disabled: true };
    if (!quote) return { text: 'Enter amount', disabled: true };
    if (quote.issues?.balance) return { text: 'Insufficient balance', disabled: true };
    return { text: 'Swap', disabled: false, action: 'swap' };
  };

  const buttonState = getButtonState();

  // Handle button click
  const handleButtonClick = async () => {
    if (buttonState.action === 'switch') {
      await handleSwitchNetwork();
    } else if (buttonState.action === 'approve') {
      await handleApprove();
    } else if (buttonState.action === 'swap') {
      await handleSwap();
    }
  };

  return (
    <>
      {/* Notification */}
      {notification && (
        <Notification
          type={notification.type}
          title={notification.title}
          message={notification.message}
          txHash={notification.txHash}
          onClose={closeNotification}
          autoClose={notification.type !== 'loading'}
        />
      )}

      <div className="glass rounded-2xl p-6 max-w-md mx-auto relative">
        {/* Header */}
        <div className="flex justify-between items-center mb-6">
          <Text variant="h4">Swap</Text>
          <button
            onClick={() => setShowSettings(!showSettings)}
            className={`p-2 rounded-lg hover:bg-white/10 transition-colors ${showSettings ? 'bg-white/10' : ''}`}
            title="Settings"
          >
            <SettingsIcon />
          </button>
        </div>

        {/* Slippage Settings */}
        {showSettings && (
          <div className="mb-4 p-4 bg-white/5 rounded-xl border border-white/10">
            <Text variant="small" color="muted" className="mb-3">
              Slippage Tolerance
            </Text>
            <div className="flex gap-2 flex-wrap">
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

        {/* Wrong Network Warning */}
        {isWrongNetwork && (
          <div className="mb-4 p-3 bg-yellow-500/10 border border-yellow-500/30 rounded-xl flex items-center gap-3">
            <span className="text-xl">⚠️</span>
            <div className="flex-1">
              <Text variant="small" color="warning" className="font-semibold">
                Wrong Network
              </Text>
              <Text variant="tiny" color="muted">
                Please switch to Base network to swap
              </Text>
            </div>
          </div>
        )}

        {/* Approval Required Warning */}
        {approvalNeeded && !isWrongNetwork && (
          <div className="mb-4 p-3 bg-blue-500/10 border border-blue-500/30 rounded-xl flex items-center gap-3">
            <span className="text-xl">🔐</span>
            <div className="flex-1">
              <Text variant="small" color="primary" className="font-semibold">
                Approval Required
              </Text>
              <Text variant="tiny" color="muted">
                Approve {sellToken.symbol} to enable swapping
              </Text>
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
            className="p-2 rounded-xl bg-slate-700 border border-white/10 hover:bg-slate-600 transition-colors hover:scale-110 active:scale-95"
          >
            <SwapArrowIcon />
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
        {error && !error.includes('approval') && (
          <div className="mt-4 p-3 bg-red-500/10 border border-red-500/30 rounded-xl">
            <Text variant="small" color="danger">
              ⚠️ {error}
            </Text>
          </div>
        )}

        {/* Swap Button */}
        <div className="mt-6">
          <Button
            onClick={handleButtonClick}
            variant={isWrongNetwork ? 'warning' : approvalNeeded ? 'secondary' : 'primary'}
            size="lg"
            disabled={buttonState.disabled || isSwitchingNetwork || isApproving || txStatus === 'pending'}
            loading={false}
            className={`w-full ${isWrongNetwork ? 'bg-yellow-500 hover:bg-yellow-600' : ''} ${approvalNeeded && !isWrongNetwork ? 'bg-blue-600 hover:bg-blue-700' : ''}`}
          >
            {isSwitchingNetwork ? (
              <div className="flex items-center gap-2">
                <Spinner size="sm" color="white" />
                Switching Network...
              </div>
            ) : isApproving ? (
              <div className="flex items-center gap-2">
                <Spinner size="sm" color="white" />
                Approving...
              </div>
            ) : txStatus === 'pending' ? (
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
    </>
  );
};

export default memo(SwapCard);