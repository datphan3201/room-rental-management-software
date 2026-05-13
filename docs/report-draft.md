# Room Rental Management Software
# English Report Draft

This draft is intended as a writing starter for the final report.
It stays aligned with the current MVP scope:
- internal room rental management system
- Admin / Landlord and Tenant only
- no public listing, booking, payment gateway, or full electronic contract signing

Use this draft as a base. Replace the bracketed notes and diagram placeholders with final project-specific content after implementation is complete.

---

# Chapter 1. Theoretical Basis Introduction

## 1.1 Purpose and Scope

This project develops an internal room rental management system for a landlord or admin and tenants. The main goal is to reduce manual work in managing rooms, tenants, rental contracts, invoices, payments, and maintenance requests. The system is designed as a small local application suitable for a software engineering course project, not as a public rental marketplace.

The scope is intentionally limited to a realistic MVP. The system supports authentication and role-based access control, room management, tenant management, contract management, monthly invoice management, manual payment confirmation, maintenance request management, and an admin dashboard with basic statistics. These functions are enough to demonstrate a complete rental management workflow while still keeping the implementation manageable within the project deadline.

Several features are explicitly excluded from the MVP. The system does not provide public room listings, online booking, payment gateway integration, automatic payment verification, PDF invoice export, or full electronic contract signing. These features may be mentioned as future enhancements, but they are not part of the current implementation.

## 1.2 Product Overview

The application contains two main user experiences: an admin portal and a tenant portal. The admin portal is used to manage the rental business data, including rooms, tenants, contracts, invoices, payments, and maintenance requests. The tenant portal is simplified and shows only the personal information that belongs to the logged-in tenant, such as the assigned room, contract, invoices, payment status, and maintenance request history.

The core business flow is straightforward. First, the admin creates room records and tenant profiles. Next, the admin creates a rental contract that connects one tenant to one room. After that, the admin generates monthly invoices based on the contract and utility data. The tenant pays outside the system, usually in cash or by bank transfer, and the admin manually confirms the payment in the application. If the tenant has a repair or support issue, the tenant can submit a maintenance request and the admin can review it, respond, and update its status.

This product overview reflects a simple and practical local business system. The emphasis is on clear data tracking, consistent state management, and role-based access control rather than advanced automation.

## 1.3 Structure of the Document

This report is organized into seven chapters. Chapter 1 introduces the project background, scope, and terminology. Chapter 2 presents the project management plan, including organization, lifecycle model, risks, resources, schedule, and control methods. Chapter 3 describes the requirements of the system, including stakeholders, use cases, functional requirements, and non-functional requirements. Chapter 4 explains the architecture of the system. Chapter 5 presents the design, including database design, class model, sequence diagrams, and activity diagrams. Chapter 6 defines the test plan and traceability between requirements, use cases, and test cases. Chapter 7 presents the demo materials, including the database, source code, and screenshots.

## 1.4 Terms, Acronyms, and Abbreviations

The report uses a small set of terms and abbreviations to keep the writing consistent.

- Admin / Landlord: the user who manages the rental system
- Tenant: the person renting a room
- MVP: minimum viable product
- CRUD: create, read, update, delete
- UI: user interface
- API: application programming interface
- RBAC: role-based access control
- Invoice: monthly billing record
- Contract: rental agreement metadata
- Maintenance Request: a request for repair or support
- REST: RESTful API style

---

# Chapter 2. Project Management Plan

## 2.1 Project Organization

This project is developed by one student, so the project organization is simple and direct. The same person is responsible for analyzing the requirements, designing the system, implementing the code, writing the report, testing the application, and preparing the demo. Because the project is small and the timeline is short, a solo workflow is more practical than a team-based structure.

In this context, the most important management concern is not coordination between multiple people, but consistency between the report, the code, and the database design. For that reason, the project is planned in a way that keeps the scope stable and the implementation aligned with the documentation from the beginning.

## 2.2 Lifecycle Model Used

The project uses a simple iterative or incremental development approach. This model is suitable because the deadline is short and the system scope is limited. Instead of trying to complete the entire application in one large step, the project is divided into small vertical slices. Each slice includes design, implementation, and verification for a specific feature group.

