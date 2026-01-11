import React, { memo, useState } from 'react';
import Text from '../atoms/Text';
import { ChevronRightIcon } from '../atoms/icons';
import SwapCard from './SwapCard';

const features = [
  {
    id: 'swap',
    title: 'Swap Tokens',
    description: 'Exchange tokens at the best rates',
    icon: '🔄',
    available: true,
  },
  {
    id: 'send',
    title: 'Send & Receive',
    description: 'Transfer ETH seamlessly on Base network',
    icon: '💸',
    available: false,
  },
  {
    id: 'nft',
    title: 'NFT Gallery',
    description: 'View and manage your NFT collection',
    icon: '🖼️',
    available: false,
  },
];

const FeatureItem = memo(({ title, description, icon, available, onClick, isActive }) => (
  <button
    onClick={onClick}
    disabled={!available}
    className={`
      w-full flex items-center gap-4 p-4 rounded-xl transition-all
      ${available 
        ? 'bg-white/5 hover:bg-white/10 cursor-pointer' 
        : 'bg-white/[0.02] cursor-not-allowed opacity-60'}
      ${isActive ? 'ring-2 ring-blue-500 bg-blue-500/10' : ''}
    `}
  >
    <div className="text-3xl">{icon}</div>
    <div className="flex-1 text-left">
      <Text variant="body" className={`font-semibold ${isActive ? 'text-blue-400' : ''}`}>
        {title}
      </Text>
      <Text variant="small" color="muted">
        {description}
      </Text>
    </div>
    {available ? (
      <ChevronRightIcon size={20} className="text-white/30" />
    ) : (
      <span className="px-2 py-1 text-xs bg-white/10 text-white/50 rounded-full">
        Soon
      </span>
    )}
  </button>
));

const FeatureCard = () => {
  const [activeFeature, setActiveFeature] = useState('swap');

  const handleFeatureClick = (feature) => {
    if (feature.available) {
      setActiveFeature(feature.id);
    }
  };

  return (
    <div className="space-y-6">
      {/* Feature List */}
      <div className="bg-gradient-to-br from-blue-600/20 to-purple-600/20 rounded-2xl p-6 border border-white/10">
        <div className="mb-4">
          <Text variant="h4" className="mb-2">
            🚀 Features
          </Text>
          <Text variant="small" color="muted">
            Select a feature to get started
          </Text>
        </div>

        <div className="space-y-2">
          {features.map((feature) => (
            <FeatureItem 
              key={feature.id} 
              {...feature} 
              isActive={activeFeature === feature.id}
              onClick={() => handleFeatureClick(feature)}
            />
          ))}
        </div>
      </div>

      {/* Active Feature Content */}
      {activeFeature === 'swap' && <SwapCard />}
    </div>
  );
};

export default memo(FeatureCard);