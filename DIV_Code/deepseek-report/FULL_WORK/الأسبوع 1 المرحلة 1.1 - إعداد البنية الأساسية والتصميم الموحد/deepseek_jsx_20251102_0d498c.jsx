// src/components/layout/AppLayout.jsx
import React from 'react';
import styled from 'styled-components';
import { Sidebar } from './Sidebar';
import { Header } from './Header';

const LayoutContainer = styled.div`
  display: flex;
  min-height: 100vh;
  background-color: ${props => props.theme.colors.surface};
`;

const MainContent = styled.main`
  flex: 1;
  display: flex;
  flex-direction: column;
  margin-right: ${props => props.sidebarCollapsed ? '80px' : '280px'};
  transition: margin-right 0.3s ease;
`;

const ContentArea = styled.div`
  flex: 1;
  padding: ${props => props.theme.spacing[6]};
  overflow-y: auto;
`;

export const AppLayout = ({ children, user, onLogout }) => {
  const [sidebarCollapsed, setSidebarCollapsed] = React.useState(false);

  return (
    <LayoutContainer>
      <Sidebar 
        collapsed={sidebarCollapsed}
        onToggle={() => setSidebarCollapsed(!sidebarCollapsed)}
        userRole={user.role}
      />
      
      <MainContent sidebarCollapsed={sidebarCollapsed}>
        <Header 
          user={user}
          onLogout={onLogout}
          onToggleSidebar={() => setSidebarCollapsed(!sidebarCollapsed)}
        />
        
        <ContentArea>
          {children}
        </ContentArea>
      </MainContent>
    </LayoutContainer>
  );
};

// مكون الشريط الجانبي
// src/components/layout/Sidebar.jsx
import React from 'react';
import styled from 'styled-components';

const SidebarContainer = styled.aside`
  position: fixed;
  right: 0;
  top: 0;
  height: 100vh;
  width: ${props => props.collapsed ? '80px' : '280px'};
  background: white;
  border-left: 1px solid ${props => props.theme.colors.secondary[200]};
  transition: width 0.3s ease;
  z-index: 1000;
  display: flex;
  flex-direction: column;
`;

const SidebarHeader = styled.div`
  padding: ${props => props.theme.spacing[6]};
  border-bottom: 1px solid ${props => props.theme.colors.secondary[200]};
  display: flex;
  align-items: center;
  gap: ${props => props.theme.spacing[3]};
  
  ${props => props.collapsed && `
    justify-content: center;
  `}
`;

const Logo = styled.div`
  font-size: ${props => props.theme.typography.fontSize.xl};
  font-weight: ${props => props.theme.typography.fontWeight.bold};
  color: ${props => props.theme.colors.primary[600]};
`;

const Navigation = styled.nav`
  flex: 1;
  padding: ${props => props.theme.spacing[4]} 0;
`;

const NavItem = styled.a`
  display: flex;
  align-items: center;
  gap: ${props => props.theme.spacing[3]};
  padding: ${props => props.theme.spacing[3]} ${props => props.theme.spacing[6]};
  color: ${props => props.theme.colors.text.secondary};
  transition: all 0.2s ease;
  cursor: pointer;
  
  &:hover {
    background-color: ${props => props.theme.colors.primary[50]};
    color: ${props => props.theme.colors.primary[600]};
  }
  
  ${props => props.active && `
    background-color: ${props.theme.colors.primary[50]};
    color: ${props.theme.colors.primary[600]};
    border-right: 3px solid ${props.theme.colors.primary[600]};
  `}
  
  ${props => props.collapsed && `
    justify-content: center;
    padding: ${props.theme.spacing[4]};
  `}
`;

const NavText = styled.span`
  ${props => props.collapsed && `
    display: none;
  `}
`;

export const Sidebar = ({ collapsed, onToggle, userRole }) => {
  const navigation = getNavigationByRole(userRole);
  
  return (
    <SidebarContainer collapsed={collapsed}>
      <SidebarHeader collapsed={collapsed}>
        <Logo>AuditOrbit</Logo>
        {!collapsed && <span>نظام التدقيق الموحد</span>}
      </SidebarHeader>
      
      <Navigation>
        {navigation.map(item => (
          <NavItem
            key={item.path}
            href={item.path}
            active={window.location.pathname === item.path}
            collapsed={collapsed}
          >
            {item.icon}
            <NavText collapsed={collapsed}>{item.title}</NavText>
          </NavItem>
        ))}
      </Navigation>
      
      <div style={{ padding: '16px' }}>
        <Button 
          variant="outline" 
          size="sm" 
          fullWidth
          onClick={onToggle}
        >
          {collapsed ? '→' : '←'}
        </Button>
      </div>
    </SidebarContainer>
  );
};

const getNavigationByRole = (role) => {
  const baseNav = [
    { path: '/dashboard', title: 'لوحة التحكم', icon: '📊' },
    { path: '/reports', title: 'التقارير الموحدة', icon: '📋' },
    { path: '/engagements', title: 'المشاريع', icon: '🎯' },
  ];
  
  if (role === 'admin') {
    return [...baseNav, 
      { path: '/users', title: 'المستخدمين', icon: '👥' },
      { path: '/settings', title: 'الإعدادات', icon: '⚙️' }
    ];
  }
  
  return baseNav;
};