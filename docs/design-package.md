# Room Rental Management Software - Design Package

## 1. System Overview

This project is an internal room rental management system for a landlord/admin and tenants. It is not a public room listing site and does not support online booking or online payment integration.

The system supports:
- Authentication and role-based authorization.
- Room, tenant, contract, invoice, payment, and maintenance request management.
- A landlord/admin dashboard with basic statistics.
- A tenant portal where each tenant can only see their own rental information.

The MVP is intentionally simple:
- One admin role and one tenant role.
- Manual payment confirmation by the admin.
- Physical contract metadata storage, with optional image/reference upload.
- No public browsing, booking, or automatic payment verification.

## 2. Actor and Permission Table

| Actor | Main Responsibilities | Permissions |
| --- | --- | --- |
| Admin / Landlord | Manages rooms, tenants, contracts, invoices, payments, maintenance requests, and dashboard statistics | Full CRUD on business data; confirm payments; review maintenance requests; view all records |
| Tenant | Views personal rental information and submits maintenance requests | Log in; view own room, contract, invoices, payments, and maintenance requests; create maintenance requests |

Authorization rule:
- Admin can access all management screens and APIs.
- Tenant can only access data linked to their own tenant account.

## 3. Module List and Responsibilities

### 3.1 Authentication & Authorization
- Login for admin and tenant.
- Role detection after login.
- Route/API protection based on role.

### 3.2 Room Management
- Create, view, update, delete rooms.
- Maintain room status: `Available`, `Occupied`, `Maintenance`.
- Store room metadata such as room number, floor, type, rent, max occupants, and description.

### 3.3 Tenant Management
- Create and maintain tenant accounts and tenant profiles.
- Store tenant identity and contact information.
- Tenant login uses phone number and password in the MVP design.

### 3.4 Rental Contract Management
- Create and manage rental contracts.
- Store contract metadata for the physical contract.
- Enforce one active contract per room.

### 3.5 Monthly Invoice Management
- Create invoices for tenants by month.
- Calculate electricity, water, and total amount.
- Track invoice payment state.

### 3.6 Payment Management
- Record manual payment confirmation by admin.
- Update invoice status to `Paid` after confirmation.
- Keep payment history for each invoice.

### 3.7 Maintenance Request Management
- Tenant submits requests for their room.
- Admin reviews, accepts, rejects, and resolves requests.
- Store response notes and maintenance cost if applicable.

### 3.8 Dashboard / Statistics
- Show counts for rooms, tenants, invoices, and revenue.
- Provide a simple admin overview for the current state of the system.

## 4. Use Case List

### UC-01 - Log In
- Actors: Admin, Tenant
- Description: User enters credentials and is redirected to the correct portal based on role.

### UC-02 - Log Out
- Actors: Admin, Tenant
- Description: User ends the session and returns to the login page.

### UC-03 - View Dashboard
- Actors: Admin
- Description: Admin views summary statistics and recent system status.

### UC-04 - Manage Rooms
- Actors: Admin
- Description: Admin creates, updates, views, and deletes room records.

### UC-05 - Manage Tenants
- Actors: Admin
- Description: Admin creates and updates tenant accounts and profiles.

### UC-06 - Create Contract
- Actors: Admin
- Description: Admin assigns a tenant to a room and creates a rental contract.

### UC-07 - Update / Terminate Contract
- Actors: Admin
- Description: Admin updates contract status, including termination or expiration handling.

### UC-08 - View Own Contract
- Actors: Tenant
- Description: Tenant views the active or historical contract linked to their account.

### UC-09 - Create Monthly Invoice
- Actors: Admin
- Description: Admin generates a monthly invoice for a tenant.

### UC-10 - View Own Invoice
- Actors: Tenant
- Description: Tenant views only invoices related to their own contract and room.

### UC-11 - Confirm Payment
- Actors: Admin
- Description: Admin records manual payment confirmation after receiving the tenant payment.

### UC-12 - View Payment History
- Actors: Tenant, Admin
- Description: Tenant views own payment records; admin views all payment records.

### UC-13 - Submit Maintenance Request
- Actors: Tenant
- Description: Tenant creates a maintenance request for the room they are renting.

### UC-14 - Review Maintenance Request
- Actors: Admin
- Description: Admin accepts or rejects a maintenance request and writes a response note.

### UC-15 - Resolve Maintenance Request
- Actors: Admin
- Description: Admin marks an accepted maintenance request as resolved and records cost if needed.

