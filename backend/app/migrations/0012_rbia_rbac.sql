-- RBAC Permissions for Annual Planning
-- Run this once after applying the core migrations

-- 1. Insert Permissions
INSERT INTO permissions (id, name, description) VALUES
  (gen_random_uuid(), 'annual_plans:submit', 'Submit annual audit plan for approval'),
  (gen_random_uuid(), 'annual_plans:approve', 'Approve annual audit plan'),
  (gen_random_uuid(), 'annual_plans:publish', 'Publish approved annual audit plan')
ON CONFLICT (name) DO NOTHING;

-- 2. Bind Permissions to Roles

-- Manager: can submit plans
INSERT INTO role_permissions (role_id, permission_id)
SELECT r.id, p.id FROM roles r, permissions p
WHERE r.name='Manager' AND p.name='annual_plans:submit'
ON CONFLICT DO NOTHING;

-- CAE: can approve plans
INSERT INTO role_permissions (role_id, permission_id)
SELECT r.id, p.id FROM roles r, permissions p
WHERE r.name='CAE' AND p.name='annual_plans:approve'
ON CONFLICT DO NOTHING;

-- Committee: can approve plans
INSERT INTO role_permissions (role_id, permission_id)
SELECT r.id, p.id FROM roles r, permissions p
WHERE r.name='Committee' AND p.name='annual_plans:approve'
ON CONFLICT DO NOTHING;

-- Admin: can publish plans
INSERT INTO role_permissions (role_id, permission_id)
SELECT r.id, p.id FROM roles r, permissions p
WHERE r.name='Admin' AND p.name='annual_plans:publish'
ON CONFLICT DO NOTHING;
