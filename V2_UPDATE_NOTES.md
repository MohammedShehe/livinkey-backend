# V2 update – backend

Everything below is created/updated automatically when the server starts (`schema.bootstrap.js`). No manual SQL is needed.
Documents that existed before this update are marked **approved** the first time it runs.

## New / changed
- **Push to guests**: guest notifications now send a real FCM push (shows in the phone's notification panel, even when the app is closed). Dead device tokens are deactivated automatically. Duplicate pushes removed. Requires `ENABLE_PUSH_NOTIFICATIONS=true` (already set).
- **PG offers**: `pg_offers` table. Admin API `GET/POST /api/pgs/:id/offers`, `PUT /:offerId`, `PATCH /:offerId/toggle`, `DELETE /:offerId` (needs PGs → edit). Public PG list/detail now include `offers`, `has_offer`, `best_offer` (live offers only). Turning on an offer notifies guests.
- **Expenses**: `expenses` table + new **Expenses** permission module. `/api/expenses` (list, stats, meta, create, update, delete; receipt upload).
- **Electricity formula per PG**: `pg_electricity_settings`. `/api/electricity/settings` (Super Admin edits), `/calculate`, `/last-reading`. Creating a bill with `previous_reading` + `current_reading` makes the server compute the amount from the PG formula and store the readings on the bill.
- **PG-wise dashboard**: `GET /api/admins/analytics?pg_id=&period=`.
- **Document review**: documents now have `review_status` (pending / approved / rejected), review note, reviewer, "new" flag. `POST /api/documents/admin/:id/review`, `/review/bulk`, `/mark-seen`, `GET /review-summary`. Admins are notified of uploads; tenants are notified of approval/rejection and can re-upload rejected documents.
- Tenant notification `type` list widened (document_approved/rejected, payment_proof_*).

## Existing admins
New **Expenses** permission is OFF for existing sub-admins. Enable it under Admins → permissions.
