// Document types for international tenants
const INTERNATIONAL_DOCUMENTS = [
    { key: 'passport_photo', label: 'Passport Size Photo', required: true },
    { key: 'signature', label: 'Signature', required: true },
    { key: 'passport', label: 'Passport', required: true },
    { key: 'visa', label: 'Visa', required: true },
    { key: 'arrival_stamp', label: 'Arrival Stamp', required: true },
    { key: 'c_form', label: 'C-Form', required: true },
    { key: 'efrro', label: 'E-FRRO', required: true },
    { key: 'university_id', label: 'University ID', required: false },
    { key: 'agreement', label: 'Agreement', required: true }
];

// Document types for national tenants (Indians)
const NATIONAL_DOCUMENTS = [
    { key: 'passport_photo', label: 'Passport Size Photo', required: true },
    { key: 'signature', label: 'Signature', required: true },
    { key: 'tenant_aadhaar', label: 'Tenant Aadhaar Card', required: true },
    { key: 'parent_aadhaar', label: 'Parent Aadhaar Card', required: true },
    { key: 'university_id', label: 'University ID', required: false },
    { key: 'agreement', label: 'Agreement', required: true }
];

// Vehicle documents – available to every tenant who has a vehicle
// vehicle_number is stored as text on tenant_details, not as an image document
const VEHICLE_DOCUMENTS = [
    { key: 'vehicle_photo', label: 'Vehicle Photo', required: true },
    { key: 'vehicle_rc', label: 'RC Photo', required: true },
    { key: 'driver_license', label: 'Driver License', required: true }
];

// All document types mapping
const DOCUMENT_TYPES = {
    passport_photo: { label: 'Passport Size Photo', category: 'photos' },
    signature: { label: 'Signature', category: 'signatures' },
    passport: { label: 'Passport', category: 'passports' },
    visa: { label: 'Visa', category: 'visas' },
    arrival_stamp: { label: 'Arrival Stamp', category: 'arrival_stamps' },
    c_form: { label: 'C-Form', category: 'c_forms' },
    efrro: { label: 'E-FRRO', category: 'efrros' },
    tenant_aadhaar: { label: 'Tenant Aadhaar Card', category: 'aadhaars' },
    parent_aadhaar: { label: 'Parent Aadhaar Card', category: 'aadhaars' },
    university_id: { label: 'University ID', category: 'university_ids' },
    agreement: { label: 'Agreement', category: 'agreements' },
    // Vehicle
    vehicle_photo: { label: 'Vehicle Photo', category: 'vehicle' },
    vehicle_rc: { label: 'RC Photo', category: 'vehicle' },
    driver_license: { label: 'Driver License', category: 'vehicle' }
};

const VEHICLE_DOCUMENT_KEYS = VEHICLE_DOCUMENTS.map(d => d.key);

module.exports = {
    INTERNATIONAL_DOCUMENTS,
    NATIONAL_DOCUMENTS,
    VEHICLE_DOCUMENTS,
    VEHICLE_DOCUMENT_KEYS,
    DOCUMENT_TYPES
};
