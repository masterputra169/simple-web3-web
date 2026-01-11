/**
 * useSwap Hook
 * Handles token swap operations via 0x API
 */

import { useState, useCallback } from 'react';
import { parseUnits, formatUnits } from 'viem';
import { base } from 'viem/chains';

// 0x API endpoint for Base
const ZEROX_API_BASE = 'https://base.api.0x.org';

// Your 0x API key (get from https://0x.org/docs/introduction/getting-started)
const ZEROX_API_KEY = import.meta.env.VITE_0X_API_KEY || '';

const useSwap = (walletAddress, walletClient) => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [quote, setQuote] = useState(null);
  const [txHash, setTxHash] = useState(null);
  const [txStatus, setTxStatus] = useState(null); // 'pending' | 'success' | 'error'

  // Reset state
  const reset = useCallback(() => {
    setError(null);
    setQuote(null);
    setTxHash(null);
    setTxStatus(null);
  }, []);

  // Get swap quote from 0x API
  const getQuote = useCallback(async (sellToken, buyToken, sellAmount, slippageBps) => {
    if (!walletAddress || !sellToken || !buyToken || !sellAmount) {
      return null;
    }

    setIsLoading(true);
    setError(null);

    try {
      const sellAmountWei = parseUnits(sellAmount, sellToken.decimals).toString();

      const params = new URLSearchParams({
        sellToken: sellToken.address,
        buyToken: buyToken.address,
        sellAmount: sellAmountWei,
        takerAddress: walletAddress,
        slippageBps: slippageBps.toString(),
      });

      const response = await fetch(`${ZEROX_API_BASE}/swap/v1/quote?${params}`, {
        headers: {
          '0x-api-key': ZEROX_API_KEY,
        },
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.reason || `Failed to get quote: ${response.status}`);
      }

      const data = await response.json();

      // Format the quote data
      const formattedQuote = {
        ...data,
        sellAmountFormatted: sellAmount,
        buyAmountFormatted: formatUnits(BigInt(data.buyAmount), buyToken.decimals),
        price: data.price,
        guaranteedPrice: data.guaranteedPrice,
        estimatedGas: data.estimatedGas,
        gasPrice: data.gasPrice,
        sources: data.sources?.filter(s => parseFloat(s.proportion) > 0) || [],
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
      // Get fresh quote for swap
      const sellAmountWei = parseUnits(sellAmount, sellToken.decimals).toString();

      const params = new URLSearchParams({
        sellToken: sellToken.address,
        buyToken: buyToken.address,
        sellAmount: sellAmountWei,
        takerAddress: walletAddress,
        slippageBps: slippageBps.toString(),
      });

      const response = await fetch(`${ZEROX_API_BASE}/swap/v1/quote?${params}`, {
        headers: {
          '0x-api-key': ZEROX_API_KEY,
        },
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.reason || 'Failed to get swap quote');
      }

      const swapQuote = await response.json();

      // Check if approval is needed (for ERC20 tokens)
      if (swapQuote.allowanceTarget && sellToken.address.toLowerCase() !== '0xeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeee') {
        // TODO: Handle token approval if needed
        // This would require checking current allowance and sending approval tx
      }

      // Send swap transaction
      const txHash = await walletClient.sendTransaction({
        account: walletAddress,
        to: swapQuote.to,
        data: swapQuote.data,
        value: BigInt(swapQuote.value || '0'),
        gas: BigInt(Math.ceil(Number(swapQuote.estimatedGas) * 1.2)), // Add 20% buffer
        chain: base,
      });

      setTxHash(txHash);
      setTxStatus('success');
      setQuote(null);

      return { success: true, txHash };
    } catch (err) {
      console.error('Swap error:', err);
      const errorMessage = err.shortMessage || err.message || 'Swap failed';
      setError(errorMessage);
      setTxStatus('error');
      return { success: false, error: errorMessage };
    } finally {
      setIsLoading(false);
    }
  }, [walletAddress, walletClient]);

  return {
    isLoading,
    error,
    quote,
    txHash,
    txStatus,
    getQuote,
    swap,
    reset,
  };
};

export default useSwap;