DO $$
DECLARE rid uuid;
BEGIN
  SELECT id INTO rid FROM roles WHERE name = 'Admin';
  IF rid IS NOT NULL THEN
    INSERT INTO role_permissions (role_id, perm_id)
    SELECT rid, p.id
    FROM permissions p
    WHERE p.resource = 'followups'
      AND p.action IN ('create', 'read', 'update')
    ON CONFLICT DO NOTHING;
  END IF;
END $$;
