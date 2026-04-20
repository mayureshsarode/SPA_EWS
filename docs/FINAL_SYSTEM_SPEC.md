# SPA-EWS: Final System Specification

This document is the definitive source of truth for the Student Performance Analytics & Early Warning System (SPA-EWS). It outlines the architecture, data conventions, and business logic required for a production-ready implementation.

---

## 1. User & Authentication Logic

### 1.1 Credential Schemes
All users share a common initial password that must be resettable in Phase 2.

| User Role | Username Format | Example | Initial Password |
|:--- |:--- |:--- |:--- |
| **Students** | `fYYbranchXXX` | `f24ce240` (SE Comp), `f25et002` (FE Entc) | `spaews123` |
| **Faculties** | `firstname.lastname@spa-ews.edu.in` | `geetanjali.kale@spa-ews.edu.in` | `spaews123` |
| **Admins** | `firstname.lastname@spa-ews.edu.in` | `system.admin@spa-ews.edu.in` | `spaews123` |

### 1.2 Access Permissions
The system enforces a strict "Need to Know" policy for AI insights to protect student privacy and reduce backend load.

| Component | Admin | Faculty (Teacher) | Faculty (Mentor) | Student |
|:--- |:---:|:---:|:---:|:---:|
| User/System Management | ✅ | ❌ | ❌ | ❌ |
| Heatmaps & Trends (Global) | ✅ | ❌ | ❌ | ❌ |
| View All Dept Insights | ✅ | ❌ | ❌ | ❌ |
| Mark Attendance & Marks | ❌ | ✅ | ❌ | ❌ |
| **View Mentee AI Insights** | ❌ | ❌ | ✅ | ❌ |
| **Mentor-Mentee Chat** | ❌ | ❌ | ✅ | ✅ |
| View Personal Risk Reports | ❌ | ❌ | ❌ | ✅ |

---

## 2. Institutional Structure

### 2.1 Branch & Department Codes
The following codes are used for PRN generation and internal database mapping:
- **Computer Engineering**: `ce`
- **Electronics & Telecom**: `et`
- **Information Technology**: `it`
- **AI & Data Science**: `ad`
- **Electronics & Computer**: `ec`
- **First Year (General)**: `fy` (for department mapping only)

### 2.2 Global Division Mapping
The system uses a sequential numbering system (`1` to `13`) to identify divisions globally.

| Year | Divisions | Department Assignment |
|:--- |:--- |:--- |
| **First Year (FE)** | `FE-1` to `FE-13` | Attached to **FY Department** (Branch distributed) |
| **Second Year (SE)** | `SE-1` to `SE-4` | Computer Engineering (CE) |
| **Second Year (SE)** | `SE-5` to `SE-8` | Electronics & Telecom (ENTC) |
| **Second Year (SE)** | `SE-9` to `SE-11` | Information Technology (IT) |
| **Second Year (SE)** | `SE-12` | AI & Data Science (AIDS) |
| **Second Year (SE)** | `SE-13` | Electronics & Computer (ECE) |

---

## 3. Data Integrity & ML Requirements

### 3.1 Chronological Student Lifecycle
To train the Early Warning System (EWS), students are treated as continuous entities. Every active profile **must** include historical performance data.

*   **FE Batch (f25)**: Currently in **Semester 2**. Must have completed **Semester 1** data (Marks + Attendance).
*   **SE Batch (f24)**: Currently in **Semester 4**. Must have completed **Semester 1, 2, and 3** data.

### 3.2 Required AI Predictors
Every student profile record must be accompanied by an `AcademicHistory` record containing:
- **10th Standard Percentage**
- **12th Standard / Diploma Percentage**
- **Admission Type** (Regular / DSE)

### 3.3 Feature Scope (Phase 1)
- **Mentor Assignment**: Mandatory. Every student must be linked to 1 Faculty Mentor from their core branch.
- **Attendance**: Tracked as `Lectures Attended` vs `Lectures Conducted`.
- **Marks**: CIE (Internal) and External scores.
- **Duty Leave**: **EXCLUDED** from Phase 1. Logic should focus on raw academic performance.

---

## 4. Faculty Management & Roles

### 4.1 Seniority & HODs
- **Department Admins (HODs)**: Assigned to one senior faculty member per department. Criteria: Ph.D. qualification + Seniority (earliest joining date).
- **Mentors**: All regular faculty members should be assigned a batch of ~15-20 mentees.
- **Class Coordinators**: One faculty assigned per division (e.g., Coordinator of `SE-9`).

### 4.2 Credentials
Faculties use their official email `firstname.lastname@spa-ews.edu.in` derived from the provided PICT faculty lists.
