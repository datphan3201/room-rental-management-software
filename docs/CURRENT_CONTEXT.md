# Current Project Context

Last updated: 2026-05-14

## Runtime

- Frontend runs at `http://localhost:5173/`.
- Backend runs at `http://127.0.0.1:4000`.
- In this WSL environment Docker and local MongoDB are not available, so the backend is run with `NODE_ENV=test` and an empty `MONGODB_URI` to use `mongodb-memory-server`.
- Demo data is seeded automatically on backend startup. Because the database is in-memory, demo data is reset when the backend process stops.

## Demo Accounts

- Admin: `admin` / `admin123`
- Tenant: `0900000001` / `tenant123`

## Recent Product Changes

- App display name changed to `Rental Property Management`.
- Login page has a show/hide password control.
- Login page tells users who forgot passwords to contact admin phone `0900000000`.
- Public forgot-password reset flow was removed. Admin manages tenant passwords.
- Admin tenant form now supports tenant password creation and password reset.
- Billing navigation now groups invoices and payments together:
  - Admin route: `/admin/billing`
  - Tenant route: `/tenant/billing`
  - Old invoice/payment routes still work and open the matching Billing tab.
- Admin QR image is shown in a modal instead of inline in the form.
- Admin payment receipt proof is shown in a modal and converted from data URL to Blob URL for more reliable viewing.
- Admin Proofs tab keeps showing receipt proofs after payment confirmation.
- Tenant contract table rows can be opened in a contract detail modal.

## Important Notes

- Do not commit `backend/.env`, `frontend/.env`, `node_modules/`, or `dist/`.
- Use `npm test` for backend business-rule tests.
- Use `npm -w frontend run build` to verify frontend changes.
- Use `scripts/run-local.sh` to run the demo in this environment.
