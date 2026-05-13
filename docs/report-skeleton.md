# Room Rental Management Software - English Report Skeleton

This is the consolidated report skeleton for the final project report.
It is aligned with the current MVP scope:
- internal room rental management system
- Admin / Landlord and Tenant only
- no public listing, booking, payment gateway, or full electronic contract signing

Use this as the single writing reference for Chapters 1-7.
Do not add features here that are not implemented in the final system.

## Chapter 1. Theoretical Basis Introduction

### 1.1 Purpose and Scope
- Describe the project as a local/internal room rental management system.
- State the target users: Admin / Landlord and Tenant.
- Mention the included functions:
  - authentication and role-based access
  - room management
  - tenant management
  - contract management
  - monthly invoice management
  - manual payment confirmation
  - maintenance request management
  - admin dashboard and statistics
- Mention the excluded functions:
  - public room listing
  - online booking
  - payment gateway integration
  - automatic payment verification
  - PDF invoice export
  - full electronic signing

### 1.2 Product Overview
- Give a high-level system description.
- Explain the two portals:
  - admin dashboard
  - tenant portal
- Summarize the main workflow:
  - admin creates rooms and tenants
  - admin creates a contract
  - admin generates invoices
  - tenant pays outside the system
  - admin confirms payment manually
  - tenant submits maintenance requests

### 1.3 Structure of the Document
- Chapter 1: introduction and background
- Chapter 2: project management plan
- Chapter 3: requirement specifications
- Chapter 4: architecture
- Chapter 5: design
- Chapter 6: test plan
- Chapter 7: demo

### 1.4 Terms, Acronyms, and Abbreviations
Include only terms used in the report:
- Admin / Landlord
- Tenant
- MVP
- CRUD
- UI
- API
- RBAC
- Invoice
- Contract
- Maintenance Request
- REST

## Chapter 2. Project Management Plan

### 2.1 Project Organization
- State that the project is developed by one student.
- Mention the responsibilities handled by the student:
  - requirements analysis
  - design
  - implementation
  - testing
  - reporting
  - demo preparation

### 2.2 Lifecycle Model Used
- Use a simple iterative or incremental model.
- Explain why it fits a 3-day project:
  - small scope
  - fast feedback
  - easy consistency control

### 2.3 Risk Analysis
- Scope too large for the deadline
- Report and code inconsistency
- Payment workflow complexity
- Tenant authorization errors
- Late database changes

### 2.4 Hardware and Software Resource Requirements
- Student laptop/desktop
- Local development machine
- Editor and runtime tools
- Database system
- Browser for testing

### 2.5 Deliverables and Schedule
- Working local application
- Source code
- Database schema
- Report
- Screenshots
- Test cases
- Suggested schedule:
  - Day 1: scope lock, architecture, auth, schema
  - Day 2: rooms, tenants, contracts, invoices, payments
  - Day 3: maintenance, dashboard, tests, report finalization

### 2.6 Monitoring, Reporting, and Controlling Mechanisms
- Daily checklist
- Feature-by-feature verification
- Consistency checks between requirements, code, and report
- Version control usage

### 2.7 Professional Standards
- Clean code
- Readable naming
- Layered structure
- Database integrity
- Role-based access control
- Traceable documentation

### 2.8 Configuration Management
- Use Git for version control
- Keep naming consistent for entities and statuses
- Freeze major scope decisions early

### 2.9 Impact of the Project
- Reduce manual record handling
- Support rent and invoice management
- Improve transparency for tenants

## Chapter 3. Requirement Specifications

### 3.1 Stakeholders
- Admin / Landlord
- Tenant
- Optional future stakeholder mention: Staff / Manager

### 3.2 Use Case Model

#### 3.2.1 Actors
- Admin / Landlord
- Tenant

#### 3.2.2 Use Cases
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
For each key use case, include:
- Goal
- Primary actor
- Preconditions
- Main flow
- Alternate flow
- Postconditions

Recommended detailed use cases:
- Log in
- Manage rooms
- Create contract
- Create invoice
- Confirm payment
- Submit maintenance request
- Review maintenance request

### 3.3 Functional Requirements
Use the existing FR set:
- Authentication and Authorization
- Room Management
- Tenant Management
- Contract Management
- Invoice Management
- Payment Management
- Maintenance Request Management
- Dashboard

### 3.4 Non-Functional Requirements
- Usability
- Security
- Authorization
- Reliability
- Maintainability
- Performance
- Portability
- Traceability

### 3.5 Requirement Traceability Notes
- Requirements map to use cases
- Use cases map to test cases
- This keeps report, code, and demo consistent

## Chapter 4. Architecture

### 4.1 Architectural Styles Used
- Client-server architecture
- Layered architecture
- MVC or controller-service-model pattern
- RESTful API style

### 4.2 Architectural Model
- Presentation layer
- Application layer
- Data layer