This approach makes it easier to manage risk. If a feature takes longer than expected, the project can still deliver a usable system by prioritizing the core modules first. It also helps keep the report synchronized with the implementation, because the documentation can be updated immediately after each feature slice is completed.

## 2.3 Risk Analysis

The main project risks are related to time, consistency, and scope control. The first risk is that the scope may become too large for the three-day deadline. To reduce this risk, the project stays focused on the core rental management workflow and excludes advanced features such as public listings, online booking, and payment gateway integration.

The second risk is inconsistency between the report and the code. This risk is controlled by writing the design package first and using it as the source of truth for the implementation and the report. The third risk is the complexity of payment processing. To avoid unnecessary complexity, the system only supports manual payment confirmation by the admin. Another risk is authorization mistakes, especially tenant access to restricted data. This is mitigated by using a simple role-based access model and checking each tenant request against the logged-in account.

There is also a design risk if the database schema changes late in development. To avoid this, the schema should be finalized early and reused consistently across code, use cases, diagrams, and test cases.

## 2.4 Hardware and Software Resource Requirements

The project can be developed and demonstrated on a normal student laptop or desktop computer. No special server hardware is required because the application is intended to run locally. The main software resources include a code editor or IDE, a runtime environment for the chosen stack, a local database system, and a web browser for testing.

Because this is a student project, the required software should remain lightweight and easy to set up. The final report should list only the tools that are actually used in the implementation.

## 2.5 Deliverables and Schedule

The project deliverables include a working local application, the source code, the database design, the written report, screenshots for the demo section, and a set of system-level test cases. These deliverables are aligned with the course requirement that the project must contain both a functional system and an English report.

The development schedule is short and should remain focused. Day 1 is used to finalize scope, architecture, authentication, and the initial schema. Day 2 is used to implement the core business modules: rooms, tenants, contracts, invoices, and payment confirmation. Day 3 is reserved for maintenance requests, dashboard statistics, testing, screenshots, and final report completion.

## 2.6 Monitoring, Reporting, and Controlling Mechanisms

The project is monitored through a daily checklist and feature-by-feature verification. After each feature is implemented, it should be checked against the corresponding use case and functional requirement. This makes it easier to detect mismatches early and keeps the report accurate.

Version control should be used throughout the project to track changes and avoid accidental loss of work. The report and the implementation should be reviewed together, not separately, so that database fields, status values, and workflow descriptions stay consistent.

## 2.7 Professional Standards

The project follows basic professional standards that are appropriate for a software engineering course project. The code should be readable, consistently named, and separated into layers so that UI, business logic, and data access are not mixed together. Database operations should preserve data integrity, especially for contracts, invoices, and payment records.

Role-based access control is also treated as a professional standard because it protects sensitive tenant information and limits admin-only functions to authorized users. The report should reflect these standards clearly, but without claiming enterprise-level complexity that does not exist in the MVP.

## 2.8 Configuration Management

Configuration management is handled through Git and consistent naming conventions. Entity names, status values, and field names should remain stable across the report, the database, and the source code. Major scope decisions should be frozen early so that the project does not drift during implementation.

This matters especially for a solo project because changes made late in development can easily break the relationship between the code and the written report. A stable configuration approach keeps the final submission coherent.

## 2.9 Impact of the Project

The project has practical value because it reduces manual record handling in a rental business. It helps the landlord or admin track rooms, tenant records, rental contracts, invoices, payment confirmation, and maintenance requests in one place. For tenants, the system improves transparency by allowing them to view their own rental information and maintenance request status.

Although the project is not a commercial platform, it demonstrates a realistic business workflow and shows how a simple information system can support daily operations more effectively than paper-based tracking.

---

# Chapter 3. Requirement Specifications

## 3.1 Stakeholders

The primary stakeholder is the Admin or Landlord, who manages the rental business and maintains the system data. The second primary stakeholder is the Tenant, who uses the system to view personal rental information and submit maintenance requests. A Staff or Manager role may be mentioned as a possible future enhancement, but it is not implemented in the MVP.

Each stakeholder has different needs. The admin needs full control over the rental process, while the tenant only needs access to personal records and simple request submission. This difference is the basis for the role-based authorization design.

## 3.2 Use Case Model

### 3.2.1 Actors

The system has two actors in the MVP: Admin / Landlord and Tenant.

