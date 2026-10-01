# Employee Onboarding Portal — Requirements Specification

## 1. System Overview
The **Employee Onboarding Portal** is a role-based, self-service and management platform designed to streamline the transition of new hires from offer acceptance to full organizational integration. The platform eliminates manual paperwork, ensures regulatory compliance, orchestrates cross-department tasks (HR, IT, Management), and provides transparent progress tracking for all stakeholders.

---

## 2. User Roles & Personas

| Role | Persona Name | Key Responsibility | Primary Goals |
|---|---|---|---|
| **Admin** | System Administrator (Alex) | System configuration, user provisioning, security, and audit oversight | Ensure system uptime, manage user accounts and global settings, inspect audit trails. |
| **HR** | HR Specialist (Hannah) | Onboarding candidate initiation, document verification, checklist tracking, and final sign-off | Reduce time-to-onboard, verify candidate documents, enforce policy compliance, prevent onboarding bottlenecks. |
| **Manager** | Department Manager (Marcus) | Team onboarding readiness, role-specific task assignments, and milestone approvals | Ensure direct reports have required equipment, training, and team introductions before and during week one. |
| **Employee** | New Joiner (Emma) | Profile completion, document submission, task execution, and progress tracking | Understand onboarding expectations, complete compliance items effortlessly, and begin work productively. |

---

## 3. User Stories & Acceptance Criteria

### 3.1. System Administrator (Admin)

#### US-ADM-01: User & Role Management
- **As an** Admin,
- **I want to** view, create, activate, deactivate, and assign roles to system users,
- **So that** only authorized personnel can access appropriate operational features.
- **Acceptance Criteria**:
  1. Admin can view a paginated/searchable list of all registered users with their name, email, assigned role, and status (Active/Inactive).
  2. Admin can change a user's role between `ADMIN`, `HR`, `MANAGER`, and `EMPLOYEE`.
  3. Admin cannot deactivate or delete their own active admin session account.
  4. Changes to user status or role take effect immediately upon subsequent requests.

#### US-ADM-02: System Audit Logs
- **As an** Admin,
- **I want to** review immutable audit logs of critical actions (logins, document approvals/rejections, status changes),
- **So that** the organization maintains a verifiable compliance and security trail.
- **Acceptance Criteria**:
  1. Each audit log records: timestamp, initiating user, action type, entity affected, IP/user agent, and delta/details.
  2. Logs are filterable by action, date range, and actor.
  3. Audit logs cannot be edited or deleted through the UI.

#### US-ADM-03: Department & Global Configuration
- **As an** Admin,
- **I want to** configure company departments, designations, and system default settings,
- **So that** the onboarding templates reflect the organization's structure.
- **Acceptance Criteria**:
  1. Admin can add, edit, or archive departments (e.g., Engineering, Marketing, Sales, HR).
  2. Deleted departments with assigned employees cannot be hard-deleted; system displays an explanatory warning.

---

### 3.2. Human Resources (HR)

#### US-HR-01: Onboarding Initiation & Assignment
- **As an** HR Specialist,
- **I want to** initiate an onboarding record for a new employee by selecting their department, reporting manager, joining date, template, and target deadline,
- **So that** an automated onboarding workspace is provisioned for the new hire.
- **Acceptance Criteria**:
  1. HR selects an employee or enters candidate details (name, email, job title, department, manager).
  2. System auto-generates unique `employeeCode` and links to an onboarding workflow.
  3. Predefined checklist items and tasks from the selected template are automatically instantiated.
  4. The employee and manager receive welcome notifications.

#### US-HR-02: HR Analytics Dashboard
- **As an** HR Specialist,
- **I want to** monitor aggregate metrics and individual candidate progression on a centralized dashboard,
- **So that** I can identify bottlenecks, overdue tasks, and pending approvals at a glance.
- **Acceptance Criteria**:
  1. Dashboard displays real-time stat cards:
     - Total Employees
     - New Joiners (Last 30 days)
     - Onboarding Status (Pending vs Completed)
     - Pending Document Reviews
     - Overdue Tasks
     - Pending Multi-level Approvals
  2. Data table lists all active onboardings with candidate name, department, joining date, progress bar (0-100%), and current approval stage.
  3. Table provides instant search by name/email, filtering by department/status, and multi-column sorting.

