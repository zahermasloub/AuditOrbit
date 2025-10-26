"""working_papers and samples + RBAC seed

Revision ID: 0010_working_papers_and_samples
Revises: 0009_followups
Create Date: 2025-10-26

"""

from alembic import op
import sqlalchemy as sa
from sqlalchemy.dialects.postgresql import UUID


# revision identifiers, used by Alembic.
revision = "0010_working_papers_and_samples"
down_revision = "0009_followups"
branch_labels = None
depends_on = None


def upgrade() -> None:
    op.create_table(
  "working_papers",
  sa.Column("id", UUID(as_uuid=True), primary_key=True, server_default=sa.text("gen_random_uuid()")),
  sa.Column("engagement_id", UUID(as_uuid=True), sa.ForeignKey("engagements.id", ondelete="CASCADE"), nullable=False),
        sa.Column("wp_ref", sa.String(length=64), nullable=False),
        sa.Column("objective", sa.Text(), nullable=False),
        sa.Column("procedure", sa.Text(), nullable=False),
  sa.Column("prepared_at", sa.TIMESTAMP(timezone=True), nullable=True),
  sa.Column("reviewed_at", sa.TIMESTAMP(timezone=True), nullable=True),
  sa.Column("created_at", sa.TIMESTAMP(timezone=True), server_default=sa.text("now()"), nullable=False),
        sa.UniqueConstraint("engagement_id", "wp_ref", name="uq_wp_eng_ref"),
    )
    op.create_index("ix_wp_eng_created", "working_papers", ["engagement_id", "created_at"], unique=False)

    op.create_table(
  "samples",
  sa.Column("id", UUID(as_uuid=True), primary_key=True, server_default=sa.text("gen_random_uuid()")),
  sa.Column("engagement_id", UUID(as_uuid=True), sa.ForeignKey("engagements.id", ondelete="CASCADE"), nullable=False),
        sa.Column("method", sa.String(length=16), nullable=False),
        sa.Column("size", sa.Integer(), nullable=False),
  sa.Column("created_at", sa.TIMESTAMP(timezone=True), server_default=sa.text("now()"), nullable=False),
        sa.CheckConstraint("method in ('random','systematic','high_value')", name="ck_samples_method"),
    )
    op.create_index("ix_samples_eng_created", "samples", ["engagement_id", "created_at"], unique=False)

    op.execute(
        """
      INSERT INTO permissions (resource, action) VALUES
        ('working_papers', 'read'),
        ('working_papers', 'create'),
        ('samples', 'read'),
        ('samples', 'create')
      ON CONFLICT ON CONSTRAINT uq_permissions_resource_action DO NOTHING
    """
    )
    op.execute(
        """
      WITH perms AS (
        SELECT id, resource, action
        FROM permissions
        WHERE (resource = 'working_papers' AND action IN ('read', 'create'))
           OR (resource = 'samples' AND action IN ('read', 'create'))
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
      ON CONFLICT DO NOTHING
    """
    )


def downgrade() -> None:
    op.drop_index("ix_samples_eng_created", table_name="samples")
    op.drop_table("samples")
    op.drop_index("ix_wp_eng_created", table_name="working_papers")
    op.drop_table("working_papers")
