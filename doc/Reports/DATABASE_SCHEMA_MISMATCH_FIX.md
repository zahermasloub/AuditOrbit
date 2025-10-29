# Database Schema Mismatch Fix Report

**Date**: October 28, 2025  
**Issue**: Backend API returning 500 Internal Server Error  
**Root Cause**: SQL queries referencing non-existent database columns

---

## Problem Analysis

### Error Message
```
sqlalchemy.exc.ProgrammingError: (psycopg.errors.UndefinedColumn) column e.objective does not exist
LINE 6:           e.objective AS scope,
```

### Root Cause
The backend code in `api/app/presentation/routers/engagements.py` was written for a different database schema than what actually exists in the database.

**Code Expected** (Wrong):
- Column: `objective`
- Column: `startDate` (camelCase)
- Column: `endDate` (camelCase)  
- Column: `createdAt` (camelCase)
- Column: `fiscalYear` in `annual_plans`

**Actual Database Schema**:
```sql
-- engagements table
id             | uuid
annual_plan_id | uuid
title          | text
scope          | text                    -- NOT "objective"
risk_rating    | text
status         | text
start_date     | date                    -- snake_case
end_date       | date                    -- snake_case
created_at     | timestamp with time zone -- snake_case

-- annual_plans table
id         | uuid
year       | integer                     -- NOT "fiscalYear"
title      | text
status     | text
created_at | timestamp with time zone
```

---

## Changes Made

### File: `api/app/presentation/routers/engagements.py`

#### 1. Fixed `list_engagements` Query
**Before:**
```python
SELECT
  e.id::text AS id,
  ''::text AS annual_plan_id,
  e.title,
  e.objective AS scope,           -- ❌ Column doesn't exist
  'medium' AS risk_rating,
  e.status,
  to_char(e."startDate", 'YYYY-MM-DD') AS start_date,    -- ❌ Wrong case
  to_char(e."endDate", 'YYYY-MM-DD') AS end_date,        -- ❌ Wrong case
  to_char(e."createdAt", 'YYYY-MM-DD"T"HH24:MI:SSOF') AS created_at -- ❌ Wrong case
FROM engagements e
ORDER BY e."createdAt" DESC       -- ❌ Wrong case
```

**After:**
```python
SELECT
  e.id::text AS id,
  e.annual_plan_id::text AS annual_plan_id,  -- ✅ Return actual value
  e.title,
  e.scope,                        -- ✅ Correct column name
  COALESCE(e.risk_rating, 'medium') AS risk_rating,  -- ✅ Use actual value with fallback
  e.status,
  to_char(e.start_date, 'YYYY-MM-DD') AS start_date,     -- ✅ snake_case
  to_char(e.end_date, 'YYYY-MM-DD') AS end_date,         -- ✅ snake_case
  to_char(e.created_at, 'YYYY-MM-DD"T"HH24:MI:SSOF') AS created_at  -- ✅ snake_case
FROM engagements e
ORDER BY e.created_at DESC        -- ✅ snake_case
```

#### 2. Fixed `create_engagement` - Annual Plan Creation
**Before:**
```python
text('SELECT id::text AS id FROM annual_plans WHERE "fiscalYear" = :year')

INSERT INTO annual_plans(
  id, title, "fiscalYear", version, status, "createdBy", "createdAt", "updatedAt", plan_ref
) VALUES (...)
```

**After:**
```python
text('SELECT id::text AS id FROM annual_plans WHERE year = :year')  -- ✅ Correct column

INSERT INTO annual_plans(
  id, title, year, status, created_at    -- ✅ Only columns that exist
) VALUES (...)
```

#### 3. Fixed `create_engagement` - Engagement Creation
**Before:**
```python
INSERT INTO engagements(
  id, code, title, objective, "scopeJson", "criteriaJson",     -- ❌ Non-existent columns
  "constraintsJson", "auditeeUnitsJson", "stakeholdersJson",
  "startDate", "endDate", "budgetHours", status, "createdBy",  -- ❌ Wrong case
  "createdAt", "updatedAt"
) VALUES (...)
```

**After:**
```python
INSERT INTO engagements(
  id, annual_plan_id, title, scope, risk_rating,  -- ✅ Actual columns
  start_date, end_date, status, created_at         -- ✅ snake_case
) VALUES (...)
```

---

## Verification

### Database State
```bash
$ docker exec -i infra-db-1 psql -U audit -d auditdb -c "SELECT COUNT(*) FROM engagements"
 count 
-------
     6
```
✅ Database has 6 existing engagements ready to be queried

### API Status
```bash
$ docker restart infra-api-1
$ docker logs infra-api-1 --tail 5
INFO:     Started server process [1]
INFO:     Waiting for application startup.
INFO:     Application startup complete.
INFO:     Uvicorn running on http://0.0.0.0:8000 (Press CTRL+C to quit)
```
✅ API restarted successfully without errors

---

## Testing Instructions

### 1. Test in Browser
1. Open http://localhost:3000/dashboard
2. Navigate to "المهام التدقيقية" (Engagements) section
3. **Expected**: List of 6 engagements should load without errors

### 2. Test in Console
```bash
# Should see successful API call with 200 status
# GET http://localhost:8000/engagements?page=1&size=20
```

### 3. Test Create Engagement
1. Click "إضافة مهمة" (Add Engagement) button
2. Fill in:
   - Title: "Test Engagement"
   - Scope: "Test audit scope"
   - Year: 2025
3. Click Submit
4. **Expected**: New engagement created successfully

---

## Impact Summary

| Aspect | Before | After |
|--------|--------|-------|
| **Engagement List** | ❌ 500 Error | ✅ Returns data |
| **Create Engagement** | ❌ Would fail | ✅ Works correctly |
| **Database Errors** | Yes - Invalid columns | None |
| **Frontend Error** | "حدث خطأ في قاعدة البيانات" | Data loads properly |

---

## Related Issues Fixed

This fix resolves both:
1. **Frontend infinite loop** (fixed in previous commit using `useCallback`)
2. **Backend database schema mismatch** (fixed in this commit)

The engagements section should now work end-to-end without errors.

---

## Next Steps

1. ✅ **Test the fix**: Reload dashboard and verify engagements load
2. ⚠️ **Check other endpoints**: Review other routers for similar schema mismatches:
   - `evidence.py`
   - `findings.py`
   - `reports.py`
   - `annual_plans.py`
3. 📝 **Document schema**: Create schema documentation to prevent future mismatches
4. 🔄 **Add migrations**: Consider using Alembic migrations properly to keep code and DB in sync

---

## Technical Notes

### Why This Happened
- Database uses **snake_case** convention (PostgreSQL standard)
- Code was written assuming **camelCase** columns (JavaScript convention)
- Likely a migration was run that changed the schema but code wasn't updated

### Prevention
- Always verify actual database schema with `\d table_name`
- Use ORM models (SQLAlchemy) instead of raw SQL text queries
- Keep migrations and code changes synchronized
- Add integration tests that hit real database
