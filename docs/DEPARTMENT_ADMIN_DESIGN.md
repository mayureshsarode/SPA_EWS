# SPA-EWS Department-Wise Admin System Design

## Overview

This document outlines the design for a multi-department admin system, starting with CE (Computer Engineering) as the primary department.

---

## 1. Current State vs Target State

### Current (Universal Admin Only)
```
SPA-EWS
└── One admin manages everything
    ├── All departments visible
    ├── All students visible
    └── All faculty visible
```

### Target (Department-Scoped Admin)
```
SPA-EWS
├── SUPER_ADMIN (University Level)
│   ├── Manage all departments
│   ├── View all data
│   └── System settings
│
├── DEPT_ADMIN (Department Level)
│   ├── CE Admin
│   │   ├── View CE students only
│   │   ├── View CE faculty only
│   │   └── Manage CE courses
│   │
│   ├── E&TC Admin
│   ├── IT Admin
│   └── ... (per department)
│
└── FACULTY (Department Level)
    └── Standard faculty access
```

---

## 2. Database Schema Changes

### User Model Enhancement
```prisma
model User {
  id           String   @id @default(uuid())
  email        String   @unique
  passwordHash String
  name         String
  role         Role
  
  // Department association
  departmentId String
  department   Department @relation(fields: [departmentId], references: [id])
  
  // Admin scope (for ADMIN role only)
  adminScope   AdminScope @default(DEPARTMENT)
  
  // Role-specific profiles
  studentProfile  StudentProfile?
  facultyProfile  FacultyProfile?
}

enum AdminScope {
  UNIVERSAL    // Can manage entire university
  DEPARTMENT   // Can only manage their department
}

enum Role {
  STUDENT
  FACULTY
  ADMIN
  SUPER_ADMIN  // Highest level - always universal
}
```

---

## 3. Role Hierarchy

| Role | Scope | Can See | Can Manage |
|------|-------|---------|------------|
| SUPER_ADMIN | Universal | All data | Everything |
| DEPT_ADMIN | Department | Own dept data | Own department |
| FACULTY | Department | Assigned students | Own courses |
| STUDENT | Individual | Own data | Own data |

---

## 4. API Access Control

### Middleware Chain
```typescript
// 1. Authenticate (JWT valid?)
authenticate(req, res, next)

// 2. Check role (STUDENT/FACULTY/ADMIN)
roleGuard(...allowedRoles)

// 3. Check department scope (DEPARTMENT/UNIVERSAL)
departmentScopeGuard(requiredScope)

// 4. Scope data query (auto-add WHERE departmentId = ?)
scopeQuery(req, res, next)
```

### Example: Get Students
```typescript
// SUPER_ADMIN calling
GET /api/admin/students
→ Returns ALL students from ALL departments

// DEPT_ADMIN (CE) calling
GET /api/admin/students
→ Returns ONLY CE department students

// FACULTY calling
GET /api/admin/students
→ Returns 403 Forbidden (faculty can't access this endpoint)
```

---

## 5. Frontend Changes

### Admin Dashboard Updates
```typescript
// Super Admin sees
├── Department Selector (All / CE / E&TC / IT / ...)
├── Institution Stats (All departments)
├── Cross-Department Reports
└── User Management (All users)

// Department Admin sees
├── Department Selector (Disabled - own dept only)
├── Department Stats (CE only)
├── Department Reports
└── User Management (CE users only)
```

### Sidebar Navigation
```typescript
const adminNavItems = [
  { label: "Dashboard", path: "/admin", universal: true },
  { label: "Leadership", path: "/admin/leadership", universal: true },
  { label: "Users", path: "/admin/users", universal: false },  // Scoped to dept
  { label: "Departments", path: "/admin/departments", universal: true },
  { label: "Courses", path: "/admin/courses", universal: false },  // Scoped
  { label: "Reports", path: "/admin/reports", universal: false },
  { label: "Settings", path: "/admin/settings", universal: true },
];
```

---

## 6. Implementation Steps

