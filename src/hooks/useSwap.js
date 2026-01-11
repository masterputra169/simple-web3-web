/**
 * useSwap Hook
 * Handles token swap operations via 0x API Permit2
 * Includes auto network switching to Base
 */

import { useState, useCallback } from 'react';
import { parseUnits, formatUnits } from 'viem';
import { base } from 'viem/chains';

// Use Vite proxy to bypass CORS
const ZEROX_API_BASE = '/api/0x/swap/permit2';

// Base chain ID
const BASE_CHAIN_ID = 8453;

const useSwap = (walletAddress, walletClient) => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [quote, setQuote] = useState(null);
  const [txHash, setTxHash] = useState(null);
  const [txStatus, setTxStatus] = useState(null);

  // Reset state
  const reset = useCallback(() => {
    setError(null);
    setQuote(null);
    setTxHash(null);
    setTxStatus(null);
  }, []);

  // Switch to Base network
  const switchToBase = useCallback(async () => {
    if (!walletClient) return false;

    try {
      // Try to switch to Base
      await walletClient.switchChain({ id: BASE_CHAIN_ID });
      return true;
    } catch (switchError) {
      // If Base is not added, add it first
      if (switchError.code === 4902) {
        try {
          await walletClient.addChain({
            chain: {
              id: BASE_CHAIN_ID,
              name: 'Base',
              nativeCurrency: {
                name: 'Ethereum',
                symbol: 'ETH',
                decimals: 18,
              },
              rpcUrls: {
                default: { http: ['https://mainnet.base.org'] },
                public: { http: ['https://mainnet.base.org'] },
              },
              blockExplorers: {
                default: { name: 'BaseScan', url: 'https://basescan.org' },
              },
            },
          });
          // Try switching again after adding
          await walletClient.switchChain({ id: BASE_CHAIN_ID });
          return true;
        } catch (addError) {
          console.error('Failed to add Base network:', addError);
          return false;
        }
      }
      console.error('Failed to switch network:', switchError);
      return false;
    }
  }, [walletClient]);

  // Get swap quote from 0x API
  const getQuote = useCallback(async (sellToken, buyToken, sellAmount, slippageBps) => {
    if (!walletAddress || !sellToken || !buyToken || !sellAmount) {
      return null;
    }

    const numAmount = parseFloat(sellAmount);
    if (isNaN(numAmount) || numAmount <= 0) {
      return null;
    }

    setIsLoading(true);
    setError(null);

    try {
      const sellAmountWei = parseUnits(sellAmount, sellToken.decimals).toString();

      const params = new URLSearchParams({
        chainId: BASE_CHAIN_ID.toString(),
        sellToken: sellToken.address,
        buyToken: buyToken.address,
        sellAmount: sellAmountWei,
        taker: walletAddress,
      });

      const response = await fetch(`${ZEROX_API_BASE}/quote?${params}`, {
        method: 'GET',
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        
        if (response.status === 400) {
          throw new Error(errorData.reason || errorData.description || 'Invalid swap parameters');
        } else if (response.status === 401) {
          throw new Error('Invalid API key. Get one at dashboard.0x.org');
        } else if (response.status === 429) {
          throw new Error('Rate limit exceeded. Please try again later.');
        }
        
        throw new Error(errorData.reason || errorData.description || `Quote failed: ${response.status}`);
      }

      const data = await response.json();

      const buyAmountFormatted = formatUnits(BigInt(data.buyAmount), buyToken.decimals);
      const minBuyAmount = BigInt(data.buyAmount) * BigInt(10000 - slippageBps) / BigInt(10000);

      const formattedQuote = {
        ...data,
        sellToken,
        buyToken,
        sellAmountFormatted: sellAmount,
        buyAmountFormatted: parseFloat(buyAmountFormatted).toFixed(6),
        minBuyAmountFormatted: parseFloat(formatUnits(minBuyAmount, buyToken.decimals)).toFixed(6),
        estimatedPriceImpact: data.estimatedPriceImpact || '0',
        gasCostETH: data.transaction?.gas 
          ? parseFloat(formatUnits(BigInt(data.transaction.gas) * BigInt(data.transaction.gasPrice || '1000000000'), 18))
          : 0.001,
        route: {
          fills: data.route?.fills?.map(fill => ({
            source: fill.source,
          })) || [],
        },
        issues: {
          balance: data.issues?.balance || null,
          allowance: data.issues?.allowance || null,
        },
      };

      setQuote(formattedQuote);
      return formattedQuote;
    } catch (err) {
      console.error('Quote error:', err);
      setError(err.message || 'Failed to get quote');
      setQuote(null);
      return null;
    } finally {
      setIsLoading(false);
    }
  }, [walletAddress]);

  // Execute swap transaction
  const swap = useCallback(async (sellToken, buyToken, sellAmount, slippageBps) => {
    if (!walletAddress || !walletClient) {
      setError('Wallet not connected');
      return { success: false, error: 'Wallet not connected' };
    }

    setIsLoading(true);
    setError(null);
    setTxStatus('pending');

    try {
      // Check current chain and switch if needed
      const currentChainId = await walletClient.getChainId();
      
      if (currentChainId !== BASE_CHAIN_ID) {
        setError('Switching to Base network...');
        const switched = await switchToBase();
        
        if (!switched) {
          throw new Error('Please switch to Base network in your wallet');
        }
        
        // Small delay to let wallet update
        await new Promise(resolve => setTimeout(resolve, 1000));
        setError(null);
      }

      const sellAmountWei = parseUnits(sellAmount, sellToken.decimals).toString();

      const params = new URLSearchParams({
        chainId: BASE_CHAIN_ID.toString(),
        sellToken: sellToken.address,
        buyToken: buyToken.address,
        sellAmount: sellAmountWei,
        taker: walletAddress,
      });

      const response = await fetch(`${ZEROX_API_BASE}/quote?${params}`, {
        method: 'GET',
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.reason || errorData.description || 'Failed to get swap quote');
      }

      const swapQuote = await response.json();

      if (!swapQuote.transaction) {
        throw new Error('No transaction data in quote');
      }

      const tx = swapQuote.transaction;
      const hash = await walletClient.sendTransaction({
        account: walletAddress,
        to: tx.to,
        data: tx.data,
        value: BigInt(tx.value || '0'),
        gas: tx.gas ? BigInt(Math.ceil(Number(tx.gas) * 1.2)) : undefined,
        chain: base,
      });

      setTxHash(hash);
      setTxStatus('success');
      setQuote(null);

      return { success: true, txHash: hash };
    } catch (err) {
      console.error('Swap error:', err);
      const errorMessage = err.shortMessage || err.message || 'Swap failed';
      setError(errorMessage);
      setTxStatus('error');
      return { success: false, error: errorMessage };
    } finally {
      setIsLoading(false);
    }
  }, [walletAddress, walletClient, switchToBase]);

  return {
    isLoading,
    error,
    quote,
    txHash,
    txStatus,
    getQuote,
    swap,
    reset,
    switchToBase,
  };
};

export default useSwap;