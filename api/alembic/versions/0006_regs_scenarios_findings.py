from alembic import op
import sqlalchemy as sa
from sqlalchemy.dialects import postgresql

revision = "0006_regs_scenarios_findings"
down_revision = "0005_evidence_and_extractions"
branch_labels = None
depends_on = None


def upgrade() -> None:
  op.create_table(
    "regulations",
    sa.Column("id", postgresql.UUID(as_uuid=True), primary_key=True, server_default=sa.text("uuid_generate_v4()")),
    sa.Column("name", sa.Text(), nullable=False),
    sa.Column("version", sa.Text(), nullable=False, server_default=sa.text("'v1'")),
    sa.Column("created_at", sa.TIMESTAMP(timezone=True), nullable=False, server_default=sa.text("now()")),
    sa.UniqueConstraint("name", "version", name="uq_regulations_name_version"),
  )
  op.create_index("ix_regulations_name", "regulations", ["name"])

  op.create_table(
    "regulation_chunks",
    sa.Column("id", postgresql.UUID(as_uuid=True), primary_key=True, server_default=sa.text("uuid_generate_v4()")),
    sa.Column("regulation_id", postgresql.UUID(as_uuid=True), nullable=False),
    sa.Column("section_ref", sa.Text(), nullable=True),
    sa.Column("text", sa.Text(), nullable=False),
    sa.Column("metadata", sa.JSON(), nullable=False, server_default=sa.text("'{}'::jsonb")),
    sa.ForeignKeyConstraint(["regulation_id"], ["regulations.id"], ondelete="CASCADE"),
  )
  op.create_index("ix_regulation_chunks_regulation", "regulation_chunks", ["regulation_id"], unique=False)

  op.create_table(
    "comparison_scenarios",
    sa.Column("id", postgresql.UUID(as_uuid=True), primary_key=True, server_default=sa.text("uuid_generate_v4()")),
    sa.Column("name", sa.Text(), nullable=False),
    sa.Column("description", sa.Text(), nullable=True),
    sa.Column("rules", sa.JSON(), nullable=False),
    sa.Column("created_at", sa.TIMESTAMP(timezone=True), nullable=False, server_default=sa.text("now()")),
  )
  op.create_index("ix_comparison_scenarios_name", "comparison_scenarios", ["name"])

  op.create_table(
    "findings",
    sa.Column("id", postgresql.UUID(as_uuid=True), primary_key=True, server_default=sa.text("uuid_generate_v4()")),
    sa.Column("evidence_id", postgresql.UUID(as_uuid=True), nullable=False),
    sa.Column("scenario_id", postgresql.UUID(as_uuid=True), nullable=False),
    sa.Column("check_id", sa.Text(), nullable=False),
    sa.Column("title", sa.Text(), nullable=False),
    sa.Column("severity", sa.Text(), nullable=False),
    sa.Column("status", sa.Text(), nullable=False, server_default=sa.text("'open'")),
    sa.Column("details", sa.JSON(), nullable=False),
    sa.Column("created_at", sa.TIMESTAMP(timezone=True), nullable=False, server_default=sa.text("now()")),
    sa.ForeignKeyConstraint(["evidence_id"], ["evidence.id"], ondelete="CASCADE"),
    sa.ForeignKeyConstraint(["scenario_id"], ["comparison_scenarios.id"], ondelete="CASCADE"),
  )
  op.create_index("ix_findings_evidence_scenario", "findings", ["evidence_id", "scenario_id"], unique=False)

  op.execute(
    """
      INSERT INTO permissions(resource, action)
      VALUES
        ('regulations', 'create'),
        ('regulations', 'read'),
        ('scenarios', 'create'),
        ('scenarios', 'read'),
        ('findings', 'read')
      ON CONFLICT (resource, action) DO NOTHING;
    """
  )

  op.execute(
    """
      INSERT INTO role_permissions(role_id, perm_id)
      SELECT r.id, p.id
      FROM roles r
      JOIN permissions p ON p.resource = 'regulations' AND p.action = 'read'
      WHERE r.name IN ('Admin', 'IA Manager', 'Auditor')
      ON CONFLICT DO NOTHING;
    """
  )

  op.execute(
    """
      INSERT INTO role_permissions(role_id, perm_id)
      SELECT r.id, p.id
      FROM roles r
      JOIN permissions p ON p.resource = 'scenarios' AND p.action = 'read'
      WHERE r.name IN ('Admin', 'IA Manager', 'Auditor')
      ON CONFLICT DO NOTHING;
    """
  )

  op.execute(
    """
      INSERT INTO role_permissions(role_id, perm_id)
      SELECT r.id, p.id
      FROM roles r
      JOIN permissions p ON p.resource = 'findings' AND p.action = 'read'
      WHERE r.name IN ('Admin', 'IA Manager', 'Auditor')
      ON CONFLICT DO NOTHING;
    """
  )

  op.execute(
    """
      INSERT INTO role_permissions(role_id, perm_id)
      SELECT r.id, p.id
      FROM roles r
      JOIN permissions p ON p.resource = 'regulations' AND p.action = 'create'
      WHERE r.name IN ('Admin', 'IA Manager')
      ON CONFLICT DO NOTHING;
    """
  )

  op.execute(
    """
      INSERT INTO role_permissions(role_id, perm_id)
      SELECT r.id, p.id
      FROM roles r
      JOIN permissions p ON p.resource = 'scenarios' AND p.action = 'create'
      WHERE r.name IN ('Admin', 'IA Manager')
      ON CONFLICT DO NOTHING;
    """
  )


def downgrade() -> None:
  op.execute(
    "DELETE FROM role_permissions WHERE perm_id IN (SELECT id FROM permissions WHERE resource IN ('regulations', 'scenarios', 'findings'))"
  )
  op.execute("DELETE FROM permissions WHERE resource IN ('regulations', 'scenarios', 'findings')")
  op.drop_index("ix_findings_evidence_scenario", table_name="findings")
  op.drop_table("findings")
  op.drop_index("ix_comparison_scenarios_name", table_name="comparison_scenarios")
  op.drop_table("comparison_scenarios")
  op.drop_index("ix_regulation_chunks_regulation", table_name="regulation_chunks")
  op.drop_table("regulation_chunks")
  op.drop_index("ix_regulations_name", table_name="regulations")
  op.drop_table("regulations")
