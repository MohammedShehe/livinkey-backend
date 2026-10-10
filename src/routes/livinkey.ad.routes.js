const express=require('express');
const router=express.Router();
const controller=require('../controllers/livinkey.ad.controller');
const auth=require('../middleware/auth.middleware');
const tenantAuth=require('../middleware/tenant.auth.middleware');
const role=require('../middleware/role.middleware');
const permission=require('../middleware/permission.middleware');
const upload=require('../middleware/upload.middleware');

router.get('/tenant', tenantAuth, controller.getTenantAds);
router.use(auth, role('super_admin','admin'));
router.get('/', permission('ads','view'), controller.getAll);
router.post('/', permission('ads','add'), upload.array('images',5), controller.create);
router.post('/reorder', permission('ads','edit'), controller.reorder);
router.put('/:id', permission('ads','edit'), upload.array('images',5), controller.update);
router.delete('/:id', permission('ads','delete'), controller.remove);
module.exports=router;
