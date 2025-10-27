from app.infrastructure.db.session import engine
from sqlalchemy import text, inspect

try:
    # Get table columns
    inspector = inspect(engine)
    columns = inspector.get_columns('users')
    print('✅ Users table columns:')
    for col in columns:
        print(f'  - {col["name"]}: {col["type"]}')
    
    conn = engine.connect()
    
    # Test users table
    result = conn.execute(text('SELECT * FROM users LIMIT 1'))
    row = result.fetchone()
    if row:
        print(f'\n✅ Users table accessible')
        print(f'Sample data: {dict(row._mapping)}')
    else:
        print('\n⚠️ Users table is empty - need to seed data')
    
    conn.close()
except Exception as e:
    print(f'❌ Database Error: {e}')

