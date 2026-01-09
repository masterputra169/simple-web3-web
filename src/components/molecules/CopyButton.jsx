import React from 'react';
import CopyIcon from '../atoms/CopyIcon';
import CheckIcon from '../atoms/CheckIcon';
import useCopyToClipboard from '../../hooks/useCopyToClipboard';

const CopyButton = ({ text, size = 16 }) => {
  const { copyToClipboard, isCopied } = useCopyToClipboard();

  const handleCopy = () => {
    copyToClipboard(text);
  };

  return (
    <button
      onClick={handleCopy}
      className="inline-flex items-center justify-center p-1.5 rounded-md hover:bg-gray-100 transition-colors duration-200 group"
      title={isCopied ? 'Copied!' : 'Copy to clipboard'}
    >
      {isCopied ? (
        <CheckIcon 
          size={size} 
          className="text-green-500" 
        />
      ) : (
        <CopyIcon 
          size={size} 
          className="text-gray-500 group-hover:text-blue-600" 
        />
      )}
    </button>
  );
};

export default CopyButton;