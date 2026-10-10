# LivinKey Backend — production-safe database migration package

## What changed
- `npm run migrate` now checks the target database and applies missing schema pieces idempotently.
- The migration adds missing columns and missing tables used by billing, payment allocations, receipts, messaging, tenant agreements, notices, and ads.
- It removes the obsolete one-bill-per-tenant/month unique index only if that index exists, to support the existing multi-bill requirement.
- Existing business records are not intentionally updated or deleted. Existing permission settings are preserved; only missing module permission rows are inserted.
- Production `npm start` uses `node src/server.js`; `npm run dev` uses nodemon.
- `.env` and Firebase service-account files are deliberately excluded. Use `.env.example` as a key list.

## Before running on production (required)
1. Rotate any credentials/secrets that have been pasted into chats, committed, or included in ZIPs. In particular rotate DB credentials, JWT secret, email app password, Cloudinary secret, and Firebase service-account key. Update Render/Railway environment variables. Do not put real secrets in this ZIP or source control.
2. Create a fresh provider-side backup of the live database and verify it can be restored. Keep the backup outside this repository.
3. Confirm the host, port, database name, and user in your hosting provider's environment settings. The migration refuses to continue if the required existing application tables are absent.
4. Deploy this package without importing `livesql.sql` and without running a database restore. The dump contains `DROP TABLE IF EXISTS` statements and must not be imported into the live database as a migration.
5. Run `npm ci`, then `npm run migrate` once from the backend root using the live environment variables. Review the complete logs. If it fails, stop and resolve the reported issue rather than repeatedly retrying blindly.
6. Start the service with `npm start`, then verify admin login, tenant login/profile, PG/room management, bill creation and history, payment proof submission/verification, receipts, notifications, messaging, ads/notices, and agreement flows.

## Data-safety scope and limitations
This migration is additive and idempotent for the schema it manages. It does not import a dump, truncate tables, or issue `DELETE`/`UPDATE` statements against tenant, bill, payment, room, or PG business records. DDL such as `ALTER TABLE` may take metadata locks and MySQL DDL is not generally transactionally reversible. The migration does intentionally drop the old unique index if present, because the app requirement allows multiple bills per tenant/month; that changes a constraint, not existing rows.

No ZIP-only inspection can guarantee zero risk on an untested production database. Foreign-key constraints, permissions, server SQL mode, and schema drift can still cause a migration to stop. Always take and verify a backup, and ideally test against a restored staging copy first. Do not describe this as a verified live migration until it has actually run successfully against the intended database.

## Environment variables
Set production variables in Render/Railway settings, not in this ZIP. `DB_HOST`, `DB_PORT`, `DB_NAME`, `DB_USER`, `DB_PASSWORD`, `JWT_SECRET`, email, Cloudinary, Firebase, and payment gateway credentials must be supplied securely by the deployment platform.
