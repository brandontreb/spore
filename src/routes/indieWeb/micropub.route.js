const express = require('express');
const { micropubController } = require('../../controllers/indieWeb');
const indieAuth = require('../../middlewares/indieAuth');
const upload = require('../../middlewares/upload.middleware');
const auth = require('../../middlewares/auth.middleware');

const router = express.Router();

router.route('/')
  .post(auth(false), indieAuth('create'), micropubController.create)
  .get(auth(false), indieAuth('create'), micropubController.create);

router.route('/media')
  .post(auth(false), indieAuth('create'), upload.fields(['file', 'video', 'photo', 'audio', 'video[]', 'photo[]', 'audio[]'].map(type => ({ name: type }))), micropubController.media)
  .get(auth(false), micropubController.getMedia);

module.exports = router;