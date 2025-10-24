"""reports and approvals tables

Revision ID: 0007_reports_and_approvals
Revises: 0006_regs_scenarios_findings
Create Date: 2025-10-24
"""

from collections.abc import Sequence

from alembic import op
import sqlalchemy as sa
from sqlalchemy.dialects import postgresql

# revision identifiers, used by Alembic.
revision: str = "0007_reports_and_approvals"
down_revision: str = "0006_regs_scenarios_findings"
branch_labels: Sequence[str] | None = None
depends_on: Sequence[str] | None = None


REPORTS_TABLE = "reports"
REPORT_APPROVALS_TABLE = "report_approvals"


def upgrade() -> None:
  op.create_table(
    REPORTS_TABLE,
  sa.Column("id", postgresql.UUID(as_uuid=True), primary_key=True, nullable=False, server_default=sa.text("uuid_generate_v4()")),
    sa.Column(
      "engagement_id",
      postgresql.UUID(as_uuid=True),
      sa.ForeignKey("engagements.id", ondelete="CASCADE"),
      nullable=False,
    ),
    sa.Column("version_no", sa.Integer(), nullable=False, server_default=sa.text("1")),
    sa.Column("kind", sa.Text(), nullable=False, server_default=sa.text("'draft'")),
    sa.Column("title", sa.Text(), nullable=False),
    sa.Column("content", postgresql.JSONB(), nullable=False),
    sa.Column("status", sa.Text(), nullable=False, server_default=sa.text("'draft'")),
    sa.Column("created_by", postgresql.UUID(as_uuid=True), sa.ForeignKey("users.id"), nullable=False),
    sa.Column("approved_by", postgresql.UUID(as_uuid=True), sa.ForeignKey("users.id"), nullable=True),
    sa.Column("approved_at", sa.TIMESTAMP(timezone=True), nullable=True),
    sa.Column("created_at", sa.TIMESTAMP(timezone=True), nullable=False, server_default=sa.text("now()")),
    sa.Column("updated_at", sa.TIMESTAMP(timezone=True), nullable=False, server_default=sa.text("now()")),
    sa.UniqueConstraint("engagement_id", "version_no", "kind", name="uq_reports_eng_ver_kind"),
  )
  op.create_index("ix_reports_engagement", REPORTS_TABLE, ["engagement_id"])
  op.create_index("ix_reports_status", REPORTS_TABLE, ["status"])

  op.create_table(
    REPORT_APPROVALS_TABLE,
  sa.Column("id", postgresql.UUID(as_uuid=True), primary_key=True, nullable=False, server_default=sa.text("uuid_generate_v4()")),
    sa.Column(
      "report_id",
      postgresql.UUID(as_uuid=True),
      sa.ForeignKey(f"{REPORTS_TABLE}.id", ondelete="CASCADE"),
      nullable=False,
    ),
    sa.Column(
      "approver_id",
      postgresql.UUID(as_uuid=True),
      sa.ForeignKey("users.id", ondelete="SET NULL"),
      nullable=False,
    ),
    sa.Column("action", sa.Text(), nullable=False),
    sa.Column("comment", sa.Text(), nullable=True),
    sa.Column("created_at", sa.TIMESTAMP(timezone=True), nullable=False, server_default=sa.text("now()")),
  )
  op.create_index("ix_report_approvals_report", REPORT_APPROVALS_TABLE, ["report_id"])


def downgrade() -> None:
  op.drop_index("ix_report_approvals_report", table_name=REPORT_APPROVALS_TABLE)
  op.drop_table(REPORT_APPROVALS_TABLE)
  op.drop_index("ix_reports_status", table_name=REPORTS_TABLE)
  op.drop_index("ix_reports_engagement", table_name=REPORTS_TABLE)
  op.drop_table(REPORTS_TABLE)
