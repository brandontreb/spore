const express = require('express');
const { indieAuthController } = require('../controllers');
// const auth = require('../middlewares/auth');

const router = express.Router();

router.get('/authorize', indieAuthController.authorize);
router.get('/approve', indieAuthController.approve);
router.post('/token', indieAuthController.token);

// router.get('/authorize', auth(true), indieAuthController.authorize);
// router.get('/approve', auth(true), indieAuthController.approve);
// router.post('/authorize', indieAuthController.token);
// router.post('/token', indieAuthController.token);
// router.get('/token', indieAuthController.verifyToken);

module.exports = router;