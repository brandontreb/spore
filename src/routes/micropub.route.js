const express = require('express');
const { micropubController } = require('../controllers');
const indieAuth = require('../middlewares/indieAuth');
const upload = require('../middlewares/upload.middleware');

const router = express.Router();

router.route('/')
  .post(indieAuth('create'), micropubController.create)
  .get(indieAuth('create'), micropubController.create);

router.route('/media')
  .post(indieAuth('create'), upload.fields(['file', 'video', 'photo', 'audio', 'video[]', 'photo[]', 'audio[]'].map(type => ({ name: type }))), micropubController.media)
  .get(micropubController.getMedia);

module.exports = router;