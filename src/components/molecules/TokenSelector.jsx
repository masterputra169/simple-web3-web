import React, { memo, useState } from 'react';
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

  const filteredTokens = tokenList.filter(
    token => token.address !== excludeToken?.address
  );

  const handleSelect = (token) => {
    onSelect(token);
    setIsOpen(false);
  };

  return (
    <div className="relative">
      {/* Selected Token Button */}
      <button
        onClick={() => !disabled && setIsOpen(!isOpen)}
        disabled={disabled}
        className={`
          flex items-center gap-2 px-3 py-2 rounded-xl
          bg-white/10 hover:bg-white/15 border border-white/10
          transition-all duration-200
          ${disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}
        `}
      >
        {selectedToken ? (
          <>
            <img 
              src={selectedToken.logoURI} 
              alt={selectedToken.symbol}
              className="w-6 h-6 rounded-full"
              onError={(e) => e.target.style.display = 'none'}
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
          className={`text-white/50 transition-transform ${isOpen ? 'rotate-180' : ''}`} 
        />
      </button>

      {/* Dropdown */}
      {isOpen && (
        <>
          {/* Backdrop */}
          <div 
            className="fixed inset-0 z-40"
            onClick={() => setIsOpen(false)}
          />
          
          {/* Token List */}
          <div className="absolute top-full left-0 mt-2 w-48 z-50 bg-slate-800 border border-white/10 rounded-xl shadow-xl overflow-hidden">
            <div className="p-2">
              <Text variant="tiny" color="muted" className="px-2 py-1">
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
                    ${selectedToken?.address === token.address ? 'bg-white/5' : ''}
                  `}
                >
                  <img 
                    src={token.logoURI} 
                    alt={token.symbol}
                    className="w-8 h-8 rounded-full"
                    onError={(e) => e.target.style.display = 'none'}
                  />
                  <div className="text-left">
                    <Text variant="body" className="font-semibold">
                      {token.symbol}
                    </Text>
                    <Text variant="tiny" color="muted">
                      {token.name}
                    </Text>
                  </div>
                </button>
              ))}
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default memo(TokenSelector);