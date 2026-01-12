import React, { memo, useEffect } from 'react';
import { createPortal } from 'react-dom';
import Text from '../atoms/Text';

const icons = {
  success: (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
      <polyline points="22 4 12 14.01 9 11.01" />
    </svg>
  ),
  error: (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <circle cx="12" cy="12" r="10" />
      <line x1="15" y1="9" x2="9" y2="15" />
      <line x1="9" y1="9" x2="15" y2="15" />
    </svg>
  ),
  warning: (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" />
      <line x1="12" y1="9" x2="12" y2="13" />
      <line x1="12" y1="17" x2="12.01" y2="17" />
    </svg>
  ),
  info: (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <circle cx="12" cy="12" r="10" />
      <line x1="12" y1="16" x2="12" y2="12" />
      <line x1="12" y1="8" x2="12.01" y2="8" />
    </svg>
  ),
  loading: (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="animate-spin">
      <path d="M21 12a9 9 0 1 1-6.219-8.56" />
    </svg>
  ),
};

const styles = {
  success: 'bg-green-500/20 border-green-500/50 text-green-400',
  error: 'bg-red-500/20 border-red-500/50 text-red-400',
  warning: 'bg-yellow-500/20 border-yellow-500/50 text-yellow-400',
  info: 'bg-blue-500/20 border-blue-500/50 text-blue-400',
  loading: 'bg-blue-500/20 border-blue-500/50 text-blue-400',
};

const Notification = ({ 
  type = 'info', 
  title, 
  message, 
  txHash,
  txDetails,
  onClose, 
  autoClose = true,
  duration = 5000 
}) => {
  useEffect(() => {
    if (autoClose && type !== 'loading') {
      const timer = setTimeout(() => {
        onClose?.();
      }, duration);
      return () => clearTimeout(timer);
    }
  }, [autoClose, duration, onClose, type]);

  const content = (
    <div className={`
      fixed top-4 right-4 z-[10000] max-w-sm w-full
      animate-in slide-in-from-right fade-in duration-300
    `}>
      <div className={`
        flex items-start gap-3 p-4 rounded-xl border backdrop-blur-xl
        shadow-2xl ${styles[type]}
      `}>
        {/* Icon */}
        <div className="flex-shrink-0 mt-0.5">
          {icons[type]}
        </div>

        {/* Content */}
        <div className="flex-1 min-w-0">
          <Text variant="body" className="font-semibold mb-1">
            {title}
          </Text>
          {message && (
            <Text variant="small" color="muted" className="break-words">
              {message}
            </Text>
          )}
          {txHash && (
            <a
              href={`https://basescan.org/tx/${txHash}`}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1 mt-2 text-sm text-blue-400 hover:text-blue-300 hover:underline"
            >
              View on BaseScan
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6" />
                <polyline points="15 3 21 3 21 9" />
                <line x1="10" y1="14" x2="21" y2="3" />
              </svg>
            </a>
          )}
          {txDetails && (
            <div className="mt-2 text-xs text-white/50 space-y-1">
              {txDetails.blockNumber && <div>Block: #{txDetails.blockNumber}</div>}
              {txDetails.gasUsed && <div>Gas Used: {parseInt(txDetails.gasUsed).toLocaleString()}</div>}
            </div>
          )}
        </div>

        {/* Close Button */}
        {type !== 'loading' && (
          <button
            onClick={onClose}
            className="flex-shrink-0 p-1 rounded-lg hover:bg-white/10 transition-colors"
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <line x1="18" y1="6" x2="6" y2="18" />
              <line x1="6" y1="6" x2="18" y2="18" />
            </svg>
          </button>
        )}
      </div>
    </div>
  );

  return createPortal(content, document.body);
};

export default memo(Notification);