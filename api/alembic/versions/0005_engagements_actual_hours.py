from alembic import op
import sqlalchemy as sa
from sqlalchemy.dialects import postgresql


revision = "0005_engagements_actual_hours"
down_revision = "0004_annual_plans_enhancements"
branch_labels = None
depends_on = None


def upgrade() -> None:
	# Add responsible auditor and hours tracking
	op.add_column(
		"engagements",
		sa.Column(
			"responsible_auditor_id",
			postgresql.UUID(as_uuid=True),
			sa.ForeignKey("users.id", ondelete="SET NULL"),
			nullable=True,
		),
	)
	op.add_column("engagements", sa.Column("estimated_hours", sa.Integer(), nullable=False, server_default=sa.text("0")))
	op.add_column("engagements", sa.Column("actual_hours", sa.Integer(), nullable=False, server_default=sa.text("0")))

	# Align default status with new taxonomy
	op.alter_column(
		"engagements",
		"status",
		server_default=sa.text("'scheduled'"),
		existing_type=sa.Text(),
	)

	op.create_index("ix_engagements_responsible", "engagements", ["responsible_auditor_id"]) 


def downgrade() -> None:
	op.drop_index("ix_engagements_responsible", table_name="engagements")

	# restore previous default
	op.alter_column(
		"engagements",
		"status",
		server_default=sa.text("'planned'"),
		existing_type=sa.Text(),
	)

	op.drop_column("engagements", "actual_hours")
	op.drop_column("engagements", "estimated_hours")
	op.drop_column("engagements", "responsible_auditor_id")

