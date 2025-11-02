// src/shared/components/UITabs.jsx
import React, { useState } from 'react';
import { semanticColors, colorPalette } from '../../design-system/colors';

const UITabs = ({
  tabs,
  defaultActiveTab = 0,
  variant = 'default',
  onTabChange,
  className = '',
  style = {}
}) => {
  const [activeTab, setActiveTab] = useState(defaultActiveTab);

  const handleTabClick = (index, tab) => {
    setActiveTab(index);
    onTabChange?.(index, tab);
  };

  const containerStyle = {
    display: 'flex',
    flexDirection: 'column',
    width: '100%',
    ...style
  };

  const tabListStyle = {
    display: 'flex',
    borderBottom: `1px solid ${semanticColors.border.light}`,
    gap: '8px'
  };

  const tabStyle = (isActive) => ({
    padding: '12px 16px',
    border: 'none',
    backgroundColor: 'transparent',
    cursor: 'pointer',
    fontSize: '0.875rem',
    fontWeight: isActive ? '600' : '400',
    color: isActive ? colorPalette.primary[600] : semanticColors.text.secondary,
    borderBottom: isActive ? `2px solid ${colorPalette.primary[600]}` : '2px solid transparent',
    transition: 'all 0.2s ease',
    whiteSpace: 'nowrap'
  });

  const tabPanelStyle = {
    padding: '16px 0',
    flex: 1
  };

  return (
    <div style={containerStyle} className={className}>
      <div style={tabListStyle}>
        {tabs.map((tab, index) => (
          <button
            key={tab.id || index}
            style={tabStyle(index === activeTab)}
            onClick={() => handleTabClick(index, tab)}
            type="button"
          >
            {tab.label}
          </button>
        ))}
      </div>
      
      <div style={tabPanelStyle}>
        {tabs[activeTab]?.content}
      </div>
    </div>
  );
};

export default UITabs;