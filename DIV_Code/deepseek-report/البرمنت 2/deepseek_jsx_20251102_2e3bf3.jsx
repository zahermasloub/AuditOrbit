// src/shared/components/UnifiedEngagements.jsx
import React, { useState, useEffect } from 'react';
import UICard from './UICard';
import UIButton from './UIButton';
import UITabs from './UITabs';
import UITypography from './UITypography';
import { USER_ROLES } from '../../utils/constants/roles';

const UnifiedEngagements = ({ userRole, userPermissions }) => {
  const [engagements, setEngagements] = useState([]);
  const [loading, setLoading] = useState(false);
  const [activeView, setActiveView] = useState('active');

  // محاكاة بيانات المشاريع
  const mockEngagements = [
    { id: 1, title: 'مراجعة مالية ربع سنوية', status: 'نشط', progress: 75, teamLead: 'أحمد محمد', dueDate: '2025-02-15', teamSize: 4 },
    { id: 2, title: 'تدقيق نظام الجودة', status: 'مكتمل', progress: 100, teamLead: 'فاطمة علي', dueDate: '2025-01-30', teamSize: 3 },
    { id: 3, title: 'مراجعة أمن المعلومات', status: 'معلق', progress: 30, teamLead: 'خالد حسن', dueDate: '2025-03-10', teamSize: 5 },
  ];

  useEffect(() => {
    loadEngagements();
  }, [activeView]);

  const loadEngagements = async () => {
    setLoading(true);
    try {
      await new Promise(resolve => setTimeout(resolve, 800));
      const filteredData = filterEngagementsByView(mockEngagements, activeView);
      setEngagements(filteredData);
    } catch (error) {
      console.error('Error loading engagements:', error);
    } finally {
      setLoading(false);
    }
  };

  const filterEngagementsByView = (data, view) => {
    switch(view) {
      case 'active':
        return data.filter(engagement => engagement.status === 'نشط');
      case 'completed':
        return data.filter(engagement => engagement.status === 'مكتمل');
      case 'pending':
        return data.filter(engagement => engagement.status === 'معلق');
      default:
        return data;
    }
  };

  const renderProgressBar = (progress) => (
    <div style={{
      width: '100%',
      height: '8px',
      backgroundColor: '#e5e7eb',
      borderRadius: '4px',
      overflow: 'hidden',
      margin: '8px 0'
    }}>
      <div style={{
        width: `${progress}%`,
        height: '100%',
        backgroundColor: progress === 100 ? '#22c55e' : 
                        progress >= 75 ? '#3b82f6' : 
                        progress >= 50 ? '#f59e0b' : '#ef4444',
        transition: 'width 0.3s ease'
      }} />
    </div>
  );

  const renderEngagementsList = () => {
    if (loading) {
      return (
        <div style={{ textAlign: 'center', padding: '40px' }}>
          <div>جاري تحميل المشاريع...</div>
        </div>
      );
    }

    return (
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(350px, 1fr))', gap: '16px' }}>
        {engagements.map(engagement => (
          <UICard key={engagement.id} variant="elevated" padding="medium">
            <div style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
              <UITypography variant="h3" style={{ marginBottom: '12px' }}>
                {engagement.title}
              </UITypography>
              
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                <span style={{ fontSize: '0.875rem', color: '#6b7280' }}>الحالة:</span>
                <span style={{ 
                  fontSize: '0.875rem', 
                  fontWeight: '500',
                  color: engagement.status === 'نشط' ? '#22c55e' : 
                         engagement.status === 'مكتمل' ? '#6b7280' : '#f59e0b'
                }}>
                  {engagement.status}
                </span>
              </div>

              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                <span style={{ fontSize: '0.875rem', color: '#6b7280' }}>قائد الفريق:</span>
                <span style={{ fontSize: '0.875rem', fontWeight: '500' }}>{engagement.teamLead}</span>
              </div>

              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                <span style={{ fontSize: '0.875rem', color: '#6b7280' }}>تاريخ الانتهاء:</span>
                <span style={{ fontSize: '0.875rem' }}>{engagement.dueDate}</span>
              </div>

              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                <span style={{ fontSize: '0.875rem', color: '#6b7280' }}>أعضاء الفريق:</span>
                <span style={{ fontSize: '0.875rem' }}>{engagement.teamSize} أعضاء</span>
              </div>

              <div style={{ marginTop: 'auto' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
                  <span style={{ fontSize: '0.875rem', color: '#6b7280' }}>التقدم:</span>
                  <span style={{ fontSize: '0.875rem', fontWeight: '500' }}>{engagement.progress}%</span>
                </div>
                {renderProgressBar(engagement.progress)}
              </div>

              <div style={{ display: 'flex', gap: '8px', marginTop: '16px' }}>
                <UIButton variant="primary" size="small" style={{ flex: 1 }}>
                  التفاصيل
                </UIButton>
                <UIButton variant="ghost" size="small">
                  ...
                </UIButton>
              </div>
            </div>
          </UICard>
        ))}
      </div>
    );
  };

  const tabs = [
    { id: 'active', label: 'المشاريع النشطة', content: renderEngagementsList() },
    { id: 'pending', label: 'المشاريع المعلقة', content: renderEngagementsList() },
    { id: 'completed', label: 'المشاريع المكتملة', content: renderEngagementsList() },
    { id: 'all', label: 'جميع المشاريع', content: renderEngagementsList() }
  ];

  return (
    <div style={{ padding: '24px' }}>
      <div style={{ marginBottom: '24px' }}>
        <UITypography variant="h1" style={{ marginBottom: '8px' }}>
          المشاريع
        </UITypography>
        <UITypography variant="body2" style={{ color: '#6b7280' }}>
          إدارة وعرض جميع مشاريع التدقيق
        </UITypography>
      </div>

      <UICard variant="elevated" padding="large">
        <UITabs
          tabs={tabs}
          defaultActiveTab={0}
          onTabChange={(index, tab) => setActiveView(tab.id)}
        />
      </UICard>
    </div>
  );
};

export default UnifiedEngagements;