const express = require('express');
const { indieAuthController } = require('../../controllers/indieWeb');
const auth = require('../../middlewares/auth.middleware');

const router = express.Router();

router.get('/authorize', auth(true), indieAuthController.authorize);
router.get('/approve', auth(true), indieAuthController.approve);
router.post('/token', auth(false), indieAuthController.token);
router.get('/token', indieAuthController.verifyToken);

module.exports = router;