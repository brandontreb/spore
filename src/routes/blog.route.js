const express = require('express');
const auth = require('../middlewares/auth.middleware');
const { blogController } = require('../controllers');

const router = express.Router();

router.route('/').get(auth(false), blogController.index)
router.route('/*').get(auth(false), blogController.post)

module.exports = router;