### UC-16 - View Personal Rental Portal
- Actors: Tenant
- Description: Tenant sees a simplified portal with room, contract, invoice, payment, and maintenance information.

## 5. Proposed Functional Requirements

### Authentication and Authorization
- FR-01: The system shall allow admin and tenant users to log in using stored credentials.
- FR-02: The system shall identify the logged-in user role and redirect to the correct portal.
- FR-03: The system shall prevent unauthorized access to protected pages and APIs.
- FR-04: The system shall allow logout and session invalidation.

### Room Management
- FR-05: The system shall allow admin users to create, read, update, and delete room records.
- FR-06: The system shall store room number, floor, room type, monthly rent, max occupants, status, and description.
- FR-07: The system shall update room status to `Occupied` when an active contract is created for the room.
- FR-08: The system shall allow a room status to be set to `Maintenance` when needed.

### Tenant Management
- FR-09: The system shall allow admin users to create and update tenant accounts and tenant profiles.
- FR-10: The system shall store tenant full name, phone, optional email, identity number, date of birth, and hometown.
- FR-11: The system shall allow tenants to log in using phone number and password.

### Contract Management
- FR-12: The system shall allow admin users to create rental contracts that connect one tenant with one room.
- FR-13: The system shall store contract dates, deposit, monthly rent, status, optional contract image path, and note.
- FR-14: The system shall prevent more than one active contract for the same room.
- FR-15: The system shall update room status when contract status changes to active, terminated, or expired.

### Invoice Management
- FR-16: The system shall allow admin users to generate monthly invoices for tenants.
- FR-17: The system shall calculate electricity fee from usage and unit price.
- FR-18: The system shall calculate water fee based on the selected billing method.
- FR-19: The system shall calculate total invoice amount using room rent, utility fees, service fee, parking fee, and discount.
- FR-20: The system shall allow tenants to view only their own invoices.

### Payment Management
- FR-21: The system shall allow admin users to confirm payments manually.
- FR-22: The system shall store payment date, method, confirmed-by admin, amount, and note.
- FR-23: The system shall mark the related invoice as `Paid` after payment confirmation.

### Maintenance Request Management
- FR-24: The system shall allow tenants to create maintenance requests for their assigned room.
- FR-25: The system shall allow admin users to accept, reject, and resolve maintenance requests.
- FR-26: The system shall store response notes, maintenance cost, created time, and resolved time.

### Dashboard
- FR-27: The system shall show total rooms, available rooms, occupied rooms, rooms under maintenance, total tenants, unpaid invoices, paid invoices, and monthly revenue on the admin dashboard.

## 6. Proposed Non-Functional Requirements

- NFR-01 Usability: The interface shall be simple and suitable for a course project demo.
- NFR-02 Security: Passwords shall not be stored in plain text; protected endpoints shall require authentication.
- NFR-03 Authorization: Tenant data access shall be restricted to the logged-in tenant's own records.
- NFR-04 Reliability: Invoice and payment updates shall remain consistent in the database.
- NFR-05 Maintainability: The codebase shall use a layered structure so business logic is separated from UI and data access.
- NFR-06 Performance: Common list and dashboard pages shall load quickly for a small local dataset.
- NFR-07 Portability: The system shall run locally on a student machine without external services.
- NFR-08 Traceability: Each major feature shall map to at least one use case and one test case.

## 7. Proposed Data Model

### Core Entities

#### Account
- Purpose: Stores login identity for admin and tenant users.
- Key fields: `accountId`, `loginName` or `phone`, `passwordHash`, `role`, `status`, `createdAt`

#### Tenant
- Purpose: Stores tenant profile data.
- Key fields: `tenantId`, `accountId`, `fullName`, `phone`, `email`, `identityNumber`, `dateOfBirth`, `hometown`

#### Room
- Purpose: Stores room information and occupancy state.
- Key fields: `roomId`, `roomNumber`, `floor`, `roomType`, `monthlyRent`, `maxOccupants`, `status`, `description`

#### Contract
- Purpose: Stores rental contract metadata.
- Key fields: `contractId`, `tenantId`, `roomId`, `startDate`, `endDate`, `depositAmount`, `monthlyRent`, `status`, `contractImageUrl`, `note`

#### Invoice
- Purpose: Stores monthly billing data.
- Key fields: `invoiceId`, `tenantId`, `roomId`, `contractId`, `billingMonth`, `roomRent`, `electricityUsage`, `electricityUnitPrice`, `electricityFee`, `waterBillingMethod`, `waterUsage`, `waterUnitPrice`, `numberOfTenants`, `waterPricePerPerson`, `waterFee`, `serviceFee`, `parkingFee`, `discount`, `totalAmount`, `dueDate`, `status`

