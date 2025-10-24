from alembic import op
import sqlalchemy as sa
from sqlalchemy.dialects import postgresql

# revision identifiers
revision = "0001_auth_rbac_audit"
down_revision = None
branch_labels = None
depends_on = None


def upgrade() -> None:
  op.execute('CREATE EXTENSION IF NOT EXISTS "uuid-ossp";')
  op.execute('CREATE EXTENSION IF NOT EXISTS "pgcrypto";')

  op.create_table(
    "users",
    sa.Column("id", postgresql.UUID(as_uuid=True), primary_key=True, server_default=sa.text("uuid_generate_v4()")),
    sa.Column("email", sa.Text(), nullable=False, unique=True),
    sa.Column("name", sa.Text(), nullable=False),
    sa.Column("hashed_password", sa.Text(), nullable=False),
    sa.Column("locale", sa.Text(), nullable=False, server_default=sa.text("'ar'")),
    sa.Column("tz", sa.Text(), nullable=False, server_default=sa.text("'Asia/Qatar'")),
    sa.Column("active", sa.Boolean(), nullable=False, server_default=sa.text("true")),
    sa.Column("created_at", sa.TIMESTAMP(timezone=True), nullable=False, server_default=sa.text("now()")),
  )
  op.create_table(
    "roles",
    sa.Column("id", sa.Integer(), primary_key=True),
    sa.Column("name", sa.Text(), nullable=False, unique=True),
  )
  op.create_table(
    "permissions",
    sa.Column("id", sa.Integer(), primary_key=True),
    sa.Column("resource", sa.Text(), nullable=False),
    sa.Column("action", sa.Text(), nullable=False),
    sa.UniqueConstraint("resource", "action", name="uq_permissions_resource_action"),
  )
  op.create_table(
    "user_roles",
    sa.Column("user_id", postgresql.UUID(as_uuid=True), sa.ForeignKey("users.id", ondelete="CASCADE"), primary_key=True),
    sa.Column("role_id", sa.Integer(), sa.ForeignKey("roles.id", ondelete="CASCADE"), primary_key=True),
  )
  op.create_table(
    "role_permissions",
    sa.Column("role_id", sa.Integer(), sa.ForeignKey("roles.id", ondelete="CASCADE"), primary_key=True),
    sa.Column("perm_id", sa.Integer(), sa.ForeignKey("permissions.id", ondelete="CASCADE"), primary_key=True),
  )
  op.create_table(
    "audit_logs",
    sa.Column("id", sa.BigInteger(), primary_key=True, autoincrement=True),
    sa.Column("actor_id", postgresql.UUID(as_uuid=True), sa.ForeignKey("users.id")),
    sa.Column("action", sa.Text(), nullable=False),
    sa.Column("resource", sa.Text(), nullable=False),
    sa.Column("resource_id", postgresql.UUID(as_uuid=True), nullable=True),
    sa.Column("at", sa.TIMESTAMP(timezone=True), nullable=False, server_default=sa.text("now()")),
    sa.Column("ip", sa.Text(), nullable=True),
  )


def downgrade() -> None:
  op.drop_table("audit_logs")
  op.drop_table("role_permissions")
  op.drop_table("user_roles")
  op.drop_table("permissions")
  op.drop_table("roles")
  op.drop_table("users")
