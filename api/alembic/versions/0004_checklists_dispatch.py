from alembic import op
import sqlalchemy as sa
from sqlalchemy.dialects import postgresql

revision = "0004_checklists_dispatch"
down_revision = "0003_planning_engagements"
branch_labels = None
depends_on = None


def upgrade() -> None:
  op.create_table(
    "checklists",
    sa.Column("id", postgresql.UUID(as_uuid=True), primary_key=True, server_default=sa.text("uuid_generate_v4()")),
    sa.Column("name", sa.Text(), nullable=False),
    sa.Column("department", sa.Text(), nullable=True),
    sa.Column("version", sa.Integer(), nullable=False, server_default=sa.text("1")),
    sa.Column("created_at", sa.TIMESTAMP(timezone=True), nullable=False, server_default=sa.text("now()")),
    sa.UniqueConstraint("name", "version", name="uq_checklists_name_version"),
  )
  op.create_index("ix_checklists_name", "checklists", ["name"])

  op.create_table(
    "checklist_items",
    sa.Column("id", postgresql.UUID(as_uuid=True), primary_key=True, server_default=sa.text("uuid_generate_v4()")),
    sa.Column("checklist_id", postgresql.UUID(as_uuid=True), sa.ForeignKey("checklists.id", ondelete="CASCADE"), nullable=False),
    sa.Column("order_no", sa.Integer(), nullable=False),
    sa.Column("title", sa.Text(), nullable=False),
    sa.Column("control_ref", sa.Text(), nullable=True),
    sa.Column("risk", sa.Text(), nullable=True),
  )
  op.create_index("ix_checklist_items_checklist_order", "checklist_items", ["checklist_id", "order_no"])

  op.create_table(
    "engagement_checklists",
    sa.Column("id", postgresql.UUID(as_uuid=True), primary_key=True, server_default=sa.text("uuid_generate_v4()")),
    sa.Column("engagement_id", postgresql.UUID(as_uuid=True), sa.ForeignKey("engagements.id", ondelete="CASCADE"), nullable=False),
    sa.Column("template_id", postgresql.UUID(as_uuid=True), sa.ForeignKey("checklists.id", ondelete="SET NULL"), nullable=True),
    sa.Column("name", sa.Text(), nullable=False),
    sa.Column("dispatched_at", sa.TIMESTAMP(timezone=True), nullable=False, server_default=sa.text("now()")),
  )
  op.create_index("ix_engagement_checklists_engagement", "engagement_checklists", ["engagement_id"])

  op.create_table(
    "engagement_checklist_items",
    sa.Column("id", postgresql.UUID(as_uuid=True), primary_key=True, server_default=sa.text("uuid_generate_v4()")),
    sa.Column(
      "engagement_checklist_id",
      postgresql.UUID(as_uuid=True),
      sa.ForeignKey("engagement_checklists.id", ondelete="CASCADE"),
      nullable=False,
    ),
    sa.Column("order_no", sa.Integer(), nullable=False),
    sa.Column("title", sa.Text(), nullable=False),
    sa.Column("status", sa.Text(), nullable=False, server_default=sa.text("'pending'")),
    sa.Column("evidence_count", sa.Integer(), nullable=False, server_default=sa.text("0")),
  )
  op.create_index(
    "ix_eng_chk_items_parent_order",
    "engagement_checklist_items",
    ["engagement_checklist_id", "order_no"],
  )

  op.execute(
    """
      INSERT INTO permissions(resource, action)
      VALUES
        ('checklists', 'create'),
        ('checklists', 'read'),
        ('checklists', 'update'),
        ('checklists', 'assign')
      ON CONFLICT DO NOTHING;
    """
  )
  op.execute(
    """
      INSERT INTO role_permissions(role_id, perm_id)
      SELECT 1, p.id FROM permissions p
      WHERE p.resource = 'checklists'
      ON CONFLICT DO NOTHING;
    """
  )


def downgrade() -> None:
  op.execute(
    "DELETE FROM role_permissions WHERE role_id = 1 AND perm_id IN (SELECT id FROM permissions WHERE resource = 'checklists')"
  )
  op.execute("DELETE FROM permissions WHERE resource = 'checklists'")
  op.drop_index("ix_eng_chk_items_parent_order", table_name="engagement_checklist_items")
  op.drop_table("engagement_checklist_items")
  op.drop_index("ix_engagement_checklists_engagement", table_name="engagement_checklists")
  op.drop_table("engagement_checklists")
  op.drop_index("ix_checklist_items_checklist_order", table_name="checklist_items")
  op.drop_table("checklist_items")
  op.drop_index("ix_checklists_name", table_name="checklists")
  op.drop_table("checklists")
