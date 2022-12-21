const express = require('express');
const router = express.Router();
const { importController } = require('../controllers');
const auth = require('../middlewares/auth.middleware');

const multer = require('multer');
const storage = multer.memoryStorage();
const upload = multer({ storage: storage, putSingleFilesInArray: true });


router.get('/', auth(true), importController.index);
router.post('/markdown', auth(true), upload.single('zip_file'), importController.markdown);

module.exports = router;