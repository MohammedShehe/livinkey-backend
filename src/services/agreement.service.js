const crypto = require('crypto');
const db = require('../config/db');

const DEFAULT_TEMPLATE = 'I {TENANT_NAME} totally agree to stay in this PG for {STAYING_PERIOD}. I won’t go out unless I have informed the management and followed the terms of my agreement. I agree to contact the Super Admin if I need an extension.';

const formatDate = (value) => {
  if (!value) return '';
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return '';
  return `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}-${String(d.getDate()).padStart(2,'0')}`;
};

const buildAgreement = (row) => {
  const months = Number(row.period_of_stay || 0);
  const stayingPeriod = months === 1 ? '1 Month' : `${months} Months`;
  const template = row.tenant_agreement_text || DEFAULT_TEMPLATE;
  const values = {
    TENANT_NAME: row.full_name || '',
    STAYING_PERIOD: stayingPeriod,
    PG_NAME: row.pg_name || '',
    ROOM_NUMBER: row.room_number || '',
    ARRIVAL_DATE: formatDate(row.arrival_date),
    RESIDENCY: row.residency || '',
    NATIONALITY: row.nationality || '',
    RENT: row.rent != null ? String(row.rent) : '',
    SECURITY_FEE: row.security_fee != null ? String(row.security_fee) : '',
    PAYMENT_DATE: row.payment_date != null ? String(row.payment_date) : ''
  };
  const text = template.replace(/\{([A-Z0-9_]+)\}/g, (match, key) => Object.prototype.hasOwnProperty.call(values, key) ? values[key] : match);
  // Hash the fully rendered agreement, including the current Admin template text
  // and every tenant-specific placeholder value. Any Admin edit or relevant
  // tenant data change therefore produces a new hash and requires re-acceptance.
  const hash = crypto.createHash('sha256').update(`${row.pg_id || ''}|${text}`, 'utf8').digest('hex');
  return { enabled: Number(row.tenant_agreement_enabled) !== 0, template, text, hash, values };
};

const getTenantAgreement = async (tenantId) => {
  const [rows] = await db.execute(`
    SELECT t.id, t.full_name, t.nationality, td.pg_id, td.room_id, td.residency, td.period_of_stay,
           td.arrival_date, td.rent, td.security_fee, td.payment_date,
           p.name AS pg_name, p.tenant_agreement_enabled, p.tenant_agreement_text,
           r.room_number
    FROM tenants t
    LEFT JOIN tenant_details td ON td.tenant_id = t.id
    LEFT JOIN pgs p ON p.id = td.pg_id
    LEFT JOIN rooms r ON r.id = td.room_id
    WHERE t.id = ? AND t.role = 'tenant' AND t.is_active = 1
    LIMIT 1`, [tenantId]);
  if (!rows.length) return null;
  const agreement = buildAgreement(rows[0]);
  const [accepted] = await db.execute(`SELECT id, accepted_at FROM tenant_agreement_acceptances WHERE tenant_id = ? AND agreement_hash = ? LIMIT 1`, [tenantId, agreement.hash]);
  return { ...agreement, accepted: accepted.length > 0, accepted_at: accepted[0]?.accepted_at || null, pg_id: rows[0].pg_id };
};

const acceptTenantAgreement = async (tenantId, ipAddress, userAgent) => {
  const agreement = await getTenantAgreement(tenantId);
  if (!agreement) throw new Error('Tenant agreement not found.');
  if (!agreement.enabled) return agreement;
  await db.execute(`
    INSERT INTO tenant_agreement_acceptances (tenant_id, pg_id, agreement_hash, agreement_text, ip_address, user_agent)
    VALUES (?, ?, ?, ?, ?, ?)
    ON DUPLICATE KEY UPDATE accepted_at = CURRENT_TIMESTAMP, ip_address = VALUES(ip_address), user_agent = VALUES(user_agent), agreement_text = VALUES(agreement_text)`,
    [tenantId, agreement.pg_id, agreement.hash, agreement.text, ipAddress || null, userAgent || null]);
  return { ...agreement, accepted: true };
};

module.exports = { DEFAULT_TEMPLATE, buildAgreement, getTenantAgreement, acceptTenantAgreement };
