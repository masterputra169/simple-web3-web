/**
 * useSwap Hook
 * Handles token swap operations via 0x API AllowanceHolder
 * Simpler flow - no EIP-712 signature required
 */

import { useState, useCallback } from 'react';
import { parseUnits, formatUnits, erc20Abi, maxUint256 } from 'viem';
import { base } from 'viem/chains';

// Use AllowanceHolder endpoint (simpler than Permit2)
const ZEROX_API_BASE = '/api/0x/swap/allowance-holder';

// Base chain ID
const BASE_CHAIN_ID = 8453;

const useSwap = (walletAddress, walletClient, publicClient) => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [quote, setQuote] = useState(null);
  const [txHash, setTxHash] = useState(null);
  const [txStatus, setTxStatus] = useState(null);
  const [approvalNeeded, setApprovalNeeded] = useState(false);
  const [approvalTarget, setApprovalTarget] = useState(null);
  const [isApproving, setIsApproving] = useState(false);
  const [txDetails, setTxDetails] = useState(null);

  // Reset state
  const reset = useCallback(() => {
    setError(null);
    setQuote(null);
    setTxHash(null);
    setTxStatus(null);
    setApprovalNeeded(false);
    setApprovalTarget(null);
    setTxDetails(null);
  }, []);

  // Check if token is native ETH
  const isNativeToken = (address) => {
    return address?.toLowerCase() === '0xeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeee';
  };

  // Parse blockchain error
  const parseBlockchainError = useCallback((error, txReceipt = null) => {
    const message = error?.message || error?.shortMessage || error?.toString() || '';
    
    // Transaction reverted
    if (message.includes('reverted') || txReceipt?.status === 'reverted') {
      if (message.includes('TRANSFER_FROM_FAILED') || message.includes('STF')) {
        return {
          code: 'TRANSFER_FAILED',
          message: 'Token transfer failed. Please approve the token first.',
          solution: 'Click "Approve" button to allow token spending.',
        };
      }
      if (message.includes('INSUFFICIENT_OUTPUT') || message.includes('Too little received')) {
        return {
          code: 'SLIPPAGE_ERROR',
          message: 'Price moved too much during swap.',
          solution: 'Try increasing slippage tolerance in settings.',
        };
      }
      if (message.includes('EXPIRED')) {
        return {
          code: 'QUOTE_EXPIRED',
          message: 'Quote expired before transaction was confirmed.',
          solution: 'Please try again with a fresh quote.',
        };
      }
      
      // Extract error code if present
      const codeMatch = message.match(/#(\d+)/);
      if (codeMatch) {
        return {
          code: `REVERT_${codeMatch[1]}`,
          message: `Transaction reverted with error code #${codeMatch[1]}`,
          solution: 'This may be due to insufficient allowance or liquidity.',
        };
      }
      
      return {
        code: 'REVERTED',
        message: 'Transaction reverted on-chain.',
        solution: 'Check token approval and try increasing slippage.',
      };
    }

    // User rejection
    if (message.includes('rejected') || message.includes('denied') || message.includes('cancel')) {
      return {
        code: 'USER_REJECTED',
        message: 'Transaction cancelled.',
        solution: null,
      };
    }

    // Insufficient funds
    if (message.includes('insufficient funds') || message.includes('gas required exceeds')) {
      return {
        code: 'INSUFFICIENT_GAS',
        message: 'Insufficient ETH for gas fees.',
        solution: 'Add more ETH to your wallet for gas.',
      };
    }

    return {
      code: 'UNKNOWN',
      message: message || 'Transaction failed.',
      solution: 'Please try again.',
    };
  }, []);

  // Switch to Base network
  const switchToBase = useCallback(async () => {
    if (!walletClient) return false;

    try {
      await walletClient.switchChain({ id: BASE_CHAIN_ID });
      return true;
    } catch (switchError) {
      if (switchError.code === 4902) {
        try {
          await walletClient.addChain({
            chain: {
              id: BASE_CHAIN_ID,
              name: 'Base',
              nativeCurrency: { name: 'Ethereum', symbol: 'ETH', decimals: 18 },
              rpcUrls: {
                default: { http: ['https://mainnet.base.org'] },
                public: { http: ['https://mainnet.base.org'] },
              },
              blockExplorers: {
                default: { name: 'BaseScan', url: 'https://basescan.org' },
              },
            },
          });
          await walletClient.switchChain({ id: BASE_CHAIN_ID });
          return true;
        } catch {
          return false;
        }
      }
      return false;
    }
  }, [walletClient]);

  // Check token allowance against specific spender
  const checkAllowance = useCallback(async (tokenAddress, spender, amount) => {
    if (!publicClient || !walletAddress || isNativeToken(tokenAddress) || !spender) {
      return { hasAllowance: true, currentAllowance: '0' };
    }

    try {
      const allowance = await publicClient.readContract({
        address: tokenAddress,
        abi: erc20Abi,
        functionName: 'allowance',
        args: [walletAddress, spender],
      });

      return {
        hasAllowance: allowance >= BigInt(amount),
        currentAllowance: allowance.toString(),
      };
    } catch (err) {
      console.error('Allowance check error:', err);
      return { hasAllowance: false, currentAllowance: '0' };
    }
  }, [publicClient, walletAddress]);

  // Check token balance
  const checkBalance = useCallback(async (tokenAddress, amount, decimals) => {
    if (!publicClient || !walletAddress) {
      return { hasBalance: true, currentBalance: '0' };
    }

    try {
      let balance;
      
      if (isNativeToken(tokenAddress)) {
        balance = await publicClient.getBalance({ address: walletAddress });
      } else {
        balance = await publicClient.readContract({
          address: tokenAddress,
          abi: erc20Abi,
          functionName: 'balanceOf',
          args: [walletAddress],
        });
      }

      const requiredAmount = parseUnits(amount, decimals);
      
      return {
        hasBalance: balance >= requiredAmount,
        currentBalance: formatUnits(balance, decimals),
      };
    } catch (err) {
      console.error('Balance check error:', err);
      return { hasBalance: false, currentBalance: '0' };
    }
  }, [publicClient, walletAddress]);

  // Approve token to spender
  const approveToken = useCallback(async (tokenAddress, spender) => {
    if (!walletClient || !walletAddress || !spender) {
      throw new Error('Wallet not connected or invalid spender');
    }

    setIsApproving(true);
    
    try {
      const hash = await walletClient.writeContract({
        address: tokenAddress,
        abi: erc20Abi,
        functionName: 'approve',
        args: [spender, maxUint256],
        chain: base,
        account: walletAddress,
      });

      // Wait for confirmation
      if (publicClient) {
        const receipt = await publicClient.waitForTransactionReceipt({ 
          hash,
          confirmations: 1,
        });
        
        if (receipt.status === 'reverted') {
          throw new Error('Approval transaction failed on-chain');
        }
      }

      setApprovalNeeded(false);
      return { success: true, hash };
    } catch (err) {
      console.error('Approval error:', err);
      const parsed = parseBlockchainError(err);
      throw new Error(parsed.message);
    } finally {
      setIsApproving(false);
    }
  }, [walletClient, walletAddress, publicClient, parseBlockchainError]);

  // Get swap quote
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

      // Check balance first
      const balanceCheck = await checkBalance(sellToken.address, sellAmount, sellToken.decimals);
      if (!balanceCheck.hasBalance) {
        throw new Error(`Insufficient ${sellToken.symbol} balance. You have ${parseFloat(balanceCheck.currentBalance).toFixed(6)} ${sellToken.symbol}`);
      }

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

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.reason || data.description || `Quote failed: ${response.status}`);
      }

      // Check if allowance is needed (from API response)
      let needsApproval = false;
      let spender = null;
      
      if (data.issues?.allowance && !isNativeToken(sellToken.address)) {
        spender = data.issues.allowance.spender;
        const allowanceCheck = await checkAllowance(sellToken.address, spender, sellAmountWei);
        needsApproval = !allowanceCheck.hasAllowance;
        setApprovalTarget(spender);
      }
      
      setApprovalNeeded(needsApproval);

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
          fills: data.route?.fills?.map(fill => ({ source: fill.source })) || [],
        },
        issues: {
          balance: !balanceCheck.hasBalance,
          allowance: needsApproval,
        },
        allowanceTarget: spender,
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
  }, [walletAddress, checkAllowance, checkBalance]);

  // Execute swap
  const swap = useCallback(async (sellToken, buyToken, sellAmount, slippageBps) => {
    if (!walletAddress || !walletClient) {
      setError('Wallet not connected');
      return { success: false, error: 'Wallet not connected' };
    }

    setIsLoading(true);
    setError(null);
    setTxStatus('pending');
    setTxDetails(null);

    try {
      // Check network
      const currentChainId = await walletClient.getChainId();
      if (currentChainId !== BASE_CHAIN_ID) {
        const switched = await switchToBase();
        if (!switched) {
          throw new Error('Please switch to Base network in your wallet');
        }
        await new Promise(resolve => setTimeout(resolve, 1000));
      }

      const sellAmountWei = parseUnits(sellAmount, sellToken.decimals).toString();

      // Check balance
      const balanceCheck = await checkBalance(sellToken.address, sellAmount, sellToken.decimals);
      if (!balanceCheck.hasBalance) {
        throw new Error(`Insufficient ${sellToken.symbol} balance. You have ${parseFloat(balanceCheck.currentBalance).toFixed(6)} ${sellToken.symbol}`);
      }

      // Get fresh quote
      const params = new URLSearchParams({
        chainId: BASE_CHAIN_ID.toString(),
        sellToken: sellToken.address,
        buyToken: buyToken.address,
        sellAmount: sellAmountWei,
        taker: walletAddress,
      });

      const response = await fetch(`${ZEROX_API_BASE}/quote?${params}`, { method: 'GET' });
      const swapQuote = await response.json();

      if (!response.ok) {
        throw new Error(swapQuote.reason || swapQuote.description || 'Failed to get quote');
      }

      // Check approval from API response
      if (swapQuote.issues?.allowance && !isNativeToken(sellToken.address)) {
        const spender = swapQuote.issues.allowance.spender;
        const allowanceCheck = await checkAllowance(sellToken.address, spender, sellAmountWei);
        
        if (!allowanceCheck.hasAllowance) {
          setTxStatus(null);
          setApprovalNeeded(true);
          setApprovalTarget(spender);
          throw new Error(`Please approve ${sellToken.symbol} first. The swap contract needs permission to spend your tokens.`);
        }
      }

      if (!swapQuote.transaction) {
        throw new Error('No transaction data received from API');
      }

      const tx = swapQuote.transaction;

      // Execute transaction
      const hash = await walletClient.sendTransaction({
        account: walletAddress,
        to: tx.to,
        data: tx.data,
        value: BigInt(tx.value || '0'),
        gas: tx.gas ? BigInt(Math.ceil(Number(tx.gas) * 1.3)) : undefined,
        chain: base,
      });

      // Wait for transaction receipt
      let receipt = null;
      if (publicClient) {
        receipt = await publicClient.waitForTransactionReceipt({
          hash,
          confirmations: 1,
        });

        setTxDetails({
          hash: receipt.transactionHash,
          blockNumber: receipt.blockNumber.toString(),
          gasUsed: receipt.gasUsed.toString(),
          effectiveGasPrice: receipt.effectiveGasPrice?.toString(),
          status: receipt.status,
        });

        if (receipt.status === 'reverted') {
          const parsed = parseBlockchainError({ message: 'reverted' }, receipt);
          throw new Error(`${parsed.message} ${parsed.solution || ''}`);
        }
      }

      setTxHash(hash);
      setTxStatus('success');
      setQuote(null);
      setApprovalNeeded(false);

      return { success: true, txHash: hash, details: receipt };
    } catch (err) {
      console.error('Swap error:', err);
      const parsed = parseBlockchainError(err);
      const errorMessage = parsed.solution 
        ? `${parsed.message} ${parsed.solution}`
        : parsed.message;
      setError(errorMessage);
      setTxStatus('error');
      return { success: false, error: errorMessage, code: parsed.code };
    } finally {
      setIsLoading(false);
    }
  }, [walletAddress, walletClient, publicClient, switchToBase, checkAllowance, checkBalance, parseBlockchainError]);

  return {
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
    checkBalance,
    checkAllowance,
  };
};

export default useSwap;