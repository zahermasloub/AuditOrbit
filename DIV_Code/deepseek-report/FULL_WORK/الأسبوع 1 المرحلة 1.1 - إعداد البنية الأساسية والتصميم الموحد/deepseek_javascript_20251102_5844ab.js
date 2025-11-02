// src/design-system/typography.js
export const typography = {
  h1: {
    fontSize: '2.5rem',
    fontWeight: '700',
    lineHeight: '1.2',
    color: 'text.primary'
  },
  h2: {
    fontSize: '2rem',
    fontWeight: '600',
    lineHeight: '1.3',
    color: 'text.primary'
  },
  h3: {
    fontSize: '1.75rem',
    fontWeight: '600',
    lineHeight: '1.4',
    color: 'text.primary'
  },
  body1: {
    fontSize: '1rem',
    fontWeight: '400',
    lineHeight: '1.5',
    color: 'text.primary'
  },
  body2: {
    fontSize: '0.875rem',
    fontWeight: '400',
    lineHeight: '1.57',
    color: 'text.secondary'
  },
  caption: {
    fontSize: '0.75rem',
    fontWeight: '400',
    lineHeight: '1.66',
    color: 'text.secondary'
  }
};

// مكون النص الموحد
// src/shared/components/UITypography.jsx
import React from 'react';
import { typography } from '../../design-system/typography';

const UITypography = ({ 
  variant = 'body1', 
  children, 
  className = '',
  style = {},
  ...props 
}) => {
  const textStyle = {
    ...typography[variant],
    ...style
  };

  return (
    <span 
      className={className}
      style={textStyle}
      {...props}
    >
      {children}
    </span>
  );
};

export default UITypography;