import React, { memo } from 'react';
import Badge from '../atoms/Badge';
import { BaseLogoIcon } from '../atoms/icons';

const NetworkBadge = ({ isConnected = false, networkName = 'Base' }) => {
  return (
    <Badge
      variant={isConnected ? 'success' : 'default'}
      size="md"
      dot={isConnected}
      className="gap-2"
    >
      <BaseLogoIcon size={14} />
      {networkName}
    </Badge>
  );
};

export default memo(NetworkBadge);