#### Payment
- Purpose: Stores manual payment confirmation.
- Key fields: `paymentId`, `invoiceId`, `tenantId`, `amount`, `paymentDate`, `method`, `confirmedBy`, `note`

#### MaintenanceRequest
- Purpose: Stores tenant maintenance requests and admin responses.
- Key fields: `requestId`, `tenantId`, `roomId`, `title`, `description`, `status`, `responseNote`, `maintenanceCost`, `createdAt`, `resolvedAt`

### Relationships
- One `Account` can map to one `Tenant` profile for tenant users.
- One `Tenant` can have many `Contracts` over time.
- One `Room` can have many `Contracts` over time, but only one active contract at a time.
- One `Contract` can generate many `Invoices`.
- One `Invoice` belongs to one `Tenant`, one `Room`, and one `Contract`.
- One `Invoice` can have zero or one `Payment` record.
- One `Tenant` can create many `MaintenanceRequest` records.
- One `Room` can have many `MaintenanceRequest` records over time.

## 8. Key Business Rules

- BR-01: Only Admin can create, update, and delete rooms.
- BR-02: Only Admin can create tenant accounts and profiles.
- BR-03: A contract connects exactly one tenant with exactly one room.
- BR-04: A room cannot have more than one active contract at the same time.
- BR-05: When an active contract is created, the room status becomes `Occupied`.
- BR-06: When a contract is terminated or expired, the room can return to `Available`.
- BR-07: A room may be marked `Maintenance` whenever it is temporarily unavailable for use.
- BR-08: Invoice electricity fee = `electricityUsage x electricityUnitPrice`.
- BR-09: If `waterBillingMethod = BY_USAGE`, water fee = `waterUsage x waterUnitPrice`.
- BR-10: If `waterBillingMethod = BY_PERSON`, water fee = `numberOfTenants x waterPricePerPerson`.
- BR-11: Invoice total amount = room rent + electricity fee + water fee + service fee + parking fee - discount.
- BR-12: Only Admin can confirm a payment.
- BR-13: After payment confirmation, the system creates a payment record and sets the invoice status to `Paid`.
- BR-14: Tenants can view only their own contracts, invoices, payments, and maintenance requests.
- BR-15: Maintenance requests follow the status flow `Pending Review` -> `Accepted` or `Rejected`; accepted requests can later become `Resolved`.
- BR-16: If an invoice is unpaid after its due date, the system can mark or display it as `Overdue`.

## 9. Suggested Diagrams for the Report

### Sequence Diagrams
- SD-01 Login and role-based redirection.
- SD-02 Admin creates a contract and the room status changes to `Occupied`.
- SD-03 Admin generates an invoice and later confirms payment.
- SD-04 Tenant submits a maintenance request and admin reviews it.

### Activity Diagrams
- AD-01 Tenant login and portal access flow.
- AD-02 Room and contract management flow.
- AD-03 Invoice creation and payment confirmation flow.
- AD-04 Maintenance request lifecycle flow.

### Class / Static Model
- Include the core entities: Account, Tenant, Room, Contract, Invoice, Payment, and MaintenanceRequest.

### Use Case Model
- Include the two actors and the 16 use cases listed above.

## 10. Three-Day Execution Plan

### Day 1 - Foundation and Design Lock
- Finalize the MVP scope and confirm the data model.
- Create the project skeleton and database schema.
- Implement authentication, role checks, and navigation/redirects.
- Draft report chapters 1 and 2 while the codebase is being implemented.

### Day 2 - Core Business Features
- Implement room, tenant, and contract management.
- Implement invoice creation, fee calculations, and invoice listing.
- Implement manual payment confirmation and status updates.
- Draft report chapters 3 and 4 in parallel with the code.

### Day 3 - Tenant Flow, Testing, and Report Finish
- Implement maintenance requests and dashboard statistics.
- Run system-level tests and fix inconsistencies.
- Capture screenshots for the demo section.
- Complete chapters 5, 6, and 7 of the report.
- Do a final consistency pass across code, database, use cases, diagrams, test cases, and screenshots.

## 11. Scope Notes

- This design is intentionally limited to what can be completed and demonstrated in three days.
- Staff/Manager can be mentioned in the report as a future enhancement, but it is not part of the MVP.
- The final implementation should stay consistent with the use cases, database schema, and report text in this document.