### 3.2.2 Use Cases

The main use cases are:

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

### 3.2.3 Use Case Descriptions

Each detailed use case should include the goal, the primary actor, the preconditions, the main flow, alternate flows, and the postconditions. For example, in the login use case, the user enters credentials, the system validates the credentials, determines the role, and redirects the user to the correct portal. In the contract creation use case, the admin selects a tenant and a room, enters contract information, and the system creates the contract while updating room status if the contract is active.

The detailed descriptions should focus on the most important business flows:
- logging in
- managing rooms
- creating contracts
- creating invoices
- confirming payments
- submitting maintenance requests
- reviewing maintenance requests

This keeps the report readable and avoids excessive duplication. Less critical use cases can be summarized more briefly if needed.

## 3.3 Functional Requirements

The functional requirements are grouped by module so that the report is easy to read and easy to trace to the implementation. Authentication and authorization requirements define login, logout, and access control. Room management requirements define CRUD operations for room records and room status updates. Tenant management requirements define profile creation and maintenance. Contract management requirements define how tenants are linked to rooms and how room occupancy is controlled.

Invoice management requirements define the monthly billing process and the utility calculation rules. Payment management requirements define manual payment confirmation and invoice status updates. Maintenance request management requirements define the request lifecycle from submission to resolution. Dashboard requirements define the summary statistics shown to the admin.

The final report should keep these requirements atomic and testable. That means each requirement should describe one clear behavior and should be verifiable by at least one test case.

## 3.4 Non-Functional Requirements

The system also has non-functional requirements that describe quality attributes. The interface should be simple and easy to use because the target users are ordinary students in a demo environment. Security is required because login credentials and tenant data must not be exposed.

Authorization is particularly important because tenants must only see their own records. The system must also remain reliable, maintainable, portable, and reasonably fast for a small local dataset. Finally, traceability is important because each feature should be reflected consistently in the report, the code, and the tests.

## 3.5 Requirement Traceability Notes

Traceability is one of the most important quality goals in this project. Each functional requirement should map to one or more use cases, and each major use case should map to at least one system-level test case. This makes it easier to prove that the final system actually satisfies the stated requirements.

For a student project with a tight deadline, traceability is also a practical tool. It prevents the report from drifting away from the implementation and helps keep the demo focused on what the system really does.

---

# Chapter 4. Architecture

## 4.1 Architectural Styles Used

The system uses a client-server architecture, a layered architecture, and an MVC or controller-service-model pattern. The frontend is implemented in React and Vite, while the backend is implemented in Node.js and Express.js. The backend exposes RESTful APIs for the client to consume. These architectural choices are practical for a small local application because they are simple to understand, easy to implement, and suitable for an academic project.

The layered design separates presentation, business logic, and data access. This separation helps reduce coupling and makes the system easier to maintain. It also makes it easier to explain the system in the report because each layer has a clear responsibility.

## 4.2 Architectural Model

At a high level, the system can be described in three layers. The presentation layer contains the login page, admin dashboard, tenant portal, and the management screens for each module. The application layer contains authentication, authorization, and the business logic for rooms, tenants, contracts, invoices, payments, maintenance requests, and dashboard statistics. The data layer contains the repository-backed persistence logic used by the current build.

[Insert architecture diagram here.]

[Insert deployment diagram here.]

The architecture should remain simple and local. There is no need for microservices because the project does not require independent scaling or distributed deployment. A single application with a clear internal structure is enough for the current scope.

## 4.3 Technology, Software, and Hardware Used

The final technology stack for this project is:

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

This stack was selected because it is professional enough for future extension while still being realistic for a solo course project. The key rule remains consistency: if a tool or framework is not used in the final codebase, it should not appear in the architecture chapter.

## 4.4 Rationale for Architecture

The architecture is chosen to match the project constraints. A monolithic local application is enough because the system is small and the deadline is short. Microservices would add complexity without giving any meaningful benefit for this use case. Role-based access control is sufficient because the system only needs to separate admin actions from tenant actions.

Manual payment confirmation is also a reasonable simplification. The project is meant to model rental management, not bank integration. By keeping the architecture simple, the project can focus on correctness, data consistency, and a clear user flow.

## 4.5 Architecture Summary

