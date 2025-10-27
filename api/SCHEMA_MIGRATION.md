# API Schema Migration Guide

## ✅ Database Schema (New - camelCase)

### Tables Structure:

#### engagements
- id (text)
- code (text) - NOT NULL
- title (text) - NOT NULL
- objective (text) - NOT NULL
- scopeJson (jsonb) - NOT NULL
- criteriaJson (jsonb) - NOT NULL
- constraintsJson (jsonb) - NOT NULL
- auditeeUnitsJson (jsonb) - NOT NULL
- stakeholdersJson (jsonb) - NOT NULL
- startDate (timestamp) - NOT NULL
- endDate (timestamp) - NOT NULL
- budgetHours (integer) - NOT NULL
- independenceDisclosureUrl (text) - NULL
- status (EngagementStatus ENUM) - NOT NULL, DEFAULT 'DRAFT'
- createdBy (text) - NOT NULL
- createdAt (timestamp) - NOT NULL, DEFAULT CURRENT_TIMESTAMP
- updatedAt (timestamp) - NOT NULL

#### annual_plans
- id (text)
- title (text) - NOT NULL
- fiscalYear (integer) - NOT NULL
- version (text) - NOT NULL
- status (PlanStatus ENUM) - NOT NULL
- introduction (text)
- totalAvailableHours (integer)
- plannedTaskHours (integer)
- advisoryHours (integer)
- emergencyHours (integer)
- followUpHours (integer)
- trainingHours (integer)
- administrativeHours (integer)
- estimatedBudget (double precision)
- createdBy (text) - NOT NULL
- createdAt (timestamp) - NOT NULL
- updatedAt (timestamp) - NOT NULL
- plan_ref (text) - NOT NULL
- prepared_date (date)
- approved_by (text)
- prepared_by_name (text)
- standards (text)
- methodology (text)
- objectives (text)
- risk_sources (text[])

#### users
- id (text)
- email (text) - NOT NULL
- name (text) - NOT NULL
- password (text) - NOT NULL
- locale (text) - DEFAULT 'ar'
- createdAt (timestamp)
- updatedAt (timestamp)

#### roles
- id (text)
- name (text) - NOT NULL

#### user_roles
- id (text)
- userId (text)
- roleId (text)

## 🔧 Status ENUM Values:

### EngagementStatus:
- DRAFT
- PLANNING
- IN_PROGRESS
- FIELDWORK
- REPORTING
- REVIEW
- COMPLETED
- CANCELLED

### PlanStatus:
- DRAFT
- SUBMITTED
- APPROVED
- PUBLISHED

## ✅ Completed Updates:
1. ✅ auth.py - Updated login query to fetch role
2. ✅ engagements.py - Updated to use camelCase columns
3. ✅ dashboard.py - Updated all queries to use camelCase

## 🔄 Files to Update:
- [ ] users.py
- [ ] roles.py
- [ ] manager.py
- [ ] auditor.py
- [ ] reports.py
- [ ] checklists.py
- [ ] evidence.py
- [ ] notifications.py
- [ ] All other routers

## 📝 Migration Notes:
- Old schema (snake_case) is NO LONGER USED
- All API code MUST use camelCase column names with quotes
- Status values are UPPERCASE ENUMS
- Foreign keys use camelCase (userId, roleId, fiscalYear, etc.)
