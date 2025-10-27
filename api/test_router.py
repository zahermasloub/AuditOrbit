"""Test all routes registered in main app"""
import sys
sys.path.insert(0, 'd:\\AuditOrbit\\api')

from app.presentation import main

print('✅ FastAPI app loaded successfully')
print(f'\nTotal routes: {len(main.app.routes)}')
print('\nAll registered routes:')
for route in main.app.routes:
    if hasattr(route, 'methods') and hasattr(route, 'path'):
        methods = str(list(route.methods))
        print(f'  {methods:20} {route.path}')
    else:
        print(f'  {"[Mount/Static]":20} {route.path if hasattr(route, "path") else "Unknown"}')

print('\n🔍 Looking for /dashboard routes:')
dashboard_routes = [r for r in main.app.routes if hasattr(r, 'path') and '/dashboard' in r.path]
if dashboard_routes:
    print(f'  Found {len(dashboard_routes)} dashboard routes:')
    for route in dashboard_routes:
        print(f'    - {route.path}')
else:
    print('  ❌ NO DASHBOARD ROUTES FOUND!')
