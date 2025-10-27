import psycopg2

conn = psycopg2.connect(
    host="localhost",
    port=5432,
    database="auditdb",
    user="audit",
    password="auditpw"
)
cursor = conn.cursor()

# Check for audit tables
cursor.execute("""
    SELECT table_name 
    FROM information_schema.tables 
    WHERE table_schema = 'public' 
    AND table_name LIKE '%audit%'
""")
tables = cursor.fetchall()
print("Audit tables:", [t[0] for t in tables])

# Check audit_logs structure if exists
if any('audit_logs' in str(t) for t in tables):
    cursor.execute("""
        SELECT column_name, data_type 
        FROM information_schema.columns 
        WHERE table_name = 'audit_logs'
    """)
    columns = cursor.fetchall()
    print("\naudit_logs columns:")
    for col in columns:
        print(f"  {col[0]}: {col[1]}")

cursor.close()
conn.close()
