import React, { memo } from 'react';
import { Link } from 'react-router-dom';
import Text from '../atoms/Text';
import { ChevronRightIcon } from '../atoms/icons';

const features = [
  {
    id: 'swap',
    title: 'Swap Tokens',
    description: 'Exchange tokens at the best rates',
    icon: '🔄',
    available: true,
    path: '/swap',
  },
  {
    id: 'send',
    title: 'Send & Receive',
    description: 'Transfer ETH seamlessly on Base network',
    icon: '💸',
    available: false,
    path: '/send',
  },
  {
    id: 'nft',
    title: 'NFT Gallery',
    description: 'View and manage your NFT collection',
    icon: '🖼️',
    available: false,
    path: '/nft',
  },
];

const FeatureItem = memo(({ title, description, icon, available, path, isActive }) => {
  const content = (
    <>
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
        <ChevronRightIcon size={20} className="text-white/30 group-hover:text-white/60 transition-colors" />
      ) : (
        <span className="px-2 py-1 text-xs bg-white/10 text-white/50 rounded-full">
          Soon
        </span>
      )}
    </>
  );

  if (available) {
    return (
      <Link
        to={path}
        className={`
          group w-full flex items-center gap-4 p-4 rounded-xl transition-all
          bg-white/5 hover:bg-white/10 cursor-pointer
          hover:scale-[1.02] active:scale-[0.98]
          ${isActive ? 'ring-2 ring-blue-500 bg-blue-500/10' : ''}
        `}
      >
        {content}
      </Link>
    );
  }

  return (
    <div
      className={`
        w-full flex items-center gap-4 p-4 rounded-xl transition-all
        bg-white/[0.02] cursor-not-allowed opacity-60
      `}
    >
      {content}
    </div>
  );
});

const FeatureCard = () => {
  return (
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
          />
        ))}
      </div>

      {/* Quick Stats */}
      <div className="mt-6 pt-4 border-t border-white/10">
        <div className="grid grid-cols-3 gap-4 text-center">
          <div>
            <Text variant="h4" className="text-blue-400">0%</Text>
            <Text variant="tiny" color="muted">Platform Fee</Text>
          </div>
          <div>
            <Text variant="h4" className="text-green-400">~2s</Text>
            <Text variant="tiny" color="muted">Tx Speed</Text>
          </div>
          <div>
            <Text variant="h4" className="text-purple-400">50+</Text>
            <Text variant="tiny" color="muted">DEX Sources</Text>
          </div>
        </div>
      </div>
    </div>
  );
};

export default memo(FeatureCard);