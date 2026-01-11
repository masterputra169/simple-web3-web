import React, { memo } from 'react';
import { CopyIcon, CheckIcon } from '../atoms/icons';
import useCopyToClipboard from '../../hooks/useCopyToClipboard';

const CopyButton = ({ text, size = 16, className = '', alwaysVisible = false }) => {
  const { copyToClipboard, isCopied } = useCopyToClipboard();

  return (
    <button
      onClick={() => copyToClipboard(text)}
      className={`
        inline-flex items-center justify-center p-1.5 rounded-lg
        transition-all duration-200
        hover:bg-white/10 active:scale-95
      `}
      title={isCopied ? 'Copied!' : 'Copy to clipboard'}
    >
      {isCopied ? (
        <CheckIcon size={size} className="text-green-400" />
      ) : (
        <CopyIcon size={size} className="text-white/70 hover:text-white" />
      )}
    </button>
  );
};

export default memo(CopyButton);