### 4.3 Technology, Software, and Hardware Used
- Frontend: React + Vite
- Backend: Node.js + Express.js
- Data layer: local repository-backed storage for the current build
- Authentication: JWT-based authentication
- Authorization: role-based access control with `ADMIN` and `TENANT`
- API style: RESTful API
- Architecture: client-server, layered, MVC/controller-service-model
- Diagram format: Mermaid
- Version control: Git + GitHub
- Development environment: WSL Ubuntu, VS Code Remote WSL, Node.js LTS, npm
- Testing: manual system testing and API testing with Postman or Thunder Client
- Deployment: local deployment only

### 4.4 Rationale for Architecture
- Simple local deployment
- Microservices not needed
- RBAC is enough for the MVP
- Manual payment confirmation is a valid simplification
- Future extension remains possible

### 4.5 Architecture Summary
- Summarize how the architecture supports the MVP

## Chapter 5. Design

### 5.1 Database Design
- Entity list
- Attributes
- Primary keys and foreign keys
- Relationships
- Note that the current build uses a local repository-backed store, so the report should describe the logical model and current runtime behavior rather than claim a different persistence deployment

Suggested entities:
- Account
- Tenant
- Room
- Contract
- Invoice
- Payment
- MaintenanceRequest

### 5.2 Static Model / Class Diagram
- Main classes/entities
- Services
- Associations

### 5.3 Dynamic Model / Sequence Diagrams
Recommended scenarios:
- Login and role-based redirection
- Contract creation and room status update
- Invoice generation and payment confirmation
- Maintenance request submission and review

### 5.4 Activity Diagrams
Recommended flows:
- Admin login and dashboard access
- Contract creation
- Invoice creation and payment confirmation
- Maintenance request lifecycle

### 5.5 Design Constraints and Notes
- Tenant can only access own records
- Only one active contract per room
- Invoice total uses a fixed formula
- Payment is confirmed manually
- Maintenance is controlled by admin action

### 5.6 Design Summary
- Summarize how the design supports the requirements

## Chapter 6. Test Plan

### 6.1 Test Objectives
- Verify features match requirements
- Verify role-based access
- Verify calculations
- Verify state transitions
- Verify tenant data isolation

### 6.2 System-Level Test Cases
Suggested test cases:
- TC-01 Admin login with valid credentials
- TC-02 Tenant login with valid credentials
- TC-03 Invalid login is rejected
- TC-04 Admin creates a room successfully
- TC-05 Admin creates a tenant successfully
- TC-06 Admin creates an active contract and room becomes occupied
- TC-07 Only one active contract is allowed per room
- TC-08 Admin creates invoice and system calculates totals correctly
- TC-09 Admin confirms payment and invoice becomes paid
- TC-10 Tenant cannot access another tenant's data
- TC-11 Tenant submits maintenance request
- TC-12 Admin accepts or rejects maintenance request
- TC-13 Admin resolves maintenance request
- TC-14 Dashboard statistics reflect current data
- TC-15 Tenant creates a maintenance request for the assigned room
- TC-16 Payment confirmation prevents duplicate invoice payment

For each test case:
- Test ID
- Related use case ID
- Preconditions
- Test steps
- Expected result
- Actual result
- Status

### 6.3 Traceability of Test Cases to Use Cases
- Use case to test case mapping
- Requirement to test case mapping

### 6.4 Test Generation Techniques
- Equivalence partitioning
- Boundary value analysis
- Positive and negative test cases
- Use case-based design

### 6.5 Assessment of Test Suite Quality
- Coverage of main modules
- Coverage of success and failure paths
- Traceability
- Key business rules included

## Chapter 7. Demo

### 7.1 Database
- Database schema screenshots or descriptions
- Key tables and relationships
- Sample records used in demo
- If using the current build, mention the local repository-backed data file and the seeded demo records used for the demo

### 7.2 Source Code
- Authentication module
- Room management module
- Tenant management module
- Contract management module
- Invoice management module
- Payment management module
- Maintenance module
- Dashboard module
- Backend structure: `routes/`, `controllers/`, `services/`, `models/`, `data/`, `middlewares/`

### 7.3 Screenshots
Suggested screenshots:
- Login page
- Admin dashboard
- Room list / room form
- Tenant management screen
- Contract creation screen
- Invoice screen
- Payment confirmation screen
- Tenant portal
- Maintenance request screen
- Dashboard statistics after sample data entry

### 7.4 Suggested Demo Script
1. Log in as admin
2. Show dashboard
3. Show room and tenant data
4. Create a contract
5. Generate an invoice
6. Confirm payment
7. Log in as tenant
8. Show personal contract and invoice
9. Submit a maintenance request
10. Return to admin and review the request

### 7.5 Demo Notes
- Only show implemented MVP features
- Use sample data that makes the behavior clear

## Final Consistency Reminder
- Keep the report aligned with the implemented code and database
- Do not invent extra modules or actors
- Keep names, statuses, diagrams, and test cases synchronized
