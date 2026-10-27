const db = require("../config/db");

const KEYS = {
  ENABLED: "manual_stats_enabled",
  PROPERTIES: "manual_properties_count",
  TENANTS: "manual_happy_tenants_count",
};

async function getAllSettings() {
  const [rows] = await db.execute(
    `SELECT setting_key, setting_value FROM site_settings
     WHERE setting_key IN (?, ?, ?)`,
    [KEYS.ENABLED, KEYS.PROPERTIES, KEYS.TENANTS]
  );
  const map = {};
  for (const r of rows) map[r.setting_key] = r.setting_value;

  const enabled = map[KEYS.ENABLED] === "1" || map[KEYS.ENABLED] === "true";
  const manualProperties = parseInt(map[KEYS.PROPERTIES] || "0", 10) || 0;
  const manualTenants = parseInt(map[KEYS.TENANTS] || "0", 10) || 0;

  return {
    manual_stats_enabled: enabled,
    manual_properties_count: manualProperties,
    manual_happy_tenants_count: manualTenants,
  };
}

async function upsertSetting(key, value) {
  await db.execute(
    `INSERT INTO site_settings (setting_key, setting_value)
     VALUES (?, ?)
     ON DUPLICATE KEY UPDATE setting_value = VALUES(setting_value)`,
    [key, String(value)]
  );
}

async function updateManualStats({ manual_stats_enabled, manual_properties_count, manual_happy_tenants_count }) {
  if (typeof manual_stats_enabled !== "undefined") {
    await upsertSetting(KEYS.ENABLED, manual_stats_enabled ? "1" : "0");
  }
  if (typeof manual_properties_count !== "undefined") {
    const n = Math.max(0, parseInt(manual_properties_count, 10) || 0);
    await upsertSetting(KEYS.PROPERTIES, String(n));
  }
  if (typeof manual_happy_tenants_count !== "undefined") {
    const n = Math.max(0, parseInt(manual_happy_tenants_count, 10) || 0);
    await upsertSetting(KEYS.TENANTS, String(n));
  }
  return getAllSettings();
}

// ============================================================
// Website control settings (public site configuration)
// ============================================================
const WEBSITE_FIELDS = {
  site_name:            { type: "string",  max: 80 },
  site_tagline:         { type: "string",  max: 200 },
  contact_phone:        { type: "string",  max: 30 },
  contact_whatsapp:     { type: "string",  max: 20 },
  contact_email:        { type: "email",   max: 150 },
  contact_address:      { type: "string",  max: 300 },
  social_instagram:     { type: "url",     max: 300 },
  social_facebook:      { type: "url",     max: 300 },
  announcement_enabled: { type: "bool" },
  announcement_text:    { type: "string",  max: 300 },
  announcement_link:    { type: "url",     max: 300 },
  announcement_type:    { type: "enum",    values: ["info", "success", "warning", "danger"] },
  maintenance_mode:     { type: "bool" },
  maintenance_message:  { type: "string",  max: 400 },
  show_chatbot:         { type: "bool" },
  show_reviews:         { type: "bool" },
  show_stats:           { type: "bool" },
};

const WEBSITE_KEYS = Object.keys(WEBSITE_FIELDS);
const BOOL_KEYS = WEBSITE_KEYS.filter(k => WEBSITE_FIELDS[k].type === "bool");

function normalise(map) {
  const out = {};
  for (const k of WEBSITE_KEYS) {
    const raw = map[k];
    if (BOOL_KEYS.includes(k)) out[k] = raw === "1" || raw === "true";
    else out[k] = raw == null ? "" : String(raw);
  }
  return out;
}

async function getWebsiteSettings() {
  const placeholders = WEBSITE_KEYS.map(() => "?").join(",");
  const [rows] = await db.execute(
    `SELECT setting_key, setting_value, updated_at, updated_by FROM site_settings
     WHERE setting_key IN (${placeholders})`,
    WEBSITE_KEYS
  );
  const map = {};
  let lastUpdated = null, lastBy = null;
  for (const r of rows) {
    map[r.setting_key] = r.setting_value;
    if (!lastUpdated || new Date(r.updated_at) > new Date(lastUpdated)) {
      lastUpdated = r.updated_at; lastBy = r.updated_by;
    }
  }
  return { settings: normalise(map), updated_at: lastUpdated, updated_by: lastBy };
}

/** Validate + coerce an incoming patch. Returns { values, errors }. */
function validateWebsitePatch(body = {}) {
  const values = {};
  const errors = {};
  for (const [key, spec] of Object.entries(WEBSITE_FIELDS)) {
    if (typeof body[key] === "undefined") continue;
    let v = body[key];
    if (spec.type === "bool") {
      values[key] = (v === true || v === "1" || v === 1 || v === "true") ? "1" : "0";
      continue;
    }
    v = String(v ?? "").trim();
    if (spec.max && v.length > spec.max) { errors[key] = `Must be ${spec.max} characters or fewer`; continue; }
    if (spec.type === "email" && v && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v)) { errors[key] = "Enter a valid email address"; continue; }
    if (spec.type === "url" && v && !/^https?:\/\/[^\s]+$/i.test(v)) { errors[key] = "Must start with http:// or https://"; continue; }
    if (spec.type === "enum" && !spec.values.includes(v)) { errors[key] = `Must be one of: ${spec.values.join(", ")}`; continue; }
    values[key] = v;
  }
  return { values, errors };
}

async function updateWebsiteSettings(values, updatedBy = null) {
  for (const [key, value] of Object.entries(values)) {
    await db.execute(
      `INSERT INTO site_settings (setting_key, setting_value, updated_by)
       VALUES (?, ?, ?)
       ON DUPLICATE KEY UPDATE setting_value = VALUES(setting_value), updated_by = VALUES(updated_by)`,
      [key, String(value), updatedBy]
    );
  }
  invalidatePublicCache();
  return getWebsiteSettings();
}

// Tiny in-memory cache so the public site never hammers the database.
let _publicCache = { at: 0, data: null };
function invalidatePublicCache() { _publicCache = { at: 0, data: null }; }

async function getPublicConfig() {
  if (_publicCache.data && Date.now() - _publicCache.at < 15000) return _publicCache.data;
  const { settings } = await getWebsiteSettings();
  const data = {
    site_name: settings.site_name,
    site_tagline: settings.site_tagline,
    contact: {
      phone: settings.contact_phone,
      whatsapp: settings.contact_whatsapp,
      email: settings.contact_email,
      address: settings.contact_address,
    },
    social: { instagram: settings.social_instagram, facebook: settings.social_facebook },
    announcement: {
      enabled: settings.announcement_enabled && !!settings.announcement_text,
      text: settings.announcement_text,
      link: settings.announcement_link,
      type: settings.announcement_type || "info",
    },
    maintenance: { enabled: settings.maintenance_mode, message: settings.maintenance_message },
    features: {
      chatbot: settings.show_chatbot,
      reviews: settings.show_reviews,
      stats: settings.show_stats,
    },
  };
  _publicCache = { at: Date.now(), data };
  return data;
}

module.exports = {
  KEYS,
  WEBSITE_FIELDS,
  getAllSettings,
  updateManualStats,
  getWebsiteSettings,
  validateWebsitePatch,
  updateWebsiteSettings,
  getPublicConfig,
  invalidatePublicCache,
};
