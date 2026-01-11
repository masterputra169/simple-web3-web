import { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import { createPublicClient, http, formatEther, webSocket } from 'viem';
import { base } from 'viem/chains';
import { formatEthBalance } from '../utils/formatBalance';
import { BALANCE_REFRESH_INTERVAL, DEFAULT_DECIMALS } from '../utils/constants';

// Create public client dengan multiple transports untuk reliability
const publicClient = createPublicClient({
  chain: base,
  transport: http('https://mainnet.base.org'),
  batch: {
    multicall: true,
  },
});

// Cache untuk balance
const balanceCache = new Map();

/**
 * Hook untuk fetch wallet balance dengan real-time updates
 * @param {string} address - Wallet address
 * @param {number} decimals - Decimal places
 * @returns {Object}
 */
const useWalletBalance = (address, decimals = DEFAULT_DECIMALS) => {
  const [balance, setBalance] = useState(() => {
    // Initialize dari cache jika ada
    const cached = balanceCache.get(address);
    return cached?.formatted || null;
  });
  const [rawBalance, setRawBalance] = useState(() => {
    const cached = balanceCache.get(address);
    return cached?.raw || null;
  });
  const [isLoading, setIsLoading] = useState(!balanceCache.has(address));
  const [error, setError] = useState(null);
  const mountedRef = useRef(true);
  const intervalRef = useRef(null);

  const fetchBalance = useCallback(async (showLoading = false) => {
    if (!address) {
      setBalance(null);
      setRawBalance(null);
      setIsLoading(false);
      return;
    }

    if (showLoading) setIsLoading(true);
    setError(null);

    try {
      const balanceWei = await publicClient.getBalance({ address });
      const balanceEth = formatEther(balanceWei);
      const formatted = formatEthBalance(balanceEth, decimals);

      // Update cache
      balanceCache.set(address, { raw: balanceEth, formatted, timestamp: Date.now() });

      if (mountedRef.current) {
        setRawBalance(balanceEth);
        setBalance(formatted);
        setError(null);
      }
    } catch (err) {
      console.error('Balance fetch error:', err);
      if (mountedRef.current) {
        setError(err.message);
        // Keep old balance if available
        if (!balance) {
          setBalance('0.' + '0'.repeat(decimals));
          setRawBalance('0');
        }
      }
    } finally {
      if (mountedRef.current) {
        setIsLoading(false);
      }
    }
  }, [address, decimals, balance]);

  useEffect(() => {
    mountedRef.current = true;

    if (address) {
      // Fetch immediately
      fetchBalance(true);

      // Setup polling interval untuk real-time updates
      intervalRef.current = setInterval(() => {
        fetchBalance(false); // Silent refresh tanpa loading state
      }, BALANCE_REFRESH_INTERVAL);
    }

    return () => {
      mountedRef.current = false;
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [address]); // Hanya re-run jika address berubah

  // Manual refetch dengan loading indicator
  const refetch = useCallback(() => {
    return fetchBalance(true);
  }, [fetchBalance]);

  return useMemo(() => ({
    balance,
    rawBalance,
    isLoading,
    error,
    refetch,
  }), [balance, rawBalance, isLoading, error, refetch]);
};

export default useWalletBalance;

// Export untuk pre-fetch
export const prefetchBalance = async (address) => {
  if (!address) return null;
  try {
    const balanceWei = await publicClient.getBalance({ address });
    const balanceEth = formatEther(balanceWei);
    balanceCache.set(address, { raw: balanceEth, formatted: formatEthBalance(balanceEth, 4), timestamp: Date.now() });
    return balanceEth;
  } catch (err) {
    console.error('Prefetch balance error:', err);
    return null;
  }
};