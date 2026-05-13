# Room Rental Management Software - Report Outline

This document continues the report skeleton from Chapters 4 to 7.
It is intentionally aligned with the current MVP scope:
- internal room rental management system
- Admin / Landlord and Tenant roles only
- no public listing, booking, payment gateway, or full electronic contract signing

Use this as a writing guide after the implementation stack is finalized.

## Chapter 4. Architecture

### 4.1 Architectural Styles Used
Describe the styles used in the system:
- Client-server architecture
- Layered architecture
- MVC or controller-service-model pattern
- RESTful API style for backend communication

Explain why these styles fit the project:
- simple to implement in a short timeline
- easy to understand in a course report
- supports separation of UI, business logic, and data access
- makes the system easier to test and maintain

### 4.2 Architectural Model
Describe the logical structure of the system:
- Presentation layer
  - login page
  - admin dashboard
  - tenant portal
- Application layer
  - authentication
  - authorization
  - business logic for rooms, tenants, contracts, invoices, payments, and maintenance
- Data layer
  - local repository-backed persistence logic
  - persistence and query handling

Suggested content:
- a high-level component diagram
- a deployment sketch showing browser/client, application server, and database

### 4.3 Technology, Software, and Hardware Used
Fill this section with the final stack you actually implement.

Suggested items to document:
- frontend technology
- backend technology
- database system
- authentication/session mechanism
- chart or table library if used for dashboard
- development tools
- local runtime environment
- browser used for testing

Keep this section consistent with the implementation. Do not list tools that are not used.

### 4.4 Rationale for Architecture
Explain the design choices:
- why a monolithic local application is enough for this project
- why microservices are not necessary
- why role-based access control is sufficient for the MVP
- why manual payment confirmation is a reasonable simplification
- why the architecture supports future extensions such as Staff/Manager without changing the core model too much

### 4.5 Architecture Summary
End the chapter with a short summary:
- the system is easy to deploy locally
- the structure supports the required functions
- the architecture keeps code and report consistent

## Chapter 5. Design

### 5.1 Database Design
Describe the database at a logical level.

Include:
- entity list
- key attributes
- primary keys and foreign keys
- relationship cardinalities

Suggested tables/entities:
- Account
- Tenant
- Room
- Contract
- Invoice
- Payment
- MaintenanceRequest

Recommended notes:
- show how `Account` links to `Tenant`
- show one-to-many relations from Tenant to Contract, Invoice, Payment, and MaintenanceRequest where applicable
- show one-to-many or one-to-one constraints where relevant

Suggested diagram:
- ER diagram or relational schema diagram

### 5.2 Static Model / Class Diagram
Describe the main classes or entities in the system.

Suggested classes:
- AuthService or equivalent
- Room
- Tenant
- Contract
- Invoice
- Payment
- MaintenanceRequest
- DashboardService or equivalent

Include associations such as:
- a tenant owns many invoices
- a room is linked to contracts and maintenance requests
- an invoice may have one payment record

Suggested diagram:
- class diagram showing entities, services, and relationships

### 5.3 Dynamic Model / Sequence Diagrams
Choose the most representative runtime scenarios.

Recommended sequence diagrams:
- login and role-based redirection
- admin creates a contract and room status updates
- admin generates an invoice and confirms payment
- tenant submits maintenance request and admin reviews it

For each sequence, include:
- actor
- system components involved
- message flow
- resulting state changes

### 5.4 Activity Diagrams
Show the process flow of major use cases.

Recommended activity diagrams:
- admin login and dashboard access
- contract creation flow
- invoice creation and payment confirmation flow
- maintenance request flow

Each activity diagram should include:
- start/end nodes
- decision points
- success and failure branches where needed

### 5.5 Design Constraints and Notes
State important constraints that shape the design:
- tenant can only access own records
- only one active contract per room
- invoice total follows a fixed formula
- payment is confirmed manually
- maintenance request lifecycle is controlled by admin action

### 5.6 Design Summary
Briefly summarize how the design supports the requirements and implementation.

## Chapter 6. Test Plan

### 6.1 Test Objectives
State what the tests are intended to prove:
- features work according to requirements
- role-based access behaves correctly
- calculations are correct
- state transitions are consistent
- tenant data remains isolated

### 6.2 System-Level Test Cases
Prepare system-level test cases for the main flows.

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

For each test case, document:
- test ID
- related use case ID
- preconditions
- test steps
- expected result
- actual result
- status

### 6.3 Traceability of Test Cases to Use Cases
Create a small traceability table linking:
- use cases to test cases
- functional requirements to test cases

This section should prove that the system was tested against the intended behavior, not just informally checked.

### 6.4 Test Generation Techniques
Mention simple techniques appropriate for the project:
- equivalence partitioning
- boundary value analysis
- positive and negative test cases
- use case-based test design

Keep this section brief and practical.

### 6.5 Assessment of Test Suite Quality
Discuss the quality of the test set:
- coverage of main modules
- coverage of successful and failing paths
- traceability to requirements
- whether critical business rules are included

Mention limitations honestly:
- the project uses a small local dataset
- no automated load testing is required for the MVP
- the focus is on correctness rather than scale

## Chapter 7. Demo

### 7.1 Database
Include screenshots or short descriptions of:
- database schema
- key tables and relationships
- sample records used in the demo

Recommended demo evidence:
- room table
- tenant table
- contract table
- invoice table
- payment table
- maintenance request table

### 7.2 Source Code
Mention the major source code modules and what each one does.

Suggested structure:
- authentication module
- room management module
- tenant management module
- contract management module
- invoice management module
- payment management module
- maintenance module
- dashboard module

You can include:
- folder structure screenshot
- important service/controller files
- brief explanation of the main logic

### 7.3 Screenshots
Prepare screenshots that demonstrate the main use cases:
- login page
- admin dashboard
- room list and room form
- tenant management screen
- contract creation screen
- invoice list or invoice detail screen
- payment confirmation screen
- tenant portal
- maintenance request screen
- dashboard statistics after sample data entry

### 7.4 Suggested Demo Script
Use a short linear demo flow:
1. log in as admin
2. show dashboard
3. create or view rooms
4. create or view a tenant
5. create a contract
6. generate an invoice
7. confirm payment
8. log in as tenant
9. show personal contract and invoice
10. submit a maintenance request
11. return to admin and review the request

### 7.5 Demo Notes
- Keep the demo focused on the implemented MVP only.
- Do not show features that are not finished.
- Use sample data that makes the system behavior easy to understand.

## Final Consistency Reminder
- Keep chapter text aligned with the actual code and database.
- Do not invent extra modules or actors.
- Keep diagrams, test cases, screenshots, and system behavior synchronized.
