// pages/reports/index.js
import UnifiedReports from '../../src/shared/components/UnifiedReports';
import { USER_ROLES, getDefaultPermissions } from '../../src/utils/constants/roles';

// محاكاة بيانات المستخدم - سيتم استبدالها بالنظام الحقيقي
const mockUser = {
  id: 1,
  name: 'مدير النظام',
  role: USER_ROLES.ADMIN, // يمكن تغيير هذا لمحاكاة أدوار مختلفة
  email: 'admin@auditorbit.com'
};

export default function ReportsPage() {
  const userPermissions = getDefaultPermissions(mockUser.role);

  return (
    <UnifiedReports 
      userRole={mockUser.role}
      userPermissions={userPermissions}
    />
  );
}