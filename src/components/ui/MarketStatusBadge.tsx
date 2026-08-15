import React from 'react';
import { MarketStatus } from '../../types';
import { Badge } from './Badge';

interface MarketStatusBadgeProps {
  status: MarketStatus;
  size?: 'sm' | 'md';
  className?: string;
}

export const MarketStatusBadge: React.FC<MarketStatusBadgeProps> = ({
  status,
  size = 'md',
  className = '',
}) => {
  switch (status) {
    case 'OPEN':
      return (
        <Badge variant="green" size={size} dot className={className}>
          MARKET OPEN
        </Badge>
      );
    case 'PAUSED':
      return (
        <Badge variant="yellow" size={size} dot className={className}>
          MARKET PAUSED
        </Badge>
      );
    case 'CLOSED':
      return (
        <Badge variant="red" size={size} dot className={className}>
          MARKET CLOSED
        </Badge>
      );
    case 'FROZEN':
      return (
        <Badge variant="purple" size={size} dot className={className}>
          🚨 MARKET FROZEN
        </Badge>
      );
    default:
      return (
        <Badge variant="default" size={size} className={className}>
          {status}
        </Badge>
      );
  }
};
