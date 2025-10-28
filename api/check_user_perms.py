import psycopg

conn = psycopg.connect('postgresql://audit:auditpw@localhost:5432/auditdb')
cur = conn.cursor()

# عدد الصلاحيات
cur.execute('''
    SELECT COUNT(*) 
    FROM role_permissions rp 
    JOIN user_roles ur ON rp.role_id = ur.role_id 
    JOIN users u ON ur.user_id = u.id 
    WHERE u.email = %s
''', ('admintest@test.com',))

count = cur.fetchone()[0]
print(f'\n✅ عدد الصلاحيات: {count}')

# أمثلة على الصلاحيات
cur.execute('''
    SELECT p.resource, p.action 
    FROM permissions p 
    JOIN role_permissions rp ON p.id = rp.perm_id 
    JOIN user_roles ur ON rp.role_id = ur.role_id 
    JOIN users u ON ur.user_id = u.id 
    WHERE u.email = %s 
    LIMIT 10
''', ('admintest@test.com',))

perms = cur.fetchall()
print(f'\nأمثلة على الصلاحيات:')
for p in perms:
    print(f'  - {p[0]}: {p[1]}')

cur.close()
conn.close()
