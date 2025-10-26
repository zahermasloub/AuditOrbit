"""wp/samples CRUD perms + extra indexes

Revision ID: 0011_wp_samples_crud_and_indexes
Revises: 0010_working_papers_and_samples
Create Date: 2025-10-26
"""

from alembic import op


revision = "0011_wp_samples_crud_and_indexes"
down_revision = "0010_working_papers_and_samples"
branch_labels = None
depends_on = None


def upgrade() -> None:
  op.create_index("ix_wp_eng_prepared", "working_papers", ["engagement_id", "prepared_at"], unique=False)
  op.create_index("ix_samples_eng_size", "samples", ["engagement_id", "size"], unique=False)

  op.execute(
    """
      INSERT INTO permissions (resource, action) VALUES
        ('working_papers', 'update'),
        ('working_papers', 'delete'),
        ('samples', 'update'),
        ('samples', 'delete')
      ON CONFLICT ON CONSTRAINT uq_permissions_resource_action DO NOTHING;
    """
  )

  op.execute(
    """
      WITH perms AS (
        SELECT id, resource, action
        FROM permissions
        WHERE (resource = 'working_papers' AND action IN ('read', 'create', 'update', 'delete'))
           OR (resource = 'samples' AND action IN ('read', 'create', 'update', 'delete'))
      ),
      roles_map AS (
        SELECT id, name
        FROM roles
        WHERE name IN ('Admin', 'IA Manager', 'Auditor')
      )
      INSERT INTO role_permissions (role_id, perm_id)
      SELECT r.id, p.id
      FROM roles_map r
      CROSS JOIN perms p
      WHERE (r.name IN ('Admin', 'IA Manager'))
         OR (r.name = 'Auditor' AND p.action = 'read')
      ON CONFLICT DO NOTHING;
    """
  )


def downgrade() -> None:
  op.drop_index("ix_samples_eng_size", table_name="samples")
  op.drop_index("ix_wp_eng_prepared", table_name="working_papers")
