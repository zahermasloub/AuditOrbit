# 🧭 Frontend Pages Report (Next.js App Router)

Generated: 2025-10-31

This report enumerates all discovered UI pages under `frontend/app/**/page.tsx` and groups them by feature area. Routes are inferred from folder structure (Next.js App Router). Descriptions are inferred from names.

---

## Summary

- Total pages: 28
- Areas:
  - General: 4
  - Admin: 10
  - Manager: 4
  - Auditor: 4
  - Ops: 6
- Layouts detected:
  - `frontend/app/layout.tsx`
  - `frontend/app/ops/layout.tsx`
- Not-found pages: none detected under `frontend/app/**/not-found.tsx`

---

## Routes tree (App Router)

```
/
├─ /login
├─ /dashboard
├─ /debug-token
├─ /admin
│  ├─ /admin/users
│  ├─ /admin/roles
│  ├─ /admin/engagements
│  ├─ /admin/evidence
│  ├─ /admin/reports
│  ├─ /admin/notifications
│  ├─ /admin/checklists
│  ├─ /admin/audit-log
│  └─ /admin/ai-lab
├─ /manager
│  ├─ /manager/engagements
│  ├─ /manager/findings
│  └─ /manager/reports
├─ /auditor
│  ├─ /auditor/tasks
│  ├─ /auditor/checklists
│  └─ /auditor/archive
└─ /ops
   ├─ /ops/api
   ├─ /ops/ai
   ├─ /ops/logs
   ├─ /ops/settings
   └─ /ops/storage
```

---

## General

| Route        | File Path                               | Purpose (inferred)           |
|--------------|------------------------------------------|------------------------------|
| /            | frontend/app/page.tsx                    | Landing/Home                 |
| /login       | frontend/app/login/page.tsx              | Sign in                      |
| /dashboard   | frontend/app/dashboard/page.tsx          | General dashboard            |
| /debug-token | frontend/app/debug-token/page.tsx        | Dev token debugger           |

---

## Admin

| Route               | File Path                                    | Purpose (inferred)             |
|---------------------|-----------------------------------------------|--------------------------------|
| /admin              | frontend/app/admin/page.tsx                   | Admin home                     |
| /admin/users        | frontend/app/admin/users/page.tsx             | Users management               |
| /admin/roles        | frontend/app/admin/roles/page.tsx             | Roles management               |
| /admin/engagements  | frontend/app/admin/engagements/page.tsx       | Audit engagements management   |
| /admin/evidence     | frontend/app/admin/evidence/page.tsx          | Evidence/files                 |
| /admin/reports      | frontend/app/admin/reports/page.tsx           | Admin reports                  |
| /admin/notifications| frontend/app/admin/notifications/page.tsx     | Notifications center           |
| /admin/checklists   | frontend/app/admin/checklists/page.tsx        | Checklists admin               |
| /admin/audit-log    | frontend/app/admin/audit-log/page.tsx         | Audit logs                     |
| /admin/ai-lab       | frontend/app/admin/ai-lab/page.tsx            | AI lab / experiments           |

---

## Manager

| Route                 | File Path                                         | Purpose (inferred)     |
|-----------------------|----------------------------------------------------|------------------------|
| /manager              | frontend/app/manager/page.tsx                      | Manager home           |
| /manager/engagements  | frontend/app/manager/engagements/page.tsx          | Manage engagements     |
| /manager/findings     | frontend/app/manager/findings/page.tsx             | Findings/observations  |
| /manager/reports      | frontend/app/manager/reports/page.tsx              | Manager reports        |

---

## Auditor

| Route                 | File Path                                         | Purpose (inferred)     |
|-----------------------|----------------------------------------------------|------------------------|
| /auditor              | frontend/app/auditor/page.tsx                      | Auditor home           |
| /auditor/tasks        | frontend/app/auditor/tasks/page.tsx                | Auditor tasks          |
| /auditor/checklists   | frontend/app/auditor/checklists/page.tsx           | Auditor checklists     |
| /auditor/archive      | frontend/app/auditor/archive/page.tsx              | Archived items         |

---

## Ops (Operations)

| Route         | File Path                                 | Purpose (inferred)             |
|---------------|--------------------------------------------|--------------------------------|
| /ops          | frontend/app/ops/page.tsx                  | Ops home                       |
| /ops/api      | frontend/app/ops/api/page.tsx              | API inspection/config          |
| /ops/ai       | frontend/app/ops/ai/page.tsx               | Ops AI tools                   |
| /ops/logs     | frontend/app/ops/logs/page.tsx             | System/service logs            |
| /ops/settings | frontend/app/ops/settings/page.tsx         | Ops settings                   |
| /ops/storage  | frontend/app/ops/storage/page.tsx          | Storage management             |

---

## Notes

- No dynamic routes like `[id]` were detected in the current tree; all pages are static paths.
- The presence of `layout.tsx` at `app/` and `app/ops/` indicates shared UI shells for those sections.
- If you add `not-found.tsx` per route group, Next.js will use section-specific 404 pages.

---

## How to view locally (optional)

```bash
# From project root (PowerShell)
cd frontend
npm run dev
# Visit http://localhost:3000 and navigate to the routes above
```
