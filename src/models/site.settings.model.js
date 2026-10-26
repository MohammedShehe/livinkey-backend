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

module.exports = {
  KEYS,
  getAllSettings,
  updateManualStats,
};
