import { USD_DECIMALS } from './constants';

/**
 * Format USD with Intl formatter
 * @param {number|string} amount - Amount in USD
 * @returns {string}
 */
export const formatUSD = (amount) => {
  if (!amount && amount !== 0) return '$0.00';
  const num = typeof amount === 'string' ? parseFloat(amount) : amount;
  if (isNaN(num)) return '$0.00';
  
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: USD_DECIMALS,
    maximumFractionDigits: USD_DECIMALS,
  }).format(num);
};

/**
 * Calculate ETH value in USD
 * @param {number|string} ethBalance - Balance in ETH
 * @param {number|string} ethPrice - ETH price in USD
 * @returns {number}
 */
export const calculateUSDValue = (ethBalance, ethPrice) => {
  if (!ethBalance || !ethPrice) return 0;
  const balance = typeof ethBalance === 'string' ? parseFloat(ethBalance) : ethBalance;
  const price = typeof ethPrice === 'string' ? parseFloat(ethPrice) : ethPrice;
  if (isNaN(balance) || isNaN(price)) return 0;
  return balance * price;
};

/**
 * Format ETH balance with USD value
 * @param {number|string} ethBalance - Balance in ETH
 * @param {number|string} ethPrice - ETH price in USD
 * @returns {Object}
 */
export const formatBalanceWithUSD = (ethBalance, ethPrice) => {
  const usdValue = calculateUSDValue(ethBalance, ethPrice);
  return {
    eth: ethBalance,
    usd: usdValue,
    usdFormatted: formatUSD(usdValue),
  };
};

/**
 * Shorten large USD numbers
 * @param {number} amount - Amount in USD
 * @returns {string}
 */
export const shortenUSD = (amount) => {
  if (!amount && amount !== 0) return '$0';
  const abs = Math.abs(amount);
  
  if (abs >= 1e9) return `$${(amount / 1e9).toFixed(2)}B`;
  if (abs >= 1e6) return `$${(amount / 1e6).toFixed(2)}M`;
  if (abs >= 1e3) return `$${(amount / 1e3).toFixed(2)}K`;
  
  return formatUSD(amount);
};

export default {
  formatUSD,
  calculateUSDValue,
  formatBalanceWithUSD,
  shortenUSD,
};