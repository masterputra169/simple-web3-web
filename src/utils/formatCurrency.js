/**
 * Format currency utilities
 */

/**
 * Format USD dengan comma separator dan 2 decimal
 * @param {number|string} amount - Amount in USD
 * @returns {string} - Formatted USD (e.g., "$1,234.56")
 */
export const formatUSD = (amount) => {
  if (!amount && amount !== 0) return '$0.00';
  
  const num = typeof amount === 'string' ? parseFloat(amount) : amount;
  
  if (isNaN(num)) return '$0.00';
  
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(num);
};

/**
 * Calculate ETH value in USD
 * @param {number|string} ethBalance - Balance in ETH
 * @param {number|string} ethPrice - Price of 1 ETH in USD
 * @returns {number} - Value in USD
 */
export const calculateUSDValue = (ethBalance, ethPrice) => {
  if (!ethBalance || !ethPrice) return 0;
  
  const balance = typeof ethBalance === 'string' ? parseFloat(ethBalance) : ethBalance;
  const price = typeof ethPrice === 'string' ? parseFloat(ethPrice) : ethPrice;
  
  if (isNaN(balance) || isNaN(price)) return 0;
  
  return balance * price;
};

/**
 * Format ETH balance dengan USD value
 * @param {number|string} ethBalance - Balance in ETH
 * @param {number|string} ethPrice - Price of 1 ETH in USD
 * @returns {Object} - { eth, usd, usdFormatted }
 */
export const formatBalanceWithUSD = (ethBalance, ethPrice) => {
  const usdValue = calculateUSDValue(ethBalance, ethPrice);
  const usdFormatted = formatUSD(usdValue);
  
  return {
    eth: ethBalance,
    usd: usdValue,
    usdFormatted,
  };
};

/**
 * Shorten large USD numbers
 * @param {number} amount - Amount in USD
 * @returns {string} - Shortened format (e.g., "$1.2K", "$1.5M")
 */
export const shortenUSD = (amount) => {
  if (!amount && amount !== 0) return '$0';
  
  const absAmount = Math.abs(amount);
  
  if (absAmount >= 1e9) {
    return `$${(amount / 1e9).toFixed(2)}B`;
  }
  if (absAmount >= 1e6) {
    return `$${(amount / 1e6).toFixed(2)}M`;
  }
  if (absAmount >= 1e3) {
    return `$${(amount / 1e3).toFixed(2)}K`;
  }
  
  return formatUSD(amount);
};

export default {
  formatUSD,
  calculateUSDValue,
  formatBalanceWithUSD,
  shortenUSD,
};