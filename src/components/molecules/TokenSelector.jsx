import React, { memo, useState, useRef, useEffect } from 'react';
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
  const dropdownRef = useRef(null);

  const filteredTokens = tokenList.filter(
    token => token.address !== excludeToken?.address
  );

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
      return () => document.removeEventListener('mousedown', handleClickOutside);
    }
  }, [isOpen]);

  const handleSelect = (token) => {
    onSelect(token);
    setIsOpen(false);
  };

  return (
    <div className="relative" ref={dropdownRef}>
      {/* Selected Token Button */}
      <button
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

    {/* Dropdown Menu */}
{isOpen && (
  <div className="absolute left-full top-0 ml-2 z-50 bg-slate-800 border border-white/10 rounded-xl shadow-2xl overflow-hidden min-w-[200px]">
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
      )}
    </div>
  );
};

export default memo(TokenSelector);