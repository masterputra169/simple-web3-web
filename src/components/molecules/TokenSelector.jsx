import React, { memo, useState, useRef, useEffect } from 'react';
import { createPortal } from 'react-dom';
import Text from '../atoms/Text';
import { ChevronDownIcon } from '../atoms/icons';
import { BASE_TOKENS } from '../../config/swap';

const tokenList = Object.values(BASE_TOKENS);

const TokenSelector = ({ 
  selectedToken, 
  onSelect, 
  excludeToken = null,
  label = 'Select token',
  disabled = false 
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [dropdownPosition, setDropdownPosition] = useState({ top: 0, left: 0, width: 0 });
  const buttonRef = useRef(null);

  const filteredTokens = tokenList.filter(
    token => token.address !== excludeToken?.address
  );

  // Calculate dropdown position
  useEffect(() => {
    if (isOpen && buttonRef.current) {
      const rect = buttonRef.current.getBoundingClientRect();
      setDropdownPosition({
        top: rect.bottom + 8,
        left: rect.left,
        width: Math.max(rect.width, 200),
      });
    }
  }, [isOpen]);

  // Close on scroll
  useEffect(() => {
    if (isOpen) {
      const handleScroll = () => setIsOpen(false);
      window.addEventListener('scroll', handleScroll, true);
      return () => window.removeEventListener('scroll', handleScroll, true);
    }
  }, [isOpen]);

  const handleSelect = (token) => {
    onSelect(token);
    setIsOpen(false);
  };

  // Dropdown Portal
  const dropdown = isOpen && createPortal(
    <>
      {/* Backdrop */}
      <div 
        className="fixed inset-0 z-[9998]"
        onClick={() => setIsOpen(false)}
      />
      
      {/* Dropdown Menu */}
      <div 
        className="fixed z-[9999] bg-slate-800 border border-white/10 rounded-xl shadow-2xl overflow-hidden animate-in fade-in slide-in-from-top-2 duration-200"
        style={{
          top: dropdownPosition.top,
          left: dropdownPosition.left,
          width: dropdownPosition.width,
        }}
      >
        <div className="p-2 border-b border-white/10">
          <Text variant="tiny" color="muted" className="px-2">
            Select a token
          </Text>
        </div>
        <div className="max-h-64 overflow-y-auto">
          {filteredTokens.map((token) => (
            <button
              key={token.address}
              onClick={() => handleSelect(token)}
              className={`
                w-full flex items-center gap-3 px-4 py-3
                hover:bg-white/10 transition-colors
                ${selectedToken?.address === token.address ? 'bg-blue-500/20' : ''}
              `}
            >
              <img 
                src={token.logoURI} 
                alt={token.symbol}
                className="w-8 h-8 rounded-full bg-white/10"
                onError={(e) => {
                  e.target.onerror = null;
                  e.target.src = `https://ui-avatars.com/api/?name=${token.symbol}&background=3b82f6&color=fff&size=32`;
                }}
              />
              <div className="text-left flex-1">
                <Text variant="body" className="font-semibold">
                  {token.symbol}
                </Text>
                <Text variant="tiny" color="muted">
                  {token.name}
                </Text>
              </div>
              {selectedToken?.address === token.address && (
                <div className="w-2 h-2 rounded-full bg-blue-500" />
              )}
            </button>
          ))}
        </div>
      </div>
    </>,
    document.body
  );

  return (
    <div className="relative">
      {/* Selected Token Button */}
      <button
        ref={buttonRef}
        onClick={() => !disabled && setIsOpen(!isOpen)}
        disabled={disabled}
        className={`
          flex items-center gap-2 px-3 py-2 rounded-xl
          bg-white/10 hover:bg-white/15 border border-white/10
          transition-all duration-200
          ${disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}
          ${isOpen ? 'ring-2 ring-blue-500' : ''}
        `}
      >
        {selectedToken ? (
          <>
            <img 
              src={selectedToken.logoURI} 
              alt={selectedToken.symbol}
              className="w-6 h-6 rounded-full bg-white/10"
              onError={(e) => {
                e.target.onerror = null;
                e.target.src = `https://ui-avatars.com/api/?name=${selectedToken.symbol}&background=3b82f6&color=fff&size=24`;
              }}
            />
            <Text variant="body" className="font-semibold">
              {selectedToken.symbol}
            </Text>
          </>
        ) : (
          <Text variant="body" color="muted">
            {label}
          </Text>
        )}
        <ChevronDownIcon 
          size={16} 
          className={`text-white/50 transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`} 
        />
      </button>

      {dropdown}
    </div>
  );
};

export default memo(TokenSelector);