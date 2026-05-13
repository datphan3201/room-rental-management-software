# Room Rental Management Software - Report Outline

This outline is intended for the English project report. It follows the required structure and stays aligned with the current MVP scope:
- Internal room rental management system
- Admin / Landlord and Tenant roles only
- No public listing, booking, payment gateway, or electronic contract signing

Use this as a writing guide. Replace the placeholders with the final content after implementation decisions are fixed.

## Chapter 1. Theoretical Basis Introduction

### 1.1 Purpose and Scope
- Explain that the project is a local/internal room rental management system.
- State the target users: Admin / Landlord and Tenant.
- Mention the MVP boundaries:
  - Authentication and role-based access
  - Room management
  - Tenant management
  - Contract management
  - Monthly invoice management
  - Manual payment confirmation
  - Maintenance request management
  - Admin dashboard
- State the out-of-scope items:
  - Public room listing
  - Online booking
  - Payment gateway integration
  - Automatic payment verification
  - PDF invoice export
  - Full electronic signing

### 1.2 Product Overview
- Describe the system at a high level.
- Explain the two main portals:
  - Admin dashboard for management and statistics
  - Tenant portal for personal rental information
- Summarize the main business flow:
  - Admin creates rooms and tenants
  - Admin creates contracts
  - Admin generates invoices
  - Tenant pays outside the system
  - Admin confirms payment manually
  - Tenant submits maintenance requests
- Mention that the system is designed for a small local deployment suitable for a software engineering course project.

### 1.3 Structure of the Document
- Chapter 1: introduction and background
- Chapter 2: project management plan
- Chapter 3: requirement specifications
- Chapter 4: architecture
- Chapter 5: design
- Chapter 6: test plan
- Chapter 7: demo

### 1.4 Terms, Acronyms, and Abbreviations
Include only the terms that are actually used in the report. Suggested entries:
- Admin / Landlord: user who manages the system
- Tenant: user who rents a room
- MVP: minimum viable product
- CRUD: create, read, update, delete
- UI: user interface
- API: application programming interface
- RBAC: role-based access control
- Invoice: monthly billing record
- Contract: rental agreement metadata
- Maintenance Request: tenant request for room repair or support
- REST: RESTful API style

## Chapter 2. Project Management Plan

### 2.1 Project Organization
- State that the project is developed by one student.
- Describe the role distribution in a solo project:
  - requirements analysis
  - system design
  - coding
  - testing
  - report writing
  - demo preparation
- Mention that ChatGPT/Codex are used as development assistance tools, if allowed by your course context.

### 2.2 Lifecycle Model Used
- Use a simple iterative or incremental model.
- Explain why this model fits a 3-day project:
  - fast feedback
  - small scope
  - easier consistency control
- Suggested wording:
  - requirements and design are stabilized first
  - implementation is done in small vertical slices
  - each slice is verified before moving on

### 2.3 Risk Analysis
Include realistic project risks and mitigation actions:
- Risk: scope too large for the deadline
  - Mitigation: keep the MVP limited to core rental management
- Risk: inconsistency between report and code
  - Mitigation: write the design package first and keep it updated
- Risk: incomplete implementation of payment workflow
  - Mitigation: use manual admin confirmation only
- Risk: tenant authorization errors
  - Mitigation: implement simple RBAC and test tenant-only access
- Risk: database design changes late in development
  - Mitigation: freeze the schema early

### 2.4 Hardware and Software Resource Requirements
- Hardware:
  - student laptop/desktop
  - local development machine
- Software:
  - operating system
  - source code editor
  - runtime/environment chosen for implementation
  - database system chosen for implementation
  - browser for local testing
- Keep this section factual and consistent with the stack you finally choose.

### 2.5 Deliverables and Schedule
- Deliverables:
  - working local application
  - source code
  - database schema
  - report
  - screenshots for demo
  - test cases
- Schedule:
  - Day 1: scope lock, architecture, authentication, initial schema
  - Day 2: room, tenant, contract, invoice, payment features
  - Day 3: maintenance, dashboard, testing, report finalization

### 2.6 Monitoring, Reporting, and Controlling Mechanisms
- Briefly explain how progress is tracked:
  - daily checklist
  - feature-by-feature verification
  - consistency check between requirements, code, and report
- Mention version control usage.
- Mention that each completed module is checked against the corresponding use case and test case.

### 2.7 Professional Standards
- Mention clean code and readable naming.
- Mention simple layering: controller, service, repository/model.
- Mention database integrity and role-based access control.
- Mention documentation quality and traceability.

### 2.8 Configuration Management
- Describe how source code and database changes are controlled.
- Mention use of Git.
- Mention consistent naming for entities, fields, and status values.
- Mention that major scope changes are avoided after the design is frozen.

### 2.9 Impact of the Project
- Explain the practical value of the system:
  - reduces manual record handling
  - helps manage rent, invoices, and maintenance requests
  - improves transparency for tenants
- Keep the impact section modest because this is a student project, not a commercial platform.

## Chapter 3. Requirement Specifications

### 3.1 Stakeholders
Identify stakeholders and their interests:
- Admin / Landlord
  - manage rooms, tenants, contracts, invoices, payments, and maintenance
- Tenant
  - view personal rental data and submit maintenance requests
- Future stakeholder mention only:
  - Staff / Manager as a possible future enhancement

### 3.2 Use Case Model

#### 3.2.1 Actors
- Admin / Landlord
- Tenant

#### 3.2.2 Use Case List
Use the following use cases in the report:
- UC-01 Log In
- UC-02 Log Out
- UC-03 View Dashboard
- UC-04 Manage Rooms
- UC-05 Manage Tenants
- UC-06 Create Contract
- UC-07 Update / Terminate Contract
- UC-08 View Own Contract
- UC-09 Create Monthly Invoice
- UC-10 View Own Invoice
- UC-11 Confirm Payment
- UC-12 View Payment History
- UC-13 Submit Maintenance Request
- UC-14 Review Maintenance Request
- UC-15 Resolve Maintenance Request
- UC-16 View Personal Rental Portal

#### 3.2.3 Use Case Descriptions
For each important use case, write:
- Goal
- Primary actor
- Preconditions
- Main flow
- Alternate flow
- Postconditions

Suggested priority for detailed descriptions:
- Log in
- Manage rooms
- Create contract
- Create invoice
- Confirm payment
- Submit maintenance request
- Review maintenance request

### 3.3 Functional Requirements
Organize requirements by module:
- Authentication and Authorization
- Room Management
- Tenant Management
- Contract Management
- Invoice Management
- Payment Management
- Maintenance Request Management
- Dashboard

Recommended format:
- FR-01 ... FR-27 as already drafted in the design package
- Keep each requirement atomic and testable

### 3.4 Non-Functional Requirements
Use short, measurable statements:
- usability
- security
- authorization
- reliability
- maintainability
- performance
- portability
- traceability

### 3.5 Requirement Traceability Notes
- State that each functional requirement maps to at least one use case.
- State that each major use case maps to one or more system test cases.
- Mention that this improves consistency across the report, code, and demo.

## Suggested Writing Order
- Write Chapter 3 first if you already know the MVP scope.
- Fill Chapter 2 next, because it depends on the actual development approach.
- Finish Chapter 1 last if you want the introduction to reflect the final scope precisely.

## Consistency Reminder
- Do not mention features that are not implemented.
- Do not implement features that are not reflected in this outline.
- Keep terms, status values, and entity names consistent across code, database, diagrams, and report.
