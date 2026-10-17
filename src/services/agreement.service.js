const crypto = require('crypto');
const db = require('../config/db');

const AGREEMENT_TERMS = [
  'Tenant shall occupy premises for residential purpose only and not for any other purpose without prior written permission/consent of the owner.',
  'Tenant shall return the room in the same condition as it was given at the time of rent agreement. Fixed Rs. 500/- checkout fee is compulsory.',
  'Tenant shall not make any addition/alteration in the rented premises without prior consent/permission of the owner and shall not do work which will cause damage.',
  'Tenant shall pay rent monthly in the first week of every month on or before the 7th day. Late payment fine: Rs. 100/- per day until payment is received.',
  "Tenant cannot vacate before completion of the agreed 10/12-month lock-in and shall give one month's prior notice before vacating.",
  'Tenant shall provide two identity proofs along with a passport-size photograph.',
  'In case of any dispute, the matter shall be referred to Phagwara Court only.',
  'Tenant is responsible for any illegal work done in PG premises/room (drugs, fighting or any other illegal work).',
  'If tenant is found violating the rules, owner has the right to terminate the agreement and require the tenant to vacate the same day.',
  'Electricity bill shall be paid on or before the 5th of every month.',
  'Tenant must not misbehave with any staff members of LIVINKEY.',
  'Fixed maintenance charges of Rs. 300/- will be taken every month.',
  'Security deposit will be refunded upon receipt of written notice to vacate at least one month prior to the end of the lock-in period.',
  'Wi-Fi is not an inclusive service provided by LIVINKEY; it is an additional service and LIVINKEY does not guarantee it.',
  'No loud music, parties or disturbances are allowed inside the PG premises.',
  'LIVINKEY is not responsible for anything stolen inside/outside the room from common areas.',
  'Outsiders are not allowed to stay overnight. Only parents are allowed with prior permission.',
  'If anything in the room is broken, damaged or stolen, the tenant is responsible and double the amount will be charged.',
  'If the tenant loses the door keys, the tenant must pay Rs. 2,000/-.',
  'The source agreement states that the first party/owner will not take responsibility in case of injury, mishap or death.',
  'If the sub-meter fails, the average charge will be taken.',
  'Police verification is the responsibility of the tenant.',
  'For international students, C Form is necessary and must be taken 30 days before visa expiry.',
  'If the tenant stays beyond the agreement tenure, even for a single day, Rs. 800/- per day will be charged.',
  'If rent remains unpaid and tenant fails to respond to LIVINKEY messages or calls for 15 days, LIVINKEY reserves the right to break the lock and vacate the room.'
];

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
    PAYMENT_DATE: row.payment_date != null ? String(row.payment_date) : '',
    MOBILE_NO: [row.country_code, row.phone].filter(Boolean).join(' '),
    PARENTS_NO: row.parent_phone || '',
    AADHAR_PASSPORT_VISA_NO: row.aadhaar_id || row.passport_visa_no || '',
    GENDER: row.gender || '',
    ROOM_NO: row.room_number || '',
    APARTMENT_NAME: row.pg_name || '',
    JOINING_DATE: formatDate(row.arrival_date),
    STARTING_METER_READING: row.starting_meter_reading || ''
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
    SELECT t.id, t.full_name, t.nationality, t.gender, t.phone, t.country_code, t.parent_phone, td.aadhaar_id, td.c_form_number, td.pg_id, td.room_id, td.residency, td.period_of_stay,
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

module.exports = { DEFAULT_TEMPLATE, AGREEMENT_TERMS, buildAgreement, getTenantAgreement, acceptTenantAgreement };