The architecture supports the MVP by keeping the system simple, local, and easy to explain. The separation between UI, business logic, and data access provides enough structure for maintainability while still remaining realistic for a short student project.

---

# Chapter 5. Design

## 5.1 Data Model Design

The data model is centered around the main rental management entities: Account, Tenant, Room, Contract, Invoice, Payment, and MaintenanceRequest. These entities are enough to support the full business workflow in the MVP. Even though the current build uses a local repository-backed store, the logical model should still be described with entity names, key attributes, identifiers, and relationships as if it were a normal persistence design.

[Insert ER diagram here.]

The `Account` entity stores login data and role information. The `Tenant` entity stores tenant profile data and links to the login account. The `Room` entity stores room details and occupancy status. The `Contract` entity connects a tenant to a room and stores contract metadata. The `Invoice` entity stores monthly billing information and calculation fields. The `Payment` entity stores manual payment confirmation. The `MaintenanceRequest` entity stores tenant maintenance requests and admin responses.

The most important relationships are straightforward. A tenant can have multiple contracts over time. A room can be linked to multiple contracts over time, but only one active contract is allowed at a time. An invoice belongs to one tenant, one room, and one contract. A payment belongs to one invoice. A tenant can create multiple maintenance requests.

## 5.2 Static Model / Class Diagram

The static model can be presented as a class diagram or entity relationship diagram, depending on how the implementation is structured. The important point is that the diagram should show the main objects and how they relate to each other. In addition to the core entities, the model may also include service classes such as AuthService, DashboardService, or other application services used in the implementation.

[Insert class diagram here.]

The class diagram should make it easy to understand how the system is organized. For example, the tenant entity is linked to invoices, contracts, payments, and maintenance requests, while the room entity is linked to contracts and maintenance requests. This kind of static view helps explain the structure of the codebase and the data model at the same time.

## 5.3 Dynamic Model / Sequence Diagrams

The sequence diagrams should show how the system behaves at runtime. The most representative scenarios are login and role-based redirection, contract creation and room status update, invoice generation and payment confirmation, and maintenance request submission and review. These scenarios cover the most important business flows in the application and match the implemented routes, controllers, services, and UI pages.

[Insert sequence diagram: login and role redirection.]

[Insert sequence diagram: contract creation.]

[Insert sequence diagram: invoice generation and payment confirmation.]

[Insert sequence diagram: maintenance request review.]

Each sequence diagram should show the actor, the application components, the messages between them, and the resulting state changes in the database.

## 5.4 Activity Diagrams

Activity diagrams should be used to show the workflow of the major use cases. Suitable examples are admin login and dashboard access, contract creation, invoice creation and payment confirmation, and the maintenance request lifecycle. These diagrams are useful because they show decisions, branching behavior, and the order of operations in a very clear format.

[Insert activity diagram: admin login and dashboard access.]

[Insert activity diagram: contract creation flow.]

[Insert activity diagram: invoice and payment flow.]

[Insert activity diagram: maintenance request flow.]

## 5.5 Design Constraints and Notes

Several design constraints guide the implementation. Tenants can only access their own records. Only one active contract is allowed per room. Invoice total is calculated using a fixed formula based on rent, utilities, service fee, parking fee, and discount. Payments are confirmed manually by the admin. Maintenance requests follow a controlled status flow and are resolved only by admin action.

These constraints should appear consistently in the report, the code, and the tests. They are not just technical details; they are the business rules that define the system’s behavior.

## 5.6 Design Summary

The design supports the requirements by organizing the system around a small set of core entities and simple business rules. The model is intentionally practical rather than complex, because the project must be finished quickly and demonstrated clearly.

---

# Chapter 6. Test Plan

## 6.1 Test Objectives

The purpose of testing is to verify that the system behaves according to the requirements. The tests should confirm that the major workflows work correctly, that role-based access is enforced, that calculations are correct, that state transitions are consistent, and that tenant data is isolated properly.

For this project, system-level correctness is more important than performance testing or load testing. The test plan should therefore focus on the business rules and the end-to-end use cases that matter for the demo.

## 6.2 System-Level Test Cases

