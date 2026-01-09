import { useState, useCallback, useRef } from 'react';

const useCopyToClipboard = () => {
  const [isCopied, setIsCopied] = useState(false);
  const timeoutRef = useRef(null);

  const copyToClipboard = useCallback(async (text) => {
    // Clear previous timeout untuk prevent memory leaks
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }

    try {
      if (navigator.clipboard && window.isSecureContext) {
        await navigator.clipboard.writeText(text);
        setIsCopied(true);
        
        timeoutRef.current = setTimeout(() => {
          setIsCopied(false);
        }, 2000);
        
        return true;
      } else {
        // Fallback
        const textArea = document.createElement('textarea');
        textArea.value = text;
        textArea.style.position = 'fixed';
        textArea.style.left = '-999999px';
        textArea.style.top = '-999999px';
        document.body.appendChild(textArea);
        textArea.focus();
        textArea.select();
        
        const successful = document.execCommand('copy');
        textArea.remove();
        
        if (successful) {
          setIsCopied(true);
          timeoutRef.current = setTimeout(() => {
            setIsCopied(false);
          }, 2000);
        }
        
        return successful;
      }
    } catch (error) {
      console.error('Failed to copy:', error);
      setIsCopied(false);
      return false;
    }
  }, []);

  return { copyToClipboard, isCopied };
};

export default useCopyToClipboard;