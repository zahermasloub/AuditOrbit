from alembic import op
from sqlalchemy import text

revision = "0002_seed_core"
down_revision = "0001_auth_rbac_audit"
branch_labels = None
depends_on = None


def upgrade() -> None:
  # Roles
  op.execute("INSERT INTO roles (id, name) VALUES (1, 'Admin'), (2, 'Manager'), (3, 'Auditor');")
  # Permissions (subset الأساسي)
  perms = [
    ("users", "create"),
    ("users", "read"),
    ("users", "update"),
    ("users", "delete"),
    ("roles", "read"),
    ("engagements", "create"),
    ("engagements", "read"),
    ("engagements", "update"),
    ("engagements", "delete"),
    ("engagements", "approve"),
    ("engagements", "assign"),
    ("evidence", "create"),
    ("evidence", "read"),
  ]
  for res, act in perms:
    op.execute(
      text("INSERT INTO permissions(resource, action) VALUES (:res, :act) ON CONFLICT DO NOTHING;").bindparams(
        res=res,
        act=act,
      )
    )
  # Grant all to Admin
  op.execute(
    """
    INSERT INTO role_permissions(role_id, perm_id)
    SELECT 1, p.id FROM permissions p
    ON CONFLICT DO NOTHING;
    """
  )
  # Manager: subset
  op.execute(
    """
    INSERT INTO role_permissions(role_id, perm_id)
    SELECT 2, p.id FROM permissions p
     WHERE (p.resource IN ('users') AND p.action = 'read')
        OR p.resource IN ('roles')
        OR p.resource IN ('engagements', 'evidence');
    """
  )
  # Create default admin user (password to be updated manually)
  op.execute(
    """
    INSERT INTO users (email, name, hashed_password)
    VALUES ('admin@example.com', 'Admin', crypt('Admin#2025', gen_salt('bf')));
    """
  )
  op.execute(
    """
    INSERT INTO user_roles(user_id, role_id)
    SELECT id, 1 FROM users WHERE email = 'admin@example.com';
    """
  )


def downgrade() -> None:
  op.execute("DELETE FROM user_roles;")
  op.execute("DELETE FROM role_permissions;")
  op.execute("DELETE FROM permissions;")
  op.execute("DELETE FROM roles;")
  op.execute("DELETE FROM users WHERE email = 'admin@example.com';")
