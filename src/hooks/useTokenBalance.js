/**
 * useTokenBalance Hook
 * Fetch token balance for any ERC20 token
 */

import { useState, useEffect, useCallback, useMemo } from 'react';
import { createPublicClient, http, erc20Abi, formatUnits } from 'viem';
import { base } from 'viem/chains';
import { isNativeETH } from '../utils/swapUtils';

const publicClient = createPublicClient({
  chain: base,
  transport: http(),
});

const useTokenBalance = (walletAddress, token) => {
  const [balance, setBalance] = useState(null);
  const [rawBalance, setRawBalance] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  const fetchBalance = useCallback(async () => {
    if (!walletAddress || !token) {
      setBalance(null);
      setRawBalance(null);
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      let balanceWei;

      if (isNativeETH(token.address)) {
        // Native ETH balance
        balanceWei = await publicClient.getBalance({ address: walletAddress });
      } else {
        // ERC20 token balance
        balanceWei = await publicClient.readContract({
          address: token.address,
          abi: erc20Abi,
          functionName: 'balanceOf',
          args: [walletAddress],
        });
      }

      setRawBalance(balanceWei.toString());
      
      const formatted = formatUnits(balanceWei, token.decimals);
      const num = parseFloat(formatted);
      
      // Format with appropriate decimals
      if (num === 0) {
        setBalance('0');
      } else if (num < 0.0001) {
        setBalance('< 0.0001');
      } else if (num < 1) {
        setBalance(num.toFixed(6));
      } else if (num < 1000) {
        setBalance(num.toFixed(4));
      } else {
        setBalance(num.toFixed(2));
      }

    } catch (err) {
      console.error('Balance fetch error:', err);
      setError(err.message);
      setBalance('0');
      setRawBalance('0');
    } finally {
      setIsLoading(false);
    }
  }, [walletAddress, token]);

  // Fetch on mount and when dependencies change
  useEffect(() => {
    fetchBalance();
  }, [fetchBalance]);

  // Auto-refresh every 15 seconds
  useEffect(() => {
    if (!walletAddress || !token) return;
    
    const interval = setInterval(fetchBalance, 15000);
    return () => clearInterval(interval);
  }, [walletAddress, token, fetchBalance]);

  return useMemo(() => ({
    balance,
    rawBalance,
    isLoading,
    error,
    refetch: fetchBalance,
  }), [balance, rawBalance, isLoading, error, fetchBalance]);
};

export default useTokenBalance;