#### US-HR-03: Document Verification & Review Workflow
- **As an** HR Specialist,
- **I want to** inspect uploaded employee documents (preview in-browser) and mark them as Approved or Rejected with feedback,
- **So that** only compliant, authentic documents are accepted.
- **Acceptance Criteria**:
  1. HR can preview PDF and image documents directly inside a viewer modal without downloading.
  2. HR can click "Approve" (transitions status to `APPROVED`, timestamps verification, credits progress %).
  3. HR can click "Reject", requiring a mandatory rejection reason (transitions status to `REJECTED`, alerts employee, enables re-upload).
  4. Rejection history and comments remain visible to both HR and the employee.

#### US-HR-04: Multi-Level Approval Sign-Off
- **As an** HR Specialist,
- **I want to** perform Initial HR Review and Final HR Sign-Off in the approval pipeline,
- **So that** the employee is verified before manager review and formally completed after manager approval.
- **Acceptance Criteria**:
  1. Stage 1 (HR Initial Review): HR confirms profile and core documents are complete.
  2. Stage 3 (HR Final Approval): After Manager approves, HR issues the final sign-off.
  3. Upon final sign-off, the onboarding status switches to `COMPLETED` and the employee profile is marked fully onboarded.

---

### 3.3. Reporting Manager (Manager)

#### US-MGR-01: Direct Reports Onboarding Overview
- **As a** Reporting Manager,
- **I want to** view only the employees assigned to my reporting hierarchy,
- **So that** I can track their onboarding milestones without distraction.
- **Acceptance Criteria**:
  1. Manager dashboard displays a filtered list of direct report joiners.
  2. Manager sees each employee's progress percentage, joining date, and current stage.

#### US-MGR-02: Manager Task Assignment & Collaboration
- **As a** Reporting Manager,
- **I want to** create and assign team-specific tasks (e.g., 1-on-1 intro, code repository setup, project shadow) with priorities and deadlines,
- **So that** the employee has clear early deliverables.
- **Acceptance Criteria**:
  1. Manager can assign tasks with Priority (`LOW`, `MEDIUM`, `HIGH`, `URGENT`) and due dates.
  2. Manager can comment on tasks and view employee comments or submitted deliverables.

#### US-MGR-03: Manager Approval Gate
- **As a** Reporting Manager,
- **I want to** review the new hire's completed tasks and readiness, then provide Manager Approval,
- **So that** the onboarding process advances to final HR sign-off.
- **Acceptance Criteria**:
  1. Manager Approval stage is unlocked once HR Initial Review is approved.
  2. Manager can review candidate readiness, leave feedback, and click "Approve" or "Request Changes".
  3. Approved manager gate automatically notifies HR for final sign-off.

---

### 3.4. New Employee (Employee)

#### US-EMP-01: Secure Authentication & Password Management
- **As a** New Employee,
- **I want to** register with my invitation/credentials, log in securely, and reset my password if forgotten,
- **So that** I can access my personalized onboarding portal safely.
- **Acceptance Criteria**:
  1. Password must meet security rules (minimum 8 chars, 1 uppercase, 1 number, 1 special char).
  2. Forgot Password provides a reset token mechanism to reset forgotten credentials.
  3. Session is maintained via JWT with secure local/cookie storage.

