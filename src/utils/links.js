/**
 * Central place for every public URL used in emails, WhatsApp messages and
 * payment callbacks, so a link is never built from the wrong base.
 *
 *  API_URL      – the public API (what the mobile app and admin panel call)
 *  WEBSITE_URL  – public marketing website
 *  ADMIN_URL    – admin console
 *  APP_STORE_URL – where tenants/guests can get the mobile app
 */
const trim = (v) => String(v || "").replace(/\/+$/, "");

const API_URL = trim(process.env.PUBLIC_API_URL) || "https://api.livinkey.com";
const WEBSITE_URL = trim(process.env.WEBSITE_URL) || "https://livinkey.com";
const ADMIN_URL = trim(process.env.ADMIN_URL) || "https://admin.livinkey.com";
const APP_STORE_URL = trim(process.env.APP_STORE_URL) || "https://play.google.com/store/apps/details?id=com.livinkey.app";

module.exports = { API_URL, WEBSITE_URL, ADMIN_URL, APP_STORE_URL };
