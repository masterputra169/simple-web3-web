import React from 'react';
import ConnectButton from '../molecules/ConnectButton';
import Text from '../atoms/Text';

const Header = () => {
  return (
    <header className="bg-white shadow-md border-b border-gray-200">
      <div className="container mx-auto px-4 py-4">
        <div className="flex justify-between items-center">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-lg flex items-center justify-center">
              <Text variant="h4" color="white">
                B
              </Text>
            </div>
            <Text variant="h3" className="font-bold">
              Base DApp
            </Text>
          </div>
          
          <ConnectButton />
        </div>
      </div>
    </header>
  );
};

export default Header;