#### US-EMP-02: Profile Data Submission
- **As a** New Employee,
- **I want to** fill in and update my comprehensive employee profile across structured tabs,
- **So that** company records contain my personal, contact, education, and banking details.
- **Acceptance Criteria**:
  1. Tabs include:
     - Personal Info (DOB, Gender, Blood Group, Marital Status)
     - Contact & Address (Phone, Personal Email, Street, City, State, ZIP, Country)
     - Emergency Contacts (Primary & Secondary name, relation, phone)
     - Education History (Degree, Institution, Year, GPA/Grade)
     - Previous Employment (Company, Designation, Start/End dates)
     - Joining & Bank Details (Bank name, Account Number, IFSC/Routing code)
  2. Client-side and server-side validation validates email formats, phone numbers, and required fields.
  3. Data can be saved as draft or submitted.

#### US-EMP-03: Document Uploads & Replacement
- **As a** New Employee,
- **I want to** upload required compliance documents with clear size/format constraints,
- **So that** HR can verify my credentials.
- **Acceptance Criteria**:
  1. Document categories: Resume, ID Proof (Passport/National ID), Address Proof, Education Certificates, Relieving Letter/Previous Employment, Bank Details/Cancelled Cheque, Other.
  2. Allowed formats: PDF, PNG, JPG, JPEG, DOCX (Max 5MB each).
  3. File upload indicates progress, success, and validation error messages for invalid files.
  4. Employee can view uploaded files, replace a document before review, and re-upload when a document is rejected.

#### US-EMP-04: Checklist Execution & Task Submission
- **As a** New Employee,
- **I want to** mark checklist items as complete and submit task deliverables,
- **So that** my onboarding milestones progress toward 100%.
- **Acceptance Criteria**:
  1. Interactive checklist with items (e.g., Read Employee Handbook, Submit Tax Forms, Complete Security Training).
  2. Tasks list with clear priority tags, deadlines, and ability to post comments or upload attachments.
  3. Status updates automatically recalculate overall onboarding progress percentage.

#### US-EMP-05: Real-Time Progress & Stage Tracking
- **As a** New Employee,
- **I want to** see an accurate visual progress bar and multi-stage tracker,
- **So that** I know exactly where I stand in the onboarding pipeline.
- **Acceptance Criteria**:
  1. Visual progress bar reflects weighted composite progress (Documents 35%, Checklist 25%, Tasks 20%, Approvals 20%).
  2. Milestone tracker shows current stage: `Document Submission` -> `HR Initial Review` -> `Manager Approval` -> `HR Final Sign-Off` -> `Completed`.
  3. Once 100% completed and approved, a completion celebration banner is displayed.

---

## 4. Non-Functional Requirements

1. **Simplicity & Readability**: Clean directory structure (`routes/`, `controllers/`, `middleware/`, `config/`), standard ES6+ syntax, and concise commented code suitable for beginners.
2. **Security**:
   - Passwords hashed using `bcrypt` (salt rounds = 10).
   - JWT tokens signed with secrets loaded from `.env`.
   - Role-Based Access Control (RBAC) enforced on every API route and UI route.
   - Multer sanitizes filenames to prevent directory traversal and limits file sizes to 5MB.
3. **Usability & Aesthetics**:
   - Modern glassmorphic and high-contrast clean design via Tailwind CSS.
   - Fully responsive on desktop and mobile viewports.
   - Accessible color contrast, clear error toast notifications, and interactive loading states.
4. **Data Integrity**:
   - Foreign key constraints, cascading deletes where appropriate, and unique constraints on email and employee codes via Prisma ORM.
5. **Local Runnability**:
   - Single command local execution, zero external paid dependencies, SQLite database that requires no external database server install.

---

## 5. Edge Cases & Exception Handling

1. **Duplicate Registrations**: Friendly validation error if an email or employee code already exists.
2. **File Size/Type Violation**: Rejection at Multer middleware level with clear JSON response `{ error: "File exceeds 5MB limit or invalid file type" }`.
3. **Approval Rejection**: If Manager or HR rejects in the approval pipeline, the workflow reverts to the candidate with specific corrective instructions.
4. **Token Expiration**: Expired JWT tokens trigger a 401 response and redirect the user smoothly to the login page with a session expired message.
5. **Concurrent Role Updates**: If an admin changes a user's role while they are logged in, next authenticated requests evaluate the updated role from the database.