### Step 1: Database Migration
```bash
npx prisma migrate dev --name add_admin_scope
```

### Step 2: Update Auth Service
```typescript
// In JWT payload
{
  userId: user.id,
  role: user.role,
  departmentId: user.departmentId,
  adminScope: user.adminScope,  // NEW
}
```

### Step 3: Add Department Scope Middleware
```typescript
// middleware/department-scope.ts
export function requireDeptScope(scope: 'UNIVERSAL' | 'DEPARTMENT') {
  return (req, res, next) => {
    const user = req.user;
    
    // SUPER_ADMIN always has universal access
    if (user.role === 'SUPER_ADMIN') return next();
    
    // UNIVERSAL admins (transition period)
    if (user.adminScope === 'UNIVERSAL' && scope === 'UNIVERSAL') return next();
    
    // DEPARTMENT scope required
    if (scope === 'DEPARTMENT' && user.departmentId) return next();
    
    return res.status(403).json({ 
      error: "Insufficient department access" 
    });
  };
}
```

### Step 4: Update All Service Queries
```typescript
// Add automatic department filtering
function addDepartmentScope(query: any, userId: string) {
  const user = await getUser(userId);
  
  if (user.role === 'SUPER_ADMIN') return query;  // No filter
  if (user.adminScope === 'UNIVERSAL') return query;  // No filter (transition)
  
  // Filter to user's department
  return {
    ...query,
    where: {
      ...query.where,
      departmentId: user.departmentId
    }
  };
}
```

---

## 7. Default Admin Accounts

### After Migration
| Email | Role | Scope | Department |
|-------|------|-------|------------|
| admin@spa-ews.edu.in | SUPER_ADMIN | UNIVERSAL | - |
| ce.admin@spa-ews.edu.in | ADMIN | DEPARTMENT | CE |
| entc.admin@spa-ews.edu.in | ADMIN | DEPARTMENT | E&TC |
| it.admin@spa-ews.edu.in | ADMIN | DEPARTMENT | IT |

---

## 8. Migration Strategy

### Phase 1: Add Field (No Breaking Changes)
1. Add `adminScope` field with default `DEPARTMENT`
2. Update all existing admins to `UNIVERSAL` (preserve current behavior)
3. Test with existing admin

### Phase 2: Create Department Admins
1. Create CE admin account
2. Create E&TC admin account
3. Test department isolation

### Phase 3: Update Frontend
1. Add department selector (Super Admin only)
2. Update sidebar based on scope
3. Update all data queries to filter by department

### Phase 4: Restrict Access
1. Update faculty queries to filter by department
2. Update student queries to filter by department
3. Remove universal access from department admins

---

## 9. Files to Modify

### Backend
```
prisma/schema.prisma           # Add adminScope field
src/services/auth.service.ts    # Include scope in JWT
src/middleware/scope.ts        # NEW - department scope middleware
src/services/admin.service.ts   # Filter by department
src/services/faculty.service.ts # Filter by department
src/services/student.service.ts # Filter by department
src/routes/admin.routes.ts      # Add scope checks
```

### Frontend
```
src/components/admin-layout.tsx  # Add department selector
src/pages/admin-dashboard.tsx     # Show scoped data
src/pages/admin-users.tsx         # Filter by department
src/pages/admin-courses.tsx       # Filter by department
```

---

## 10. Testing Checklist

- [ ] Super Admin can see all departments
- [ ] CE Admin sees only CE data
- [ ] E&TC Admin sees only E&TC data
- [ ] Faculty sees only assigned students
- [ ] Student sees only own data
- [ ] Cross-department access denied with 403
- [ ] Department selector works for Super Admin
- [ ] Department selector hidden for Dept Admin

---

## 11. Rollback Plan

If issues arise:
1. Set `adminScope = UNIVERSAL` for all users
2. Frontend hides department selector
3. All queries return unfiltered data
4. Deploy hotfix

---

*Design Version: 1.0*
*Target Implementation: Phase 2*
