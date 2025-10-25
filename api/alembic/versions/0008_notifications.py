"""notifications tables + audit_logs indexes

Revision ID: 0008_notifications
Revises: 0007_reports_and_approvals
Create Date: 2025-10-25 10:00:00+00:00
"""
from alembic import op
import sqlalchemy as sa
from sqlalchemy.dialects import postgresql as pg

revision = "0008_notifications"
down_revision = "0007_reports_and_approvals"
branch_labels = None
depends_on = None


def upgrade():
    op.create_table(
        "notifications",
        sa.Column("id", pg.UUID(as_uuid=True), primary_key=True, server_default=sa.text("gen_random_uuid()")),
        sa.Column("user_id", pg.UUID(as_uuid=True), nullable=False),
        sa.Column("kind", sa.String(40), nullable=False),
        sa.Column("title", sa.String(240), nullable=False),
        sa.Column("body", sa.Text(), nullable=True),
        sa.Column("meta", pg.JSONB(), nullable=True),
        sa.Column("status", sa.String(20), nullable=False, server_default="unread"),
        sa.Column("created_at", sa.TIMESTAMP(timezone=True), nullable=False, server_default=sa.text("now()")),
    )
    op.create_index("ix_notifications_user_status", "notifications", ["user_id", "status", "created_at"], unique=False)

    op.create_table(
        "notification_channels",
        sa.Column("id", pg.UUID(as_uuid=True), primary_key=True, server_default=sa.text("gen_random_uuid()")),
        sa.Column("user_id", pg.UUID(as_uuid=True), nullable=False),
        sa.Column("channel", sa.String(20), nullable=False),
        sa.Column("target", sa.String(512), nullable=False),
        sa.Column("enabled", sa.Boolean(), nullable=False, server_default=sa.text("true")),
        sa.Column("created_at", sa.TIMESTAMP(timezone=True), nullable=False, server_default=sa.text("now()")),
        sa.UniqueConstraint("user_id", "channel", "target", name="uq_notification_channels_user_channel_target"),
    )

    op.create_index("ix_audit_logs_actor_time", "audit_logs", ["actor_id", "at"], unique=False)
    op.create_index("ix_audit_logs_action_time", "audit_logs", ["action", "at"], unique=False)


def downgrade():
    op.drop_index("ix_audit_logs_action_time", table_name="audit_logs")
    op.drop_index("ix_audit_logs_actor_time", table_name="audit_logs")
    op.drop_table("notification_channels")
    op.drop_index("ix_notifications_user_status", table_name="notifications")
    op.drop_table("notifications")
