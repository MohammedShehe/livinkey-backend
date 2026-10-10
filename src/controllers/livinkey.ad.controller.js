const adModel = require("../models/livinkey.ad.model");
const uploadService = require("../services/upload.service");

const MAX_ACTIVE = 5;
const MAX_IMAGES = 5;
const normalizeDate = value => /^\d{4}-\d{2}-\d{2}$/.test(String(value || "")) ? String(value) : null;
const bool = value => value === true || value === 'true' || value === '1' || value === 1;

const normalizeLinkUrl = value => {
  const raw = String(value || '').trim();
  if (!raw) return null;
  // Allow http/https only
  try {
    const u = new URL(raw.startsWith('http://') || raw.startsWith('https://') ? raw : `https://${raw}`);
    if (u.protocol !== 'http:' && u.protocol !== 'https:') return null;
    return u.toString();
  } catch (_) {
    return null;
  }
};

const getAll = async (req, res) => {
  try {
    return res.json({ success: true, data: await adModel.getAll() });
  } catch (e) {
    console.error('Get ads error:', e);
    return res.status(500).json({ success: false, message: 'Unable to load advertisements.' });
  }
};

const uploadImages = async files => {
  const uploaded = [];
  try {
    for (const file of files) {
      if (!file.mimetype?.startsWith('image/')) throw new Error('Only image files are allowed for advertisements.');
      const result = await uploadService.uploadFile(file, 'livinkey/ads');
      uploaded.push({
        url: result.secure_url,
        public_id: result.public_id,
        resource_type: result.resource_type || 'image'
      });
    }
    return uploaded;
  } catch (e) {
    for (const x of uploaded) {
      if (x.public_id) await uploadService.deleteFile(x.public_id, x.resource_type).catch(() => {});
    }
    throw e;
  }
};

const validatePayload = (req, res) => {
  const title = String(req.body.title || '').trim();
  const validTill = normalizeDate(req.body.valid_till);
  if (!title) {
    res.status(400).json({ success: false, message: 'Advertisement title is required.' });
    return null;
  }
  if (!validTill) {
    res.status(400).json({ success: false, message: 'A valid Valid Till date is required.' });
    return null;
  }
  if (validTill < new Date().toISOString().slice(0, 10)) {
    res.status(400).json({ success: false, message: 'Valid Till cannot be in the past.' });
    return null;
  }

  const linkRaw = String(req.body.link_url || '').trim();
  let linkUrl = null;
  if (linkRaw) {
    linkUrl = normalizeLinkUrl(linkRaw);
    if (!linkUrl) {
      res.status(400).json({ success: false, message: 'Link URL must be a valid http or https URL.' });
      return null;
    }
  }

  return {
    title,
    validTill,
    isEnabled: bool(req.body.is_enabled),
    linkUrl
  };
};

const create = async (req, res) => {
  try {
    const p = validatePayload(req, res);
    if (!p) return;
    const files = req.files || [];
    if (files.length < 1 || files.length > MAX_IMAGES) {
      return res.status(400).json({ success: false, message: `Upload 1 to ${MAX_IMAGES} advertisement images.` });
    }
    if (p.isEnabled && (await adModel.countActive()) >= MAX_ACTIVE) {
      return res.status(400).json({ success: false, message: `Only ${MAX_ACTIVE} advertisements can be active at once.` });
    }
    const images = await uploadImages(files);
    const all = await adModel.getAll();
    const ad = await adModel.create({
      title: p.title,
      valid_till: p.validTill,
      is_enabled: p.isEnabled,
      images,
      display_order: all.length + 1,
      link_url: p.linkUrl,
      created_by: req.admin.id
    });
    res.status(201).json({ success: true, message: 'Advertisement created successfully.', data: ad });
  } catch (e) {
    console.error('Create ad error:', e);
    res.status(500).json({ success: false, message: e.message || 'Unable to create advertisement.' });
  }
};

const update = async (req, res) => {
  try {
    const id = Number(req.params.id);
    const existing = await adModel.getById(id);
    if (!existing) return res.status(404).json({ success: false, message: 'Advertisement not found.' });
    const p = validatePayload(req, res);
    if (!p) return;
    const files = req.files || [];
    if (files.length > MAX_IMAGES) {
      return res.status(400).json({ success: false, message: `Maximum ${MAX_IMAGES} images allowed.` });
    }
    if (p.isEnabled && !existing.is_enabled && (await adModel.countActive(id)) >= MAX_ACTIVE) {
      return res.status(400).json({ success: false, message: `Only ${MAX_ACTIVE} advertisements can be active at once.` });
    }
    let images = existing.images;
    if (files.length) {
      images = await uploadImages(files);
    }
    const updated = await adModel.update(id, {
      title: p.title,
      valid_till: p.validTill,
      is_enabled: p.isEnabled,
      images,
      link_url: p.linkUrl
    });
    if (files.length) {
      for (const old of existing.images || []) {
        if (old.public_id) await uploadService.deleteFile(old.public_id, old.resource_type || 'image').catch(() => {});
      }
    }
    res.json({ success: true, message: 'Advertisement updated successfully.', data: updated });
  } catch (e) {
    console.error('Update ad error:', e);
    res.status(500).json({ success: false, message: e.message || 'Unable to update advertisement.' });
  }
};

const remove = async (req, res) => {
  try {
    const id = Number(req.params.id);
    const existing = await adModel.getById(id);
    if (!existing) return res.status(404).json({ success: false, message: 'Advertisement not found.' });
    await adModel.remove(id);
    for (const image of existing.images || []) {
      if (image.public_id) await uploadService.deleteFile(image.public_id, image.resource_type || 'image').catch(() => {});
    }
    res.json({ success: true, message: 'Advertisement deleted successfully.' });
  } catch (e) {
    console.error('Delete ad error:', e);
    res.status(500).json({ success: false, message: 'Unable to delete advertisement.' });
  }
};

const reorder = async (req, res) => {
  try {
    const ids = Array.isArray(req.body.ids) ? req.body.ids.map(Number).filter(Number.isInteger) : [];
    if (!ids.length) return res.status(400).json({ success: false, message: 'Advertisement order is required.' });
    await adModel.reorder(ids);
    res.json({ success: true, message: 'Advertisement order saved.' });
  } catch (e) {
    console.error('Reorder ads error:', e);
    res.status(500).json({ success: false, message: 'Unable to save advertisement order.' });
  }
};

const getTenantAds = async (req, res) => {
  try {
    res.json({ success: true, data: await adModel.getActive() });
  } catch (e) {
    console.error('Get tenant ads error:', e);
    res.status(500).json({ success: false, message: 'Unable to load advertisements.' });
  }
};

module.exports = { getAll, create, update, remove, reorder, getTenantAds };
