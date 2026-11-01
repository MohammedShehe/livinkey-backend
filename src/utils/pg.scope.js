/**
 * Shared SQL fragments so every report works out "which PG does this belong to"
 * the same way.
 *
 * A bill belongs to the PG of its room (bills.room_id -> rooms -> floors) when a
 * room is recorded, otherwise to the PG of the tenant's stay (tenant_details).
 */
const BILL_PG_JOINS = `
    LEFT JOIN rooms _br ON _br.id = b.room_id
    LEFT JOIN floors _bf ON _bf.id = _br.floor_id
    LEFT JOIN tenant_details _btd ON _btd.tenant_id = b.tenant_id
`;
const BILL_PG_EXPR = `COALESCE(_bf.pg_id, _btd.pg_id)`;

/** Normalise ?pg_id= into a positive integer or null (= all PGs). */
const parsePgId = (v) => {
    const n = parseInt(v, 10);
    return Number.isFinite(n) && n > 0 ? n : null;
};

module.exports = { BILL_PG_JOINS, BILL_PG_EXPR, parsePgId };
