/**
 * Swap Utility Functions
 * Security-focused helpers for token swaps
 */

import { parseUnits, formatUnits } from 'viem';

/**
 * Parse token amount to smallest unit (wei)
 * @param {string} amount - Human readable amount
 * @param {number} decimals - Token decimals
 * @returns {bigint}
 */
export const parseTokenAmount = (amount, decimals) => {
  if (!amount || isNaN(parseFloat(amount))) return BigInt(0);
  try {
    return parseUnits(amount, decimals);
  } catch {
    return BigInt(0);
  }
};

/**
 * Format token amount from smallest unit to human readable
 * @param {bigint|string} amount - Amount in smallest unit
 * @param {number} decimals - Token decimals
 * @param {number} displayDecimals - Decimals to display
 * @returns {string}
 */
export const formatTokenAmount = (amount, decimals, displayDecimals = 6) => {
  if (!amount) return '0';
  try {
    const formatted = formatUnits(BigInt(amount), decimals);
    const num = parseFloat(formatted);
    if (num === 0) return '0';
    if (num < 0.000001) return '< 0.000001';
    return num.toFixed(displayDecimals).replace(/\.?0+$/, '');
  } catch {
    return '0';
  }
};

/**
 * Calculate minimum output with slippage
 * @param {bigint} amount - Expected output amount
 * @param {number} slippageBps - Slippage in basis points (100 = 1%)
 * @returns {bigint}
 */
export const calculateMinOutput = (amount, slippageBps) => {
  if (!amount) return BigInt(0);
  const slippageMultiplier = BigInt(10000 - slippageBps);
  return (BigInt(amount) * slippageMultiplier) / BigInt(10000);
};

/**
 * Validate token address format
 * @param {string} address - Token address
 * @returns {boolean}
 */
export const isValidTokenAddress = (address) => {
  if (!address) return false;
  // Native ETH placeholder
  if (address.toLowerCase() === '0xeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeee') {
    return true;
  }
  return /^0x[a-fA-F0-9]{40}$/.test(address);
};

/**
 * Check if address is native ETH
 * @param {string} address - Token address
 * @returns {boolean}
 */
export const isNativeETH = (address) => {
  return address?.toLowerCase() === '0xeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeee';
};

/**
 * Sanitize and validate swap amount input
 * @param {string} input - User input
 * @returns {string} - Sanitized amount or empty string
 */
export const sanitizeAmountInput = (input) => {
  if (!input) return '';
  
  // Remove any non-numeric characters except decimal point
  let sanitized = input.replace(/[^0-9.]/g, '');
  
  // Only allow one decimal point
  const parts = sanitized.split('.');
  if (parts.length > 2) {
    sanitized = parts[0] + '.' + parts.slice(1).join('');
  }
  
  // Limit decimal places to 18 (max for most tokens)
  if (parts.length === 2 && parts[1].length > 18) {
    sanitized = parts[0] + '.' + parts[1].slice(0, 18);
  }
  
  return sanitized;
};

/**
 * Calculate price impact percentage
 * @param {string} inputAmount - Input amount in human readable
 * @param {string} outputAmount - Output amount in human readable
 * @param {number} marketRate - Current market rate
 * @returns {number} - Price impact as percentage
 */
export const calculatePriceImpact = (inputAmount, outputAmount, marketRate) => {
  if (!inputAmount || !outputAmount || !marketRate) return 0;
  
  const input = parseFloat(inputAmount);
  const output = parseFloat(outputAmount);
  
  if (input === 0 || marketRate === 0) return 0;
  
  const expectedOutput = input * marketRate;
  const impact = ((expectedOutput - output) / expectedOutput) * 100;
  
  return Math.max(0, impact);
};

/**
 * Get price impact severity
 * @param {number} priceImpact - Price impact percentage
 * @returns {'low' | 'medium' | 'high' | 'critical'}
 */
export const getPriceImpactSeverity = (priceImpact) => {
  if (priceImpact < 1) return 'low';
  if (priceImpact < 3) return 'medium';
  if (priceImpact < 5) return 'high';
  return 'critical';
};

/**
 * Format gas estimate in Gwei
 * @param {bigint} gasPrice - Gas price in wei
 * @returns {string}
 */
export const formatGasPrice = (gasPrice) => {
  if (!gasPrice) return '0';
  const gwei = Number(gasPrice) / 1e9;
  return gwei.toFixed(2);
};

/**
 * Estimate transaction cost in ETH
 * @param {bigint} gasLimit - Gas limit
 * @param {bigint} gasPrice - Gas price in wei
 * @returns {string}
 */
export const estimateTxCost = (gasLimit, gasPrice) => {
  if (!gasLimit || !gasPrice) return '0';
  const cost = BigInt(gasLimit) * BigInt(gasPrice);
  return formatUnits(cost, 18);
};

export default {
  parseTokenAmount,
  formatTokenAmount,
  calculateMinOutput,
  isValidTokenAddress,
  isNativeETH,
  sanitizeAmountInput,
  calculatePriceImpact,
  getPriceImpactSeverity,
  formatGasPrice,
  estimateTxCost,
};