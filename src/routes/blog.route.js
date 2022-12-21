const express = require('express');
const auth = require('../middlewares/auth.middleware');
const { blogController } = require('../controllers');

const router = express.Router();

router.route('/').get(auth(false), blogController.index)
router.get('/replies', auth(false), blogController.getReplies);


router.route('/:slug').get(auth(false), blogController.getPost)
router.get('/:year?/:month?/:day?/:slug', auth(false), blogController.getPost);

module.exports = router;