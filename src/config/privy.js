import { base } from 'viem/chains';

export const PRIVY_APP_ID = 'cmi3a1m6e024vl40cwtc1kdwj';

export const privyConfig = {
  appId: PRIVY_APP_ID,
  config: {
    loginMethods: ['wallet'],
    appearance: {
      theme: 'dark',
      accentColor: '#3b82f6',
      logo: '/base-logo.svg',
      showWalletLoginFirst: true,
    },
    defaultChain: base,
    supportedChains: [base],
    embeddedWallets: {
      createOnLogin: 'users-without-wallets',
    },
  },
};

export default privyConfig;