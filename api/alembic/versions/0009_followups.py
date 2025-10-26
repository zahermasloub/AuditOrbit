"""phase12: follow-ups & management responses"""
from alembic import op
import sqlalchemy as sa
from sqlalchemy.dialects.postgresql import UUID, JSONB

revision = "0009_followups"
down_revision = "0008_notifications"
branch_labels = None
depends_on = None


def upgrade() -> None:
  op.create_table(
    "management_responses",
    sa.Column("id", UUID(as_uuid=True), primary_key=True, server_default=sa.text("gen_random_uuid()")),
    sa.Column("finding_id", UUID(as_uuid=True), sa.ForeignKey("findings.id", ondelete="CASCADE"), nullable=False),
    sa.Column("response", sa.Text(), nullable=False),
    sa.Column("action_plan", sa.Text(), nullable=False),
    sa.Column("owner_department", sa.Text(), nullable=False),
    sa.Column("owner_name", sa.Text()),
    sa.Column("due_date", sa.Date()),
    sa.Column("created_at", sa.TIMESTAMP(timezone=True), server_default=sa.text("now()"), nullable=False),
  )
  op.create_index("ix_mgmt_resp_finding", "management_responses", ["finding_id"])

  op.create_table(
    "follow_ups",
    sa.Column("id", UUID(as_uuid=True), primary_key=True, server_default=sa.text("gen_random_uuid()")),
    sa.Column("finding_id", UUID(as_uuid=True), sa.ForeignKey("findings.id", ondelete="CASCADE"), nullable=False),
    sa.Column("status", sa.Text(), nullable=False, server_default=sa.text("'open'")),
    sa.Column("next_review_at", sa.Date()),
    sa.Column("notes", sa.Text()),
    sa.Column("created_at", sa.TIMESTAMP(timezone=True), server_default=sa.text("now()"), nullable=False),
  )
  op.create_index("ix_followups_finding_status", "follow_ups", ["finding_id", "status"])

  op.create_table(
    "follow_up_tests",
    sa.Column("id", UUID(as_uuid=True), primary_key=True, server_default=sa.text("gen_random_uuid()")),
    sa.Column("follow_up_id", UUID(as_uuid=True), sa.ForeignKey("follow_ups.id", ondelete="CASCADE"), nullable=False),
    sa.Column("performed_at", sa.TIMESTAMP(timezone=True), server_default=sa.text("now()"), nullable=False),
    sa.Column("tester_id", UUID(as_uuid=True), sa.ForeignKey("users.id"), nullable=False),
    sa.Column("approach", sa.Text(), nullable=False),
    sa.Column("evidence", JSONB),
    sa.Column("result", sa.Text(), nullable=False),
  )
  op.create_index("ix_follow_up_tests_follow", "follow_up_tests", ["follow_up_id"])

  op.execute(
    """
    INSERT INTO permissions (resource, action) VALUES
      ('management_responses', 'create'),
      ('followups', 'create'),
      ('followups', 'read'),
      ('followups', 'update'),
      ('followup_tests', 'create')
    ON CONFLICT ON CONSTRAINT uq_permissions_resource_action DO NOTHING;
    """
  )


def downgrade() -> None:
  op.execute(
    """
    DELETE FROM permissions
    WHERE (resource = 'management_responses' AND action = 'create')
      OR (resource = 'followups' AND action IN ('create', 'read', 'update'))
      OR (resource = 'followup_tests' AND action = 'create');
    """
  )
  op.drop_index("ix_follow_up_tests_follow", table_name="follow_up_tests")
  op.drop_table("follow_up_tests")
  op.drop_index("ix_followups_finding_status", table_name="follow_ups")
  op.drop_table("follow_ups")
  op.drop_index("ix_mgmt_resp_finding", table_name="management_responses")
  op.drop_table("management_responses")
