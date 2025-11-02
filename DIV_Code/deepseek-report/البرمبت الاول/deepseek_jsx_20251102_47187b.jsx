// src/shared/components/UICard.jsx
import React from 'react';
import { semanticColors } from '../../design-system/colors';

const UICard = ({
  children,
  variant = 'elevated',
  padding = 'medium',
  className = '',
  style = {},
  ...props
}) => {
  const baseStyle = {
    borderRadius: '8px',
    overflow: 'hidden'
  };

  const variants = {
    elevated: {
      backgroundColor: semanticColors.background.primary,
      boxShadow: '0 1px 3px 0 rgba(0, 0, 0, 0.1), 0 1px 2px 0 rgba(0, 0, 0, 0.06)',
      border: `1px solid ${semanticColors.border.light}`
    },
    outlined: {
      backgroundColor: semanticColors.background.primary,
      border: `1px solid ${semanticColors.border.medium}`
    },
    filled: {
      backgroundColor: semanticColors.background.secondary,
      border: 'none'
    }
  };

  const paddings = {
    none: { padding: '0' },
    small: { padding: '12px' },
    medium: { padding: '16px' },
    large: { padding: '24px' }
  };

  const cardStyle = {
    ...baseStyle,
    ...variants[variant],
    ...paddings[padding],
    ...style
  };

  return (
    <div
      style={cardStyle}
      className={className}
      {...props}
    >
      {children}
    </div>
  );
};

export default UICard;