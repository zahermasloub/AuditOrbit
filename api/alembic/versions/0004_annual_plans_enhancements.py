from alembic import op
import sqlalchemy as sa
from sqlalchemy.dialects import postgresql


revision = "0004_annual_plans_enhancements"
down_revision = "0003_planning_engagements"
branch_labels = None
depends_on = None


def upgrade() -> None:
	# Annual plan date range and vacation window
	op.add_column("annual_plans", sa.Column("start_date", sa.Date(), nullable=True))
	op.add_column("annual_plans", sa.Column("end_date", sa.Date(), nullable=True))
	op.add_column("annual_plans", sa.Column("vacation_start_date", sa.Date(), nullable=True))
	op.add_column("annual_plans", sa.Column("vacation_end_date", sa.Date(), nullable=True))

	# Departments master table (if not already present)
	op.create_table(
		"departments",
		sa.Column("id", postgresql.UUID(as_uuid=True), primary_key=True, server_default=sa.text("uuid_generate_v4()")),
		sa.Column("name", sa.Text(), nullable=False),
		sa.Column("created_at", sa.TIMESTAMP(timezone=True), nullable=False, server_default=sa.text("now()")),
		sa.UniqueConstraint("name", name="uq_departments_name"),
	)
	op.create_index("ix_departments_name", "departments", ["name"]) 

	# Annual plan target departments with priority per department
	op.create_table(
		"annual_plan_departments",
		sa.Column(
			"annual_plan_id",
			postgresql.UUID(as_uuid=True),
			sa.ForeignKey("annual_plans.id", ondelete="CASCADE"),
			primary_key=True,
		),
		sa.Column(
			"department_id",
			postgresql.UUID(as_uuid=True),
			sa.ForeignKey("departments.id", ondelete="CASCADE"),
			primary_key=True,
		),
		sa.Column("priority", sa.Integer(), nullable=False, server_default=sa.text("3")),
		sa.Column("created_at", sa.TIMESTAMP(timezone=True), nullable=False, server_default=sa.text("now()")),
	)
	op.create_index("ix_annual_plan_departments_plan", "annual_plan_departments", ["annual_plan_id"]) 
	op.create_index("ix_annual_plan_departments_dept", "annual_plan_departments", ["department_id"]) 


def downgrade() -> None:
	op.drop_index("ix_annual_plan_departments_dept", table_name="annual_plan_departments")
	op.drop_index("ix_annual_plan_departments_plan", table_name="annual_plan_departments")
	op.drop_table("annual_plan_departments")

	op.drop_index("ix_departments_name", table_name="departments")
	op.drop_table("departments")

	op.drop_column("annual_plans", "vacation_end_date")
	op.drop_column("annual_plans", "vacation_start_date")
	op.drop_column("annual_plans", "end_date")
	op.drop_column("annual_plans", "start_date")

