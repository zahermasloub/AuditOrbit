from alembic import op
import sqlalchemy as sa
from sqlalchemy.dialects import postgresql

revision = "0005_evidence_and_extractions"
down_revision = "0004_checklists_dispatch"
branch_labels = None
depends_on = None


def upgrade() -> None:
  op.create_table(
    "evidence",
    sa.Column("id", postgresql.UUID(as_uuid=True), primary_key=True, server_default=sa.text("uuid_generate_v4()")),
    sa.Column(
      "engagement_id",
      postgresql.UUID(as_uuid=True),
      sa.ForeignKey("engagements.id", ondelete="CASCADE"),
      nullable=False,
    ),
    sa.Column(
      "uploader_id",
      postgresql.UUID(as_uuid=True),
      sa.ForeignKey("users.id", ondelete="SET NULL"),
      nullable=True,
    ),
    sa.Column("object_key", sa.Text(), nullable=False),
    sa.Column("bucket", sa.Text(), nullable=False),
    sa.Column("filename", sa.Text(), nullable=False),
    sa.Column("mime_type", sa.Text(), nullable=True),
    sa.Column("size_bytes", sa.BigInteger(), nullable=True),
    sa.Column(
      "status",
      sa.Text(),
      nullable=False,
      server_default=sa.text("'uploaded'"),
    ),
    sa.Column(
      "created_at",
      sa.TIMESTAMP(timezone=True),
      nullable=False,
      server_default=sa.text("now()"),
    ),
  )
  op.create_index("ix_evidence_engagement", "evidence", ["engagement_id"])
  op.create_index("ix_evidence_uploader", "evidence", ["uploader_id"])

  op.create_table(
    "evidence_extractions",
    sa.Column("id", postgresql.UUID(as_uuid=True), primary_key=True, server_default=sa.text("uuid_generate_v4()")),
    sa.Column(
      "evidence_id",
      postgresql.UUID(as_uuid=True),
      sa.ForeignKey("evidence.id", ondelete="CASCADE"),
      nullable=False,
    ),
    sa.Column(
      "extracted_at",
      sa.TIMESTAMP(timezone=True),
      nullable=False,
      server_default=sa.text("now()"),
    ),
    sa.Column("source_type", sa.Text(), nullable=True),
    sa.Column("json_payload", sa.JSON(), nullable=False),
    sa.Column("confidence", sa.Numeric(5, 2), nullable=True),
  )
  op.create_index("ix_evidence_extractions_evidence", "evidence_extractions", ["evidence_id"])

  op.execute(
    """
      INSERT INTO permissions(resource, action)
      VALUES
        ('evidence', 'create'),
        ('evidence', 'read')
      ON CONFLICT (resource, action) DO NOTHING;
    """
  )
  op.execute(
    """
      INSERT INTO role_permissions(role_id, perm_id)
      SELECT 1, p.id FROM permissions p
      WHERE p.resource = 'evidence'
      ON CONFLICT DO NOTHING;
    """
  )
  op.execute(
    """
      INSERT INTO role_permissions(role_id, perm_id)
      SELECT 2, p.id FROM permissions p
      WHERE p.resource = 'evidence' AND p.action IN ('create', 'read')
      ON CONFLICT DO NOTHING;
    """
  )
  op.execute(
    """
      INSERT INTO role_permissions(role_id, perm_id)
      SELECT 3, p.id FROM permissions p
      WHERE p.resource = 'evidence' AND p.action = 'read'
      ON CONFLICT DO NOTHING;
    """
  )


def downgrade() -> None:
  op.execute(
    "DELETE FROM role_permissions WHERE role_id IN (1, 2, 3) AND perm_id IN (SELECT id FROM permissions WHERE resource = 'evidence')"
  )
  op.execute("DELETE FROM permissions WHERE resource = 'evidence'")
  op.drop_index("ix_evidence_extractions_evidence", table_name="evidence_extractions")
  op.drop_table("evidence_extractions")
  op.drop_index("ix_evidence_uploader", table_name="evidence")
  op.drop_index("ix_evidence_engagement", table_name="evidence")
  op.drop_table("evidence")
