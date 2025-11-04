#!/bin/bash
# منح صلاحيات CREATE على schema public للمستخدم audit

# الاتصال كمستخدم audit (الذي هو owner الخاص بقاعدة البيانات)
psql -U audit -d auditdb << 'EOF'
-- منح صلاحية CREATE على schema public للمستخدم audit
GRANT CREATE ON SCHEMA public TO audit;
GRANT USAGE ON SCHEMA public TO audit;

-- منح صلاحيات على الجداول الحالية (إن وجدت)
GRANT ALL PRIVILEGES ON ALL TABLES IN SCHEMA public TO audit;
GRANT ALL PRIVILEGES ON ALL SEQUENCES IN SCHEMA public TO audit;

-- منح صلاحيات افتراضية للجداول المستقبلية
ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT ALL PRIVILEGES ON TABLES TO audit;
ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT ALL PRIVILEGES ON SEQUENCES TO audit;

-- التأكد من الصلاحيات
\dn+
EOF
