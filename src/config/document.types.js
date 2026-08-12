// Document types for international tenants
const INTERNATIONAL_DOCUMENTS = [
    { key: 'passport_photo', label: 'Passport Size Photo', required: true },
    { key: 'passport', label: 'Passport', required: true },
    { key: 'visa', label: 'Visa', required: true },
    { key: 'arrival_stamp', label: 'Arrival Stamp', required: true },
    { key: 'c_form', label: 'C-Form', required: true },
    { key: 'efrro', label: 'E-FRRO', required: true },
    { key: 'university_id', label: 'University ID', required: false }
];

// Document types for national tenants (Indians)
const NATIONAL_DOCUMENTS = [
    { key: 'passport_photo', label: 'Passport Size Photo', required: true },
    { key: 'tenant_aadhaar', label: 'Tenant Aadhaar Card', required: true },
    { key: 'parent_aadhaar', label: 'Parent Aadhaar Card', required: true },
    { key: 'university_id', label: 'University ID', required: false }
];

// All document types mapping
const DOCUMENT_TYPES = {
    passport_photo: { label: 'Passport Size Photo', category: 'photos' },
    passport: { label: 'Passport', category: 'passports' },
    visa: { label: 'Visa', category: 'visas' },
    arrival_stamp: { label: 'Arrival Stamp', category: 'arrival_stamps' },
    c_form: { label: 'C-Form', category: 'c_forms' },
    efrro: { label: 'E-FRRO', category: 'efrros' },
    tenant_aadhaar: { label: 'Tenant Aadhaar Card', category: 'aadhaars' },
    parent_aadhaar: { label: 'Parent Aadhaar Card', category: 'aadhaars' },
    university_id: { label: 'University ID', category: 'university_ids' }
};

module.exports = {
    INTERNATIONAL_DOCUMENTS,
    NATIONAL_DOCUMENTS,
    DOCUMENT_TYPES
};