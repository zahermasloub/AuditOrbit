-- حذف المستخدم القديم إن وجد
DELETE FROM user_roles WHERE user_id IN (SELECT id FROM users WHERE email = 'admin@example.com');
DELETE FROM users WHERE email = 'admin@example.com';

-- إنشاء مستخدم admin جديد بكلمة مرور: admin123
INSERT INTO users (email, name, hashed_password, active)
VALUES ('admin@example.com', 'Admin', crypt('admin123', gen_salt('bf')), true)
RETURNING id;

-- منح صلاحيات Admin (role_id = 1)
INSERT INTO user_roles (user_id, role_id)
SELECT id, 1 FROM users WHERE email = 'admin@example.com';

-- التحقق من المستخدم
SELECT email, name, active FROM users WHERE email = 'admin@example.com';
