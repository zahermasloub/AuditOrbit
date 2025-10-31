"""Add required columns and RBAC tables

Revision ID: 0012_add_required_columns_and_rbac
Revises: 0011_wp_samples_crud_and_indexes
Create Date: 2025-10-31
"""

from alembic import op
import sqlalchemy as sa
from sqlalchemy.exc import NoSuchTableError
from typing import Any


revision = "0012_add_required_columns_and_rbac"
down_revision = "0011_wp_samples_crud_and_indexes"
branch_labels = None
depends_on = None


def _has_table(conn: Any, name: str) -> bool:
    return sa.inspect(conn).has_table(name)


def _has_column(inspector: Any, table: str, column: str) -> bool:
    try:
        return any((col.get("name") == column) for col in inspector.get_columns(table))
    except NoSuchTableError:
        return False


def upgrade() -> None:
    conn = op.get_bind()
    inspector = sa.inspect(conn)

    if not _has_column(inspector, "users", "tz"):
        op.add_column("users", sa.Column("tz", sa.String(length=64), nullable=True))

    if not _has_column(inspector, "annual_plans", "year"):
        op.add_column("annual_plans", sa.Column("year", sa.Integer(), nullable=True))

    if not _has_column(inspector, "engagements", "annual_plan_id"):
        op.add_column("engagements", sa.Column("annual_plan_id", sa.Integer(), nullable=True))

    if not any(
        "annual_plan_id" in (fk.get("constrained_columns") or [])
        for fk in inspector.get_foreign_keys("engagements")
    ):
        op.create_foreign_key(
            None,
            "engagements",
            "annual_plans",
            local_cols=["annual_plan_id"],
            remote_cols=["id"],
            ondelete=None,
        )

    if not _has_table(conn, "user_roles"):
        op.create_table(
            "user_roles",
            sa.Column("user_id", sa.Integer(), nullable=False),
            sa.Column("role_id", sa.Integer(), nullable=False),
            sa.ForeignKeyConstraint(["user_id"], ["users.id"], ondelete="CASCADE"),
            sa.ForeignKeyConstraint(["role_id"], ["roles.id"], ondelete="CASCADE"),
            sa.PrimaryKeyConstraint("user_id", "role_id"),
        )
        op.create_index("ix_user_roles_user_id", "user_roles", ["user_id"])
        op.create_index("ix_user_roles_role_id", "user_roles", ["role_id"])

    if not _has_table(conn, "role_permissions"):
        op.create_table(
            "role_permissions",
            sa.Column("role_id", sa.Integer(), nullable=False),
            sa.Column("perm_id", sa.Integer(), nullable=False),
            sa.ForeignKeyConstraint(["role_id"], ["roles.id"], ondelete="CASCADE"),
            sa.ForeignKeyConstraint(["perm_id"], ["permissions.id"], ondelete="CASCADE"),
            sa.PrimaryKeyConstraint("role_id", "perm_id"),
        )
        op.create_index("ix_role_permissions_role_id", "role_permissions", ["role_id"])
        op.create_index(
            "ix_role_permissions_perm_id",
            "role_permissions",
            ["perm_id"],
        )


def downgrade() -> None:
    conn = op.get_bind()
    inspector = sa.inspect(conn)

    if _has_table(conn, "role_permissions"):
        op.drop_index("ix_role_permissions_perm_id", table_name="role_permissions")
        op.drop_index("ix_role_permissions_role_id", table_name="role_permissions")
        op.drop_table("role_permissions")

    if _has_table(conn, "user_roles"):
        op.drop_index("ix_user_roles_role_id", table_name="user_roles")
        op.drop_index("ix_user_roles_user_id", table_name="user_roles")
        op.drop_table("user_roles")

    for fk in inspector.get_foreign_keys("engagements"):
        constrained = fk.get("constrained_columns") or []
        if "annual_plan_id" in constrained:
            constraint_name = fk.get("name")
            if constraint_name:
                op.drop_constraint(constraint_name, "engagements", type_="foreignkey")

    if _has_column(inspector, "engagements", "annual_plan_id"):
        op.drop_column("engagements", "annual_plan_id")

    if _has_column(inspector, "annual_plans", "year"):
        op.drop_column("annual_plans", "year")

    if _has_column(inspector, "users", "tz"):
        op.drop_column("users", "tz")
