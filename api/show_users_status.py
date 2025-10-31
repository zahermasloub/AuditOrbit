"""
عرض حالة المستخدمين بعد التحديث
Display users status after update
"""
from sqlalchemy import create_engine, text

DATABASE_URL = "postgresql://audit:auditpw@localhost:5432/auditdb"

engine = create_engine(DATABASE_URL)
conn = engine.connect()

users = conn.execute(text('SELECT name, email, active, role FROM users ORDER BY name')).fetchall()

print('\n' + '='*90)
print('📊 المستخدمون الحاليون في النظام')
print('='*90)

for user in users:
    active_status = "🟢 نشط" if user[2] else "🔴 معطل"
    print(f'  • {user[0]:30} | {user[1]:35} | {user[3]:15} | {active_status}')

print('='*90)
print(f'✅ إجمالي المستخدمين: {len(users)}')
print('='*90)

conn.close()
