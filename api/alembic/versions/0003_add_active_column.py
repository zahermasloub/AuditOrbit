"""Add active column to users table

Revision ID: 0003_add_active_column
Revises: 0002_seed_core
Create Date: 2025-10-30

"""
from alembic import op
import sqlalchemy as sa

# revision identifiers
revision = "0003_add_active_column"
down_revision = "0002_seed_core"
branch_labels = None
depends_on = None


def upgrade() -> None:
    # Add 'active' column to users table with default value True
    op.add_column(
        "users",
        sa.Column("active", sa.Boolean(), nullable=False, server_default=sa.text("true"))
    )
    
    # Create index on active column for faster queries
    op.create_index("idx_users_active", "users", ["active"])
    
    # Update existing users to be active by default
    op.execute("UPDATE users SET active = true WHERE active IS NULL")


def downgrade() -> None:
    # Remove index
    op.drop_index("idx_users_active", "users")
    
    # Remove column
    op.drop_column("users", "active")
