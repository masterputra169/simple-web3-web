import React, { memo } from 'react';

// Base Icon wrapper
const Icon = memo(({ size = 20, className = '', children }) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    className={className}
  >
    {children}
  </svg>
));

// Wallet Icon
export const WalletIcon = memo(({ size = 20, className = '' }) => (
  <Icon size={size} className={className}>
    <path d="M21 12V7H5a2 2 0 0 1 0-4h14v4" />
    <path d="M3 5v14a2 2 0 0 0 2 2h16v-5" />
    <path d="M18 12a2 2 0 0 0 0 4h4v-4Z" />
  </Icon>
));

// Copy Icon
export const CopyIcon = memo(({ size = 16, className = '' }) => (
  <Icon size={size} className={className}>
    <rect x="9" y="9" width="13" height="13" rx="2" ry="2" />
    <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1" />
  </Icon>
));

// Check Icon
export const CheckIcon = memo(({ size = 16, className = '' }) => (
  <Icon size={size} className={className}>
    <polyline points="20 6 9 17 4 12" />
  </Icon>
));

// Refresh Icon
export const RefreshIcon = memo(({ size = 16, className = '' }) => (
  <Icon size={size} className={className}>
    <path d="M21 12a9 9 0 0 0-9-9 9.75 9.75 0 0 0-6.74 2.74L3 8" />
    <path d="M3 3v5h5" />
    <path d="M3 12a9 9 0 0 0 9 9 9.75 9.75 0 0 0 6.74-2.74L21 16" />
    <path d="M16 16h5v5" />
  </Icon>
));

// Chevron Icons
export const ChevronDownIcon = memo(({ size = 16, className = '' }) => (
  <Icon size={size} className={className}>
    <path d="m6 9 6 6 6-6" />
  </Icon>
));

export const ChevronRightIcon = memo(({ size = 16, className = '' }) => (
  <Icon size={size} className={className}>
    <path d="m9 18 6-6-6-6" />
  </Icon>
));

// External Link Icon
export const ExternalLinkIcon = memo(({ size = 16, className = '' }) => (
  <Icon size={size} className={className}>
    <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6" />
    <polyline points="15 3 21 3 21 9" />
    <line x1="10" y1="14" x2="21" y2="3" />
  </Icon>
));

// Disconnect Icon
export const DisconnectIcon = memo(({ size = 16, className = '' }) => (
  <Icon size={size} className={className}>
    <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
    <polyline points="16 17 21 12 16 7" />
    <line x1="21" y1="12" x2="9" y2="12" />
  </Icon>
));

// Base Logo Icon
export const BaseLogoIcon = memo(({ size = 24, className = '' }) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 111 111"
    fill="none"
    className={className}
  >
    <circle cx="55.5" cy="55.5" r="55.5" fill="#0052FF" />
    <path
      d="M55.4 93.2c20.9 0 37.8-16.9 37.8-37.8S76.3 17.6 55.4 17.6c-19.3 0-35.2 14.5-37.4 33.2h49.9v7H18c2.2 18.7 18.1 35.4 37.4 35.4z"
      fill="#fff"
    />
  </svg>
));

export default {
  WalletIcon,
  CopyIcon,
  CheckIcon,
  RefreshIcon,
  ChevronDownIcon,
  ChevronRightIcon,
  ExternalLinkIcon,
  DisconnectIcon,
  BaseLogoIcon,
};