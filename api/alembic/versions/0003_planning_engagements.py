from alembic import op
import sqlalchemy as sa
from sqlalchemy.dialects import postgresql

revision = "0003_planning_engagements"
down_revision = "0002_seed_core"
branch_labels = None
depends_on = None


def upgrade() -> None:
  op.create_table(
    "annual_plans",
    sa.Column("id", postgresql.UUID(as_uuid=True), primary_key=True, server_default=sa.text("uuid_generate_v4()")),
    sa.Column("year", sa.Integer(), nullable=False),
    sa.Column("title", sa.Text(), nullable=False),
    sa.Column("status", sa.Text(), nullable=False, server_default=sa.text("'draft'")),
    sa.Column("created_at", sa.TIMESTAMP(timezone=True), nullable=False, server_default=sa.text("now()")),
    sa.UniqueConstraint("year", name="uq_annual_plans_year"),
  )
  op.create_index("ix_annual_plans_year", "annual_plans", ["year"])

  op.create_table(
    "engagements",
    sa.Column("id", postgresql.UUID(as_uuid=True), primary_key=True, server_default=sa.text("uuid_generate_v4()")),
    sa.Column(
      "annual_plan_id",
      postgresql.UUID(as_uuid=True),
      sa.ForeignKey("annual_plans.id", ondelete="CASCADE"),
      nullable=False,
    ),
    sa.Column("title", sa.Text(), nullable=False),
    sa.Column("scope", sa.Text(), nullable=True),
    sa.Column("risk_rating", sa.Text(), nullable=True),
    sa.Column("status", sa.Text(), nullable=False, server_default=sa.text("'planned'")),
    sa.Column("start_date", sa.Date(), nullable=True),
    sa.Column("end_date", sa.Date(), nullable=True),
    sa.Column("created_at", sa.TIMESTAMP(timezone=True), nullable=False, server_default=sa.text("now()")),
  )
  op.create_index("ix_engagements_plan", "engagements", ["annual_plan_id"])
  op.create_index("ix_engagements_status", "engagements", ["status"])

  op.create_table(
    "engagement_assignments",
    sa.Column(
      "engagement_id",
      postgresql.UUID(as_uuid=True),
      sa.ForeignKey("engagements.id", ondelete="CASCADE"),
      primary_key=True,
    ),
    sa.Column(
      "user_id",
      postgresql.UUID(as_uuid=True),
      sa.ForeignKey("users.id", ondelete="CASCADE"),
      primary_key=True,
    ),
    sa.Column("role", sa.Text(), nullable=False, server_default=sa.text("'auditor'")),
    sa.Column("assigned_at", sa.TIMESTAMP(timezone=True), nullable=False, server_default=sa.text("now()")),
  )

  op.execute(
    "INSERT INTO annual_plans(year, title, status) VALUES (extract(year from now())::int, 'الخطة السنوية', 'draft') ON CONFLICT DO NOTHING;"
  )


def downgrade() -> None:
  op.drop_table("engagement_assignments")
  op.drop_index("ix_engagements_status", table_name="engagements")
  op.drop_index("ix_engagements_plan", table_name="engagements")
  op.drop_table("engagements")
  op.drop_index("ix_annual_plans_year", table_name="annual_plans")
  op.drop_table("annual_plans")