The test suite should cover the main flows of the application. A practical set of test cases includes valid login for admin and tenant, invalid login rejection, room creation, tenant creation, active contract creation, duplicate active contract rejection, invoice generation, payment confirmation, tenant access restriction, maintenance request submission, maintenance request review, maintenance request resolution, and dashboard statistics verification.

Suggested test case table:

| Test ID | Related Use Case | Short Description |
| --- | --- | --- |
| TC-01 | UC-01 | Admin logs in successfully |
| TC-02 | UC-01 | Tenant logs in successfully |
| TC-03 | UC-01 | Invalid credentials are rejected |
| TC-04 | UC-04 | Admin creates a room |
| TC-05 | UC-05 | Admin creates a tenant |
| TC-06 | UC-06 | Admin creates an active contract and the room becomes occupied |
| TC-07 | UC-07 | System rejects a second active contract for the same room |
| TC-08 | UC-09 | Admin creates a monthly invoice |
| TC-09 | UC-11 | Admin confirms payment and invoice becomes paid |
| TC-10 | UC-10 / UC-12 | Tenant sees only own invoice and payment records |
| TC-11 | UC-13 | Tenant submits a maintenance request |
| TC-12 | UC-14 | Admin accepts or rejects a request with response note |
| TC-13 | UC-15 | Admin resolves a maintenance request |
| TC-14 | UC-03 | Admin dashboard statistics reflect current data |

Each test case should include a test ID, related use case ID, preconditions, steps, expected result, actual result, and status. This makes the test plan usable as both a verification document and a traceability artifact.

## 6.3 Traceability of Test Cases to Use Cases

The report should include a traceability table that maps use cases to test cases and functional requirements to test cases. This section is important because it shows that the implementation was tested against the intended behavior rather than against informal assumptions.

## 6.4 Test Generation Techniques

The test suite can be described using simple and practical techniques such as equivalence partitioning, boundary value analysis, positive and negative test cases, and use case-based test design. These techniques are appropriate for a small student project because they are easy to explain and they directly support the main business flows.

## 6.5 Assessment of Test Suite Quality

The quality of the test suite can be discussed in terms of coverage, traceability, and business relevance. The suite should cover the main modules, the success paths, the failure paths, and the critical business rules. It should also be honest about its limitations: the dataset is small, the system is local, and the focus is on functional correctness rather than scale.

---

# Chapter 7. Demo

## 7.1 Database

The demo section should present the persisted data and sample records used during testing. In the current build, the application stores records in a local repository-backed data file, so the demo can show the logical dataset and the resulting UI state after creating rooms, tenants, contracts, invoices, payments, and maintenance requests.

[Insert database screenshots here.]

## 7.2 Source Code

The demo should also briefly explain the source code structure. The report can mention the authentication module, room management module, tenant management module, contract management module, invoice management module, payment management module, maintenance module, and dashboard module. If useful, a folder structure screenshot can be included to show how the code is organized. The current codebase is split into `frontend/` and `backend/`, with backend folders for `routes/`, `controllers/`, `services/`, `models/`, `data/`, and `middlewares/`.

[Insert source code structure screenshot here.]

## 7.3 Screenshots

The screenshots should focus on the most important user interactions. Suitable screenshots include the login page, admin dashboard, room list or room form, tenant management screen, contract creation screen, invoice screen, payment confirmation screen, tenant portal, maintenance request screen, and dashboard statistics after sample data is entered.

[Insert application screenshots here.]

## 7.4 Suggested Demo Script

A simple demo script can follow the natural business flow of the system. First, log in as admin and show the dashboard. Then show room and tenant data, create or edit a contract, generate an invoice for a month that does not duplicate the seed invoice, and confirm a payment. After that, log in as tenant and show the personal contract and invoice information, submit a maintenance request, and return to admin to review the request.

This script is effective because it demonstrates the full system workflow in a short and understandable sequence.

## 7.5 Demo Notes

The demo should only show implemented MVP features. It should use sample data that makes the system behavior easy to understand. Any unfinished or experimental functionality should be excluded from the final presentation.

---

# Final Consistency Reminder

The final report should remain aligned with the implemented code, the logical data model, the use cases, the diagrams, the test cases, and the screenshots. The report should not invent extra modules or actors, and the implementation should not introduce unsupported features. For a short project deadline, consistency is more important than breadth.
