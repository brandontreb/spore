const express = require('express');
const router = express.Router();
const { importController } = require('../controllers');

const multer = require('multer');
const storage = multer.memoryStorage();
const upload = multer({ storage: storage, putSingleFilesInArray: true });


router.get('/', importController.index);
router.post('/markdown', upload.single('zip_file'), importController.markdown);

module.exports = router;