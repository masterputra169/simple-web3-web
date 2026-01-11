import { useState, useCallback, useRef, useEffect } from 'react';
import { COPY_TIMEOUT } from '../utils/constants';

/**
 * Hook untuk copy text ke clipboard
 * @returns {Object} - { copyToClipboard, isCopied }
 */
const useCopyToClipboard = () => {
  const [isCopied, setIsCopied] = useState(false);
  const timeoutRef = useRef(null);

  // Cleanup timeout on unmount
  useEffect(() => {
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, []);

  const copyToClipboard = useCallback(async (text) => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }

    try {
      // Modern Clipboard API
      if (navigator.clipboard && window.isSecureContext) {
        await navigator.clipboard.writeText(text);
        setIsCopied(true);
        timeoutRef.current = setTimeout(() => setIsCopied(false), COPY_TIMEOUT);
        return true;
      }
      
      // Fallback for older browsers
      const textArea = document.createElement('textarea');
      textArea.value = text;
      textArea.style.cssText = 'position:fixed;left:-9999px;top:-9999px';
      document.body.appendChild(textArea);
      textArea.select();
      
      const success = document.execCommand('copy');
      textArea.remove();
      
      if (success) {
        setIsCopied(true);
        timeoutRef.current = setTimeout(() => setIsCopied(false), COPY_TIMEOUT);
      }
      
      return success;
    } catch (err) {
      console.error('Copy failed:', err);
      setIsCopied(false);
      return false;
    }
  }, []);

  return { copyToClipboard, isCopied };
};

export default useCopyToClipboard;