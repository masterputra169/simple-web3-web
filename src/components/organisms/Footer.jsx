import React, { memo } from 'react';
import Text from '../atoms/Text';
import { BaseLogoIcon, ExternalLinkIcon } from '../atoms/icons';

const links = [
  { label: 'Base', url: 'https://base.org' },
  { label: 'Docs', url: 'https://docs.base.org' },
  { label: 'BaseScan', url: 'https://basescan.org' },
  { label: 'GitHub', url: 'https://github.com' },
];

const Footer = () => {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="glass-dark border-t border-white/5 mt-auto">
      <div className="container mx-auto px-4 py-6">
        <div className="flex flex-col md:flex-row justify-between items-center gap-4">
          {/* Left - Brand */}
          <div className="flex items-center gap-2">
            <BaseLogoIcon size={20} />
            <Text variant="small" color="muted">
              © {currentYear} Base DApp. Built with ❤️
            </Text>
          </div>

          {/* Right - Links */}
          <div className="flex items-center gap-6">
            {links.map((link) => (
              <a
                key={link.label}
                href={link.url}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-1 text-white/50 hover:text-white/80 transition-colors text-sm"
              >
                {link.label}
                <ExternalLinkIcon size={12} />
              </a>
            ))}
          </div>
        </div>
      </div>
    </footer>
  );
};

export default memo(Footer);