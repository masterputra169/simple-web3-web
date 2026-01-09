import { useState, useEffect, useCallback, useMemo } from 'react';
import { createPublicClient, http, formatEther } from 'viem';
import { base } from 'viem/chains';
import { formatEthBalance } from '../utils/formatBalance';

const publicClient = createPublicClient({
  chain: base,
  transport: http(),
});

/**
 * Custom hook untuk fetch wallet balance
 * @param {string} address - Wallet address
 * @param {number} decimals - Jumlah desimal (default: 4)
 * @returns {Object} - { balance, isLoading, error, refetch, rawBalance }
 */
const useWalletBalance = (address, decimals = 4) => {
  const [balance, setBalance] = useState(null);
  const [rawBalance, setRawBalance] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  const fetchBalance = useCallback(async () => {
    if (!address) {
      setBalance(null);
      setRawBalance(null);
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const balanceWei = await publicClient.getBalance({ address });
      const balanceInEth = formatEther(balanceWei);
      
      // Store raw balance
      setRawBalance(balanceInEth);
      
      // Format dengan utility function
      const formattedBalance = formatEthBalance(balanceInEth, decimals);
      setBalance(formattedBalance);
    } catch (err) {
      console.error('Error fetching balance:', err);
      setError(err.message);
      setBalance('0.' + '0'.repeat(decimals));
      setRawBalance('0');
    } finally {
      setIsLoading(false);
    }
  }, [address, decimals]);

  useEffect(() => {
    fetchBalance();
    const interval = setInterval(fetchBalance, 30000);
    return () => clearInterval(interval);
  }, [fetchBalance]);

  return useMemo(
    () => ({
      balance,        // Formatted balance (string)
      rawBalance,     // Raw balance (string, full precision)
      isLoading,
      error,
      refetch: fetchBalance,
    }),
    [balance, rawBalance, isLoading, error, fetchBalance]
  );
};

export default useWalletBalance;