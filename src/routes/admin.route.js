const express = require('express');
const validate = require('../middlewares/validate');
const { adminController } = require('../controllers');
const { adminValidation } = require('../validations');
const auth = require('../middlewares/auth.middleware');

const router = express.Router();

router
  .route('/')
  .get(auth(true), adminController.getAdmin)
  .put(auth(true), validate(adminValidation.updateBlog), adminController.updateBlog);

router.route('/install')
  .get(auth(false), adminController.install)
  .post(validate(adminValidation.install), adminController.install);

router.use('/auth', require('./auth.route'));
router.use('/import', require('./import.route'));
router.use('/account', require('./account.route'));

module.exports = router;