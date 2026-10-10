-- Livinkey production billing: room-based billing with multiple outstanding bills.
-- Run once against the existing database. Existing bill/payment history is preserved.

ALTER TABLE bills
    ADD COLUMN room_id INT NULL AFTER tenant_id;

ALTER TABLE bills
    DROP INDEX uq_bills_active_billing_period;

ALTER TABLE bills
    ADD KEY idx_bills_room_id (room_id),
    ADD CONSTRAINT fk_bills_room_id
        FOREIGN KEY (room_id) REFERENCES rooms(id) ON DELETE SET NULL;
