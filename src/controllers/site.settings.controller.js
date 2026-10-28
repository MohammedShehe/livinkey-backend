const SiteSettingsModel = require("../models/site.settings.model");

/**
 * GET /api/site-settings/manual-stats  (admin)
 */
exports.getManualStats = async (req, res) => {
  try {
    const data = await SiteSettingsModel.getAllSettings();
    return res.json({ success: true, data });
  } catch (error) {
    console.error("Get Manual Stats Error:", error);
    return res.status(500).json({
      success: false,
      message: error.message || "Internal server error",
    });
  }
};

/**
 * PUT /api/site-settings/manual-stats  (admin)
 * body: { manual_stats_enabled, manual_properties_count, manual_happy_tenants_count }
 */
exports.updateManualStats = async (req, res) => {
  try {
    const {
      manual_stats_enabled,
      manual_properties_count,
      manual_happy_tenants_count,
    } = req.body || {};

    if (
      typeof manual_stats_enabled === "undefined" &&
      typeof manual_properties_count === "undefined" &&
      typeof manual_happy_tenants_count === "undefined"
    ) {
      return res.status(400).json({
        success: false,
        message: "Provide at least one field to update",
      });
    }

    if (typeof manual_properties_count !== "undefined") {
      const n = Number(manual_properties_count);
      if (!Number.isFinite(n) || n < 0 || n > 10000000) {
        return res.status(400).json({
          success: false,
          message: "manual_properties_count must be a number between 0 and 10,000,000",
        });
      }
    }
    if (typeof manual_happy_tenants_count !== "undefined") {
      const n = Number(manual_happy_tenants_count);
      if (!Number.isFinite(n) || n < 0 || n > 10000000) {
        return res.status(400).json({
          success: false,
          message: "manual_happy_tenants_count must be a number between 0 and 10,000,000",
        });
      }
    }

    const data = await SiteSettingsModel.updateManualStats({
      manual_stats_enabled:
        typeof manual_stats_enabled !== "undefined"
          ? !!manual_stats_enabled &&
            manual_stats_enabled !== "0" &&
            manual_stats_enabled !== "false"
          : undefined,
      manual_properties_count,
      manual_happy_tenants_count,
    });

    return res.json({
      success: true,
      message: "Website stats settings updated",
      data,
    });
  } catch (error) {
    console.error("Update Manual Stats Error:", error);
    return res.status(500).json({
      success: false,
      message: error.message || "Internal server error",
    });
  }
};

/**
 * GET /api/site-settings/website   (admin)
 * PUT /api/site-settings/website   (admin) — partial update, validated
 */
exports.getWebsiteSettings = async (req, res) => {
  try {
    const data = await SiteSettingsModel.getWebsiteSettings();
    return res.json({ success: true, data });
  } catch (error) {
    console.error("Get Website Settings Error:", error);
    return res.status(500).json({ success: false, message: error.message || "Internal server error" });
  }
};

exports.updateWebsiteSettings = async (req, res) => {
  try {
    const { values, errors } = SiteSettingsModel.validateWebsitePatch(req.body || {});
    if (Object.keys(errors).length) {
      return res.status(400).json({ success: false, message: "Some settings are invalid", errors });
    }
    if (!Object.keys(values).length) {
      return res.status(400).json({ success: false, message: "Provide at least one setting to update" });
    }
    const who = req.admin?.name || req.admin?.email || `Admin #${req.admin?.id}`;
    const data = await SiteSettingsModel.updateWebsiteSettings(values, who);
    return res.json({ success: true, message: "Website settings saved", data });
  } catch (error) {
    console.error("Update Website Settings Error:", error);
    return res.status(500).json({ success: false, message: error.message || "Internal server error" });
  }
};

/** GET /api/public/site-config  (no auth, cacheable) */
exports.getPublicConfig = async (req, res) => {
  try {
    const data = await SiteSettingsModel.getPublicConfig();
    res.set("Cache-Control", "public, max-age=30");
    return res.json({ success: true, data });
  } catch (error) {
    console.error("Public Config Error:", error);
    // Fail open: the public site must keep working if settings are unreachable.
    return res.json({ success: true, data: null });
